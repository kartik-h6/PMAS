/* ═══════════════════════════════════════════════════════════════
   PMAS — API Sync Layer (api.js)
   Connects the patient app to the backend.
   Online: syncs to server. Offline: uses localStorage fallback.
   This is the bridge between offline-first and cloud-connected.
   ═══════════════════════════════════════════════════════════════ */

const API = {
  BASE_URL: null,  // Set on init — e.g. https://api.pmas.app
  token: null,
  isOnline: navigator.onLine,

  /* Initialize — load saved token, set base URL */
  init(baseUrl) {
    this.BASE_URL = baseUrl || localStorage.getItem('pmas_api_url');
    this.token = localStorage.getItem('pmas_auth_token');
    
    // Listen for connectivity changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPending();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  },

  /* Check if user is authenticated */
  isAuthenticated() {
    return !!this.token;
  },

  /* ── Auth ──────────────────────────────────────────────── */

  async register(phone, password, language = 'en') {
    const res = await this._fetch('/api/v1/auth/register', {
      method: 'POST',
      body: { phone_number: phone, password, role: 'patient', preferred_language: language }
    });
    if (res.access_token) {
      this.token = res.access_token;
      localStorage.setItem('pmas_auth_token', this.token);
    }
    return res;
  },

  async login(phone, password) {
    const res = await this._fetch('/api/v1/auth/login', {
      method: 'POST',
      body: { phone_number: phone, password }
    });
    if (res.access_token) {
      this.token = res.access_token;
      localStorage.setItem('pmas_auth_token', this.token);
    }
    return res;
  },

  logout() {
    this.token = null;
    localStorage.removeItem('pmas_auth_token');
  },

  /* ── Profile ───────────────────────────────────────────── */

  async saveProfile(profileData) {
    return this._fetch('/api/v1/profile', {
      method: 'POST',
      body: profileData
    });
  },

  async getProfile() {
    return this._fetch('/api/v1/profile', { method: 'GET' });
  },

  /* ── Medications ──────────────────────────────────────── */

  async getMedications() {
    return this._fetch('/api/v1/medications', { method: 'GET' });
  },

  async addMedication(medData) {
    return this._fetch('/api/v1/medications', {
      method: 'POST',
      body: medData
    });
  },

  async deleteMedication(medId) {
    return this._fetch('/api/v1/medications/' + medId, { method: 'DELETE' });
  },

  /* ── Adherence ─────────────────────────────────────────── */

  async recordAdherence(medId, doseDate, slot, status) {
    // Always save to localStorage immediately (offline-first)
    const localKey = 'pmas_adherence';
    let records = JSON.parse(localStorage.getItem(localKey) || '[]');
    const idx = records.findIndex(r =>
      r.med_id === medId && r.date === doseDate && r.slot === slot
    );
    const entry = { med_id: medId, date: doseDate, slot, status, ts: new Date().toISOString() };
    if (idx >= 0) records[idx] = entry;
    else records.push(entry);
    localStorage.setItem(localKey, JSON.stringify(records));

    // Try to sync to server
    if (this.isOnline && this.token) {
      try {
        return await this._fetch('/api/v1/adherence', {
          method: 'POST',
          body: {
            medication_id: medId,
            dose_date: doseDate,
            dose_slot: slot,
            status: status
          }
        });
      } catch (e) {
        // Network failed — data is safe in localStorage, will sync later
        console.warn('Adherence sync failed, saved locally:', e);
      }
    }
    return { status: 'saved_locally' };
  },

  async getTodayAdherence() {
    if (this.isOnline && this.token) {
      return this._fetch('/api/v1/adherence/today', { method: 'GET' });
    }
    // Offline fallback — calculate from localStorage
    return this._localTodayAdherence();
  },

  async getWeeklyAdherence() {
    if (this.isOnline && this.token) {
      return this._fetch('/api/v1/adherence/weekly', { method: 'GET' });
    }
    return this._localWeeklyAdherence();
  },

  /* ── Symptoms ───────────────────────────────────────────── */

  async recordSymptom(symptomData) {
    // Save locally first
    const localKey = 'pmas_symptoms';
    let records = JSON.parse(localStorage.getItem(localKey) || '[]');
    records.push({ ...symptomData, id: 'sym_' + Date.now(), date: symptomData.log_date });
    localStorage.setItem(localKey, JSON.stringify(records));

    // Sync to server
    if (this.isOnline && this.token) {
      try {
        return await this._fetch('/api/v1/telemetry/symptom', {
          method: 'POST',
          body: symptomData
        });
      } catch (e) {
        console.warn('Symptom sync failed, saved locally:', e);
      }
    }
    return { status: 'saved_locally' };
  },

  /* ── Appointments ──────────────────────────────────────── */

  async getAppointments() {
    return this._fetch('/api/v1/appointments', { method: 'GET' });
  },

  async addAppointment(apptData) {
    return this._fetch('/api/v1/appointments', {
      method: 'POST',
      body: apptData
    });
  },

  /* ── Research Export ───────────────────────────────────── */

  async getResearchExport() {
    return this._fetch('/api/v1/research/export', { method: 'GET' });
  },

  /* ── Sync pending data when back online ────────────────── */

  async syncPending() {
    if (!this.token) return;
    console.log('PMAS: Syncing pending data...');

    // Sync adherence records
    const adhRecords = JSON.parse(localStorage.getItem('pmas_adherence') || '[]');
    for (const record of adhRecords) {
      try {
        await this._fetch('/api/v1/adherence', {
          method: 'POST',
          body: {
            medication_id: record.med_id,
            dose_date: record.date,
            dose_slot: record.slot,
            status: record.status
          }
        });
      } catch (e) {
        console.warn('Sync failed for record:', e);
        break; // Stop if server is unreachable
      }
    }

    // Sync symptom records
    const symRecords = JSON.parse(localStorage.getItem('pmas_symptoms') || '[]');
    for (const sym of symRecords) {
      try {
        await this._fetch('/api/v1/telemetry/symptom', {
          method: 'POST',
          body: {
            log_date: sym.date,
            pain_score: sym.pain || 0,
            systolic_bp: sym.bp_sys || null,
            diastolic_bp: sym.bp_dia || null,
            temperature: sym.temp || null,
            weight_kg: sym.weight || null,
            symptoms_observed: sym.symptoms || null,
            side_effects: sym.side_effects || null,
            additional_notes: sym.notes || null
          }
        });
      } catch (e) {
        break;
      }
    }

    console.log('PMAS: Sync complete');
  },

  /* ── Internal fetch wrapper ────────────────────────────── */

  async _fetch(endpoint, options = {}) {
    if (!this.BASE_URL) {
      throw new Error('API base URL not set. Call API.init() first.');
    }

    const url = this.BASE_URL + endpoint;
    const headers = { 'Content-Type': 'application/json' };

    if (this.token) {
      headers['Authorization'] = 'Bearer ' + this.token;
    }

    const config = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'API request failed');
    }

    return data;
  },

  /* ── Local fallback calculations ──────────────────────── */

  _localTodayAdherence() {
    const today = new Date().toISOString().split('T')[0];
    const meds = JSON.parse(localStorage.getItem('pmas_medications') || '[]');
    const records = JSON.parse(localStorage.getItem('pmas_adherence') || '[]')
      .filter(r => r.date === today);

    let scheduled = 0, taken = 0;
    meds.forEach(m => {
      if (m.morning) scheduled++;
      if (m.afternoon) scheduled++;
      if (m.night) scheduled++;
    });
    taken = records.filter(r => r.status === 'taken').length;

    return {
      total_scheduled: scheduled,
      total_taken: taken,
      adherence_pct: scheduled > 0 ? Math.round((taken / scheduled) * 100) : 0
    };
  },

  _localWeeklyAdherence() {
    const today = new Date();
    let scheduled = 0, taken = 0;
    const meds = JSON.parse(localStorage.getItem('pmas_medications') || '[]');
    const records = JSON.parse(localStorage.getItem('pmas_adherence') || '[]');

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = records.filter(r => r.date === dateStr);
      meds.forEach(m => {
        if (m.morning) scheduled++;
        if (m.afternoon) scheduled++;
        if (m.night) scheduled++;
      });
      taken += dayRecords.filter(r => r.status === 'taken').length;
    }

    return {
      total_scheduled: scheduled,
      total_taken: taken,
      adherence_pct: scheduled > 0 ? Math.round((taken / scheduled) * 100) : 0
    };
  }
};
