/* ═══════════════════════════════════════════════════════════════
   PMAS — Database Layer (localStorage wrapper)
   Offline-first: data lives on the device by default. The optional
   Account & Cloud Sync (api.js) sends selected records only to the
   PMAS server the user connects to. Not encrypted storage.
   ═══════════════════════════════════════════════════════════════ */

/* ── Safe localStorage wrapper ───────────────────────────── */
const DB = {
  PREFIX: 'pmas_',
  VERSION: '1.1.0',

  get(k) {
    try {
      return JSON.parse(localStorage.getItem(this.PREFIX + k));
    } catch(e) {
      console.warn('DB read error for key:', k, e);
      return null;
    }
  },

  set(k, v) {
    try {
      localStorage.setItem(this.PREFIX + k, JSON.stringify(v));
    } catch(e) {
      showToast('Storage error');
    }
  },

  del(k) {
    localStorage.removeItem(this.PREFIX + k);
  },

  clearAll() {
    const keys = [
      'profile', 'medications', 'symptoms', 'appointments',
      'consent', 'adherence', 'study_meta', 'reminder_state'
    ];
    keys.forEach(k => localStorage.removeItem(this.PREFIX + k));
    // Adherence keeps an in-memory cache (see below) — drop it so a
    // cleared device doesn't serve stale dose history.
    if (typeof Adherence !== 'undefined') Adherence._invalidate();
  }
};

/* ── Study ID Assignment ──────────────────────────────────── */
/* Patient identity is maintained separately from the research dataset.
   Study ID is assigned on first consent and persists. */
const StudyID = {
  get() {
    let meta = DB.get('study_meta');
    if (!meta) {
      // Assign next sequential ID
      const nextNum = this.getNextNumber();
      meta = {
        study_id: 'PMAS-' + String(nextNum).padStart(3, '0'),
        assigned_ts: new Date().toISOString(),
        baseline_date: null  // Set when first consent is accepted
      };
      DB.set('study_meta', meta);
    }
    return meta;
  },

  getNextNumber() {
    // Since we're local-only, we use a stored counter
    // In a real study, IDs would be pre-assigned by the research team
    let meta = DB.get('study_meta');
    if (meta && meta.study_id) {
      const match = meta.study_id.match(/PMAS-(\d+)/);
      if (match) return parseInt(match[1]) + 1;
    }
    return 1;
  },

  setBaseline(dateStr) {
    const meta = this.get();
    meta.baseline_date = dateStr || todayStr();
    DB.set('study_meta', meta);
  },

  getStudyDay() {
    /* Study Day 0 = baseline date.
       Study Day 1 = day after baseline, etc.
       This replaces raw dates in the research export. */
    const meta = this.get();
    if (!meta.baseline_date) return 0;
    const baseline = new Date(meta.baseline_date + 'T00:00:00');
    const today = new Date(todayStr() + 'T00:00:00');
    const diffMs = today - baseline;
    return Math.floor(diffMs / 86400000);
  },

  dateToStudyDay(dateStr) {
    const meta = this.get();
    if (!meta.baseline_date) return 0;
    const baseline = new Date(meta.baseline_date + 'T00:00:00');
    const target = new Date(dateStr + 'T00:00:00');
    const diffMs = target - baseline;
    return Math.floor(diffMs / 86400000);
  }
};

/* ── Adherence Data Layer ─────────────────────────────────── */
/* Adherence records are stored separately from medications.
   Each record: { id, med_id, date, slot, status, recorded_ts }
   slot: 'morning' | 'afternoon' | 'night'
   status: 'taken' | 'delayed' | 'missed'

   Performance: the parsed history is cached in memory and indexed by
   `med_id|date|slot`. Previously every getStatus() call re-parsed the
   entire localStorage history — O(n) JSON.parse per lookup, several
   lookups per dose slot per render. After a year of 3 meds × 3 slots
   that was thousands of records re-parsed dozens of times per screen. */
const Adherence = {
  _cache: null,
  _index: null,

  getAll() {
    if (this._cache === null) {
      this._cache = DB.get('adherence') || [];
      this._index = new Map();
      this._cache.forEach(r => this._index.set(r.med_id + '|' + r.date + '|' + r.slot, r));
    }
    return this._cache;
  },

  _invalidate() {
    this._cache = null;
    this._index = null;
  },

  getByDate(dateStr) {
    return this.getAll().filter(a => a.date === dateStr);
  },

  getByDateRange(startDate, endDate) {
    return this.getAll().filter(a => a.date >= startDate && a.date <= endDate);
  },

  record(medId, date, slot, status) {
    const records = this.getAll();
    const key = medId + '|' + date + '|' + slot;
    const entry = {
      med_id: medId,
      date: date,
      slot: slot,
      status: status,
      recorded_ts: new Date().toISOString()
    };
    const existing = this._index.get(key);
    if (existing) {
      // Preserve sync bookkeeping fields (e.g. synced_status) on update
      Object.assign(existing, entry);
    } else {
      records.push(entry);
      this._index.set(key, entry);
    }
    DB.set('adherence', records);
  },

  getStatus(medId, date, slot) {
    this.getAll();  // ensure loaded
    const found = this._index.get(medId + '|' + date + '|' + slot);
    return found ? found.status : null;
  },

  /* Calculate today's adherence percentage */
  getTodayStats() {
    const today = todayStr();
    const meds = DB.get('medications') || [];
    const activeMeds = meds.filter(m => {
      return (!m.start_date || m.start_date <= today) &&
             (!m.end_date || m.end_date >= today);
    });

    let totalScheduled = 0;
    let totalRecorded = 0;
    let takenCount = 0;

    const slots = ['morning', 'afternoon', 'night'];
    activeMeds.forEach(m => {
      slots.forEach(slot => {
        if (!m[slot]) return;
        totalScheduled++;
        const status = this.getStatus(m.id, today, slot);
        if (status) totalRecorded++;
        if (status === 'taken') takenCount++;
      });
    });

    return {
      totalScheduled,
      totalRecorded,
      takenCount,
      adherencePct: totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 0
    };
  },

  /* Calculate weekly adherence (last 7 days) */
  getWeeklyStats() {
    let totalScheduled = 0;
    let takenCount = 0;
    let daysWithRecords = 0;
    const meds = DB.get('medications') || [];
    const slots = ['morning', 'afternoon', 'night'];

    for (let i = 0; i < 7; i++) {
      const dateStr = daysAgoStr(i);
      const activeMeds = meds.filter(m => {
        return (!m.start_date || m.start_date <= dateStr) &&
               (!m.end_date || m.end_date >= dateStr);
      });

      let dayScheduled = 0;
      let dayTaken = 0;

      activeMeds.forEach(m => {
        slots.forEach(slot => {
          if (!m[slot]) return;
          dayScheduled++;
          if (this.getStatus(m.id, dateStr, slot) === 'taken') dayTaken++;
        });
      });

      totalScheduled += dayScheduled;
      takenCount += dayTaken;
      if (dayScheduled > 0) daysWithRecords++;
    }

    return {
      totalScheduled,
      takenCount,
      daysWithRecords,
      adherencePct: totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 0
    };
  }
};
