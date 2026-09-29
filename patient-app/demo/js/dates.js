/* ═══════════════════════════════════════════════════════════════
   PMAS — Local Date Helpers (dates.js)
   ───────────────────────────────────────────────────────────────
   All patient-facing CALENDAR dates use the device's local
   timezone, never UTC.

   Why: `new Date().toISOString()` returns the UTC date. India is
   UTC+5:30, so a night dose taken at 00:30 IST would otherwise be
   recorded against YESTERDAY's date — silently corrupting the
   adherence dataset (the study's primary outcome). UTC timestamps
   (full ISO strings for `recorded_ts` etc.) are fine; UTC *dates*
   are not.

   Load order: this file must be the FIRST script tag in the app
   shell (before i18n.js / db.js / ...).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* Format a Date (or date-like value) as a LOCAL 'YYYY-MM-DD' string. */
function localDateStr(d) {
  const dt = (d instanceof Date) ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

/* Today's date in the device's local timezone, as 'YYYY-MM-DD'. */
function todayStr() {
  return localDateStr(new Date());
}

/* The date `n` days before today, local timezone, as 'YYYY-MM-DD'. */
function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateStr(d);
}
