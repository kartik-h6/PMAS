/* ═══════════════════════════════════════════════════════════════
   PMAS — Reminders Module
   Stage 1: In-app toast reminders (always available)
   Stage 2: Browser/PWA notifications where supported
   Stage 3: Native device notifications (future, if packaged)
   No cloud notification service required.
   ═══════════════════════════════════════════════════════════════ */

const Reminders = {
  checkInterval: null,
  notifiedToday: {},  // Track which doses we've already notified about

  /* Start the reminder checker (called on app load) */
  start() {
    // Request notification permission if available
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't auto-request; wait for user interaction
    }

    // Check every 60 seconds
    this.checkInterval = setInterval(() => this.check(), 60000);
    // Also check immediately
    this.check();
  },

  /* Stop reminders */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  },

  /* Request browser notification permission */
  async requestPermission() {
    if (!('Notification' in window)) {
      showToast(tr('reminder_permission'));
      return false;
    }
    if (Notification.permission === 'granted') {
      showToast(tr('reminder_enabled'));
      return true;
    }
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        showToast(tr('reminder_enabled'));
        return true;
      }
    }
    return false;
  },

  /* Check for due doses */
  check() {
    const consent = DB.get('consent');
    if (!consent) return;

    const meds = DB.get('medications') || [];
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' +
                        String(now.getMinutes()).padStart(2, '0');

    const activeMeds = meds.filter(m => {
      return (!m.start_date || m.start_date <= today) &&
             (!m.end_date || m.end_date >= today);
    });

    activeMeds.forEach(med => {
      const slots = [
        { key: 'morning', time: med.morning_time, enabled: med.morning },
        { key: 'afternoon', time: med.afternoon_time, enabled: med.afternoon },
        { key: 'night', time: med.night_time, enabled: med.night }
      ];

      slots.forEach(slot => {
        if (!slot.enabled || !slot.time) return;

        // Check if dose is already recorded
        const status = Adherence.getStatus(med.id, today, slot.key);
        if (status) return;  // Already recorded

        // Check if it's time (within a 2-minute window)
        const diffMinutes = this.timeDiffMinutes(currentTime, slot.time);
        if (diffMinutes === 0 || diffMinutes === 1) {
          // Notify only once per dose per day
          const notifyKey = med.id + '_' + slot.key + '_' + today;
          if (!this.notifiedToday[notifyKey]) {
            this.notifiedToday[notifyKey] = true;
            this.fireReminder(med.name, med.dose, slot.time, slot.key);
          }
        }
      });
    });

    // Clean up old notified keys (keep only today's)
    Object.keys(this.notifiedToday).forEach(key => {
      if (!key.endsWith(today)) delete this.notifiedToday[key];
    });
  },

  /* Calculate difference in minutes between two "HH:MM" times */
  timeDiffMinutes(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return (h1 * 60 + m1) - (h2 * 60 + m2);
  },

  /* Fire a reminder — toast + browser notification if available */
  fireReminder(medName, medDose, scheduledTime, slotKey) {
    const message = tr('reminder_due') + ' ' + medName + ' ' + medDose + ' (' + scheduledTime + ')';

    // Stage 1: Always show in-app toast
    showToast(message, 5000);

    // Stage 2: Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('PMAS — Medication Reminder', {
          body: medName + ' ' + medDose + ' — ' + scheduledTime,
          tag: 'pmas_' + slotKey + '_' + scheduledTime,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230ECDA0"><circle cx="12" cy="12" r="10"/></svg>'
        });
        // Auto-close after 30 seconds
        setTimeout(() => notification.close(), 30000);
      } catch(e) {
        // Fallback to toast only
      }
    }
  }
};
