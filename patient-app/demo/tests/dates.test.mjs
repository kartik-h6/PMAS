/* ═══════════════════════════════════════════════════════════════
   PMAS — date helper tests (plain Node, no framework)

   Run:  node patient-app/demo/tests/dates.test.mjs

   Pins the IST rollover bug: `new Date().toISOString()` returns the
   UTC date, so a night dose logged at 00:30 IST used to land on
   YESTERDAY. localDateStr()/todayStr() must return device-LOCAL dates.
   ═════════════════════════════════════════════════════════════════ */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const src = readFileSync(new URL('../js/dates.js', import.meta.url), 'utf8');

// Load the helper functions from the real source file (no build step:
// the browser file is plain script, so evaluate it and capture the globals)
const ctx = {};
new Function(
  'ctx',
  src + '\nctx.localDateStr = localDateStr; ctx.todayStr = todayStr; ctx.daysAgoStr = daysAgoStr;'
)(ctx);
const { localDateStr, todayStr, daysAgoStr } = ctx;

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) { passed++; console.log(`  ok  ${name}`); }
  else { failed++; console.error(`  FAIL ${name}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`); }
}

const localDate = (d) => new Intl.DateTimeFormat('en-CA',
  { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

console.log('dates.test.mjs — PMAS local date helpers');

/* 1. The IST rollover, proven deterministically in a TZ-controlled
      child process (the test machine's own timezone is irrelevant):
      2026-09-28T19:00Z == 2026-09-29 00:30 IST. */
const istProbe = `
  const d = new Date('2026-09-28T19:00:00Z');
  const s = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0')
          + '-' + String(d.getDate()).padStart(2,'0');
  process.stdout.write(s);
`;
const inIST = execFileSync(process.execPath, ['-e', istProbe],
  { env: { ...process.env, TZ: 'Asia/Kolkata' } }).toString();
check('a 00:30 IST instant formats as the IST calendar date (TZ=Asia/Kolkata)',
  inIST, '2026-09-29');

const inUTC = execFileSync(process.execPath, ['-e', istProbe],
  { env: { ...process.env, TZ: 'UTC' } }).toString();
check('the same instant in UTC is the previous date — the old toISOString() bug',
  inUTC, '2026-09-28');

/* 2. Generic formatting */
check('localDateStr formats with zero-padding',
  localDateStr(new Date(2026, 0, 5)), '2026-01-05');
check('localDateStr handles December 31',
  localDateStr(new Date(2026, 11, 31)), '2026-12-31');

/* 3. todayStr matches the device's local calendar date */
check('todayStr equals the local calendar date', todayStr(), localDate(new Date()));

/* 4. daysAgoStr walks back in LOCAL days */
check('daysAgoStr(0) is today', daysAgoStr(0), todayStr());
const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
check('daysAgoStr(1) is yesterday (local)', daysAgoStr(1), localDate(yesterday));
const sixDaysAgo = new Date(); sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
check('daysAgoStr(6) is the 7-day window start (local)', daysAgoStr(6), localDate(sixDaysAgo));

/* 5. db.js no longer contains UTC-date arithmetic anywhere */
const dbSrc = readFileSync(new URL('../js/db.js', import.meta.url), 'utf8');
check('db.js contains no UTC calendar-date usage',
  dbSrc.includes("toISOString().split('T')[0]"), false);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
