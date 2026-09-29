"""PMAS API integration tests.

Covers: auth (register/login/lockout), activation flow, medications,
adherence upsert + ownership + date guard, today/weekly summaries
(including the month-boundary regression), research export consent
gate, and the IST date-rollover bug that motivated this suite.
"""
import itertools
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import pytest

API = "/api/v1"
_counter = itertools.count(1)

def unique_phone() -> str:
    """Unique 10-digit phone per test (login lockout state is per-process)."""
    return f"9{next(_counter):09d}"


async def register_patient(client, password="patient-pass-1"):
    phone = unique_phone()
    r = await client.post(f"{API}/auth/register", json={
        "phone_number": phone,
        "password": password,
        "preferred_language": "en",
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["role"] == "patient"
    return phone, body["access_token"]

def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}

def study_today() -> date:
    """The date the BACKEND considers 'today' (study timezone, IST by
default) — tests must agree with it, or the suite becomes flaky
between 00:00 and 05:30 IST when the UTC date differs from IST."""
    import main
    return main.today_local()

async def add_medication(client, token, *, morning=True, afternoon=False,
                         night=True, start=None, end=None):
    r = await client.post(f"{API}/medications", headers=auth(token), json={
        "medicine_name": "Metformin",
        "dosage": "500 mg",
        "frequency_morning": morning,
        "frequency_afternoon": afternoon,
        "frequency_night": night,
        "start_date": start or "2026-01-01",
        "end_date": end or "2026-12-31",
    })
    assert r.status_code == 200, r.text
    return r.json()

# ── Health ──────────────────────────────────────────────────────

async def test_health(client):
    r = await client.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ACTIVE"

# ── Auth ────────────────────────────────────────────────────────

async def test_register_then_login(client):
    phone, token = await register_patient(client)
    assert token

    r = await client.post(f"{API}/auth/login", json={
        "phone_number": phone, "password": "patient-pass-1",
    })
    assert r.status_code == 200
    assert r.json()["access_token"]

async def test_register_duplicate_phone_conflicts(client):
    phone, _ = await register_patient(client)
    r = await client.post(f"{API}/auth/register", json={
        "phone_number": phone, "password": "another-pass-1",
    })
    assert r.status_code == 409

async def test_register_rejects_short_password(client):
    r = await client.post(f"{API}/auth/register", json={
        "phone_number": unique_phone(), "password": "short",
    })
    assert r.status_code == 422

async def test_login_wrong_password(client):
    phone, _ = await register_patient(client)
    r = await client.post(f"{API}/auth/login", json={
        "phone_number": phone, "password": "wrong-password-1",
    })
    assert r.status_code == 401

async def test_login_lockout_after_repeated_failures(client):
    phone, _ = await register_patient(client)
    for _ in range(5):
        r = await client.post(f"{API}/auth/login", json={
            "phone_number": phone, "password": "wrong-password-1",
        })
        assert r.status_code == 401
    # 6th attempt is locked out even with the CORRECT password
    r = await client.post(f"{API}/auth/login", json={
        "phone_number": phone, "password": "patient-pass-1",
    })
    assert r.status_code == 429

async def test_protected_endpoint_requires_token(client):
    r = await client.get(f"{API}/medications")
    assert r.status_code in (401, 403)

# ── Medications ─────────────────────────────────────────────────

async def test_medication_lifecycle(client):
    _, token = await register_patient(client)
    med = await add_medication(client, token)

    r = await client.get(f"{API}/medications", headers=auth(token))
    assert r.status_code == 200
    assert len(r.json()) == 1

    r = await client.delete(f"{API}/medications/{med['id']}", headers=auth(token))
    assert r.status_code == 200

    r = await client.get(f"{API}/medications", headers=auth(token),
                         params={"active_only": "true"})
    assert r.json() == []

    # Another patient's medication is invisible (and undeletable)
    _, token2 = await register_patient(client)
    r = await client.delete(f"{API}/medications/{med['id']}", headers=auth(token2))
    assert r.status_code == 404

# ── Adherence ───────────────────────────────────────────────────

async def test_adherence_upsert_updates_existing_record(client):
    _, token = await register_patient(client)
    med = await add_medication(client, token)

    for status in ("taken", "delayed"):
        r = await client.post(f"{API}/adherence", headers=auth(token), json={
            "medication_id": med["id"],
            "dose_date": str(study_today()),
            "dose_slot": "morning",
            "status": status,
        })
        assert r.status_code == 200, r.text

    r = await client.get(f"{API}/adherence/today", headers=auth(token))
    body = r.json()
    # one med with morning+night slots → 2 scheduled, 0 taken (final status: delayed)
    assert body["total_scheduled"] == 2
    assert body["total_taken"] == 0
    assert body["adherence_pct"] == 0.0

async def test_adherence_rejects_other_patients_medication(client):
    _, owner = await register_patient(client)
    med = await add_medication(client, owner)

    _, intruder = await register_patient(client)
    r = await client.post(f"{API}/adherence", headers=auth(intruder), json={
        "medication_id": med["id"],
        "dose_date": str(study_today()),
        "dose_slot": "morning",
        "status": "taken",
    })
    assert r.status_code == 404

async def test_adherence_rejects_far_future_dates(client):
    _, token = await register_patient(client)
    med = await add_medication(client, token)
    r = await client.post(f"{API}/adherence", headers=auth(token), json={
        "medication_id": med["id"],
        "dose_date": str(date.today() + timedelta(days=10)),
        "dose_slot": "morning",
        "status": "taken",
    })
    assert r.status_code == 422

async def test_today_summary_math(client):
    _, token = await register_patient(client)
    med = await add_medication(client, token, morning=True, night=True)

    await client.post(f"{API}/adherence", headers=auth(token), json={
        "medication_id": med["id"],
        "dose_date": str(study_today()),
        "dose_slot": "morning",
        "status": "taken",
    })

    r = await client.get(f"{API}/adherence/today", headers=auth(token))
    body = r.json()
    assert body["total_scheduled"] == 2
    assert body["total_taken"] == 1
    assert body["adherence_pct"] == 50.0

async def test_weekly_summary_counts_full_seven_days(client, monkeypatch):
    """Regression: the weekly window must span 7 whole days and must not
crash (or silently shrink the record window) when today falls in the
first week of a month — the old `today.replace(day=today.day - i)`
arithmetic raised ValueError on days 1-6 of every month."""
    import main as app_module

    # Freeze the study date on the 3rd of a month
    monkeypatch.setattr(app_module, "today_local", lambda: date(2026, 9, 3))
    _, token = await register_patient(client)
    med = await add_medication(client, token, morning=True, night=True)

    # Record the morning dose as taken on all 7 days of the window
    for d in range(1, 8):
        await client.post(f"{API}/adherence", headers=auth(token), json={
            "medication_id": med["id"],
            "dose_date": str(date(2026, 9, 3) - timedelta(days=d - 1)),
            "dose_slot": "morning",
            "status": "taken",
        })

    r = await client.get(f"{API}/adherence/weekly", headers=auth(token))
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["total_scheduled"] == 14   # 7 days × 2 slots
    assert body["total_taken"] == 7        # 7 morning doses
    assert body["adherence_pct"] == 50.0

async def test_weekly_summary_spans_month_boundary(client, monkeypatch):
    """The 7-day window starting on 2026-09-03 reaches into August —
    records from the previous month must be counted."""
    import main as app_module

    monkeypatch.setattr(app_module, "today_local", lambda: date(2026, 9, 3))
    _, token = await register_patient(client)
    med = await add_medication(client, token, morning=True, night=False)

    await client.post(f"{API}/adherence", headers=auth(token), json={
        "medication_id": med["id"],
        "dose_date": "2026-08-30",  # previous month, inside the window
        "dose_slot": "morning",
        "status": "taken",
    })

    r = await client.get(f"{API}/adherence/weekly", headers=auth(token))
    body = r.json()
    assert body["total_taken"] == 1

# ── Study-local dates (the IST rollover fix) ─────────────────────

async def test_today_local_uses_study_timezone_not_utc(client, monkeypatch):
    """At 00:30 IST the study date is the IST calendar date; the UTC date
    is still the previous day. Pinned so this can never regress."""
    import main as app_module

    class FrozenDatetime:
        @staticmethod
        def now(tz=None):
            # 2026-09-29 00:30 IST == 2026-09-28 19:00 UTC
            return datetime(2026, 9, 29, 0, 30, tzinfo=ZoneInfo("Asia/Kolkata"))

    monkeypatch.setattr(app_module, "datetime", FrozenDatetime)
    assert app_module.today_local() == date(2026, 9, 29)
    # Sanity: the UTC date at that instant is indeed the previous day
    utc_date = datetime(2026, 9, 28, 19, 0, tzinfo=timezone.utc).date()
    assert utc_date == date(2026, 9, 28) != app_module.today_local()

async def test_today_local_env_override(client):
    """PMAS_TIMEZONE lets a study in another region override IST."""
    import main as app_module

    original = app_module.STUDY_TZ
    app_module.STUDY_TZ = ZoneInfo("America/New_York")
    try:
        assert app_module.today_local() == datetime.now(
            ZoneInfo("America/New_York")).date()
    finally:
        app_module.STUDY_TZ = original

# ── Enrollment / activation (G8 flow) ────────────────────────────

async def make_pharmacist(phone=None):
    from auth import hash_password_async
    from database import async_session, User, UserRole

    phone = phone or unique_phone()
    async with async_session() as db:
        db.add(User(
            phone_number=phone,
            password_hash=await hash_password_async("pharma-pass-1"),
            role=UserRole.pharmacist,
        ))
        await db.commit()
    return phone

async def test_pharmacist_enroll_and_patient_activation(client):
    ph_phone = await make_pharmacist()

    r = await client.post(f"{API}/auth/login", json={
        "phone_number": ph_phone, "password": "pharma-pass-1",
    })
    ph_token = r.json()["access_token"]

    patient_phone = unique_phone()
    r = await client.post(f"{API}/pharmacist/enroll", headers=auth(ph_token), json={
        "phone_number": patient_phone,
        "full_name": "Test Patient",
        "preferred_language": "kn",
    })
    assert r.status_code == 200, r.text
    enrollment = r.json()
    assert enrollment["study_id"].startswith("PMAS-")
    code = enrollment["activation_code"]

    # The unactivated account cannot log in
    r = await client.post(f"{API}/auth/login", json={
        "phone_number": patient_phone, "password": "guessed-pass-1",
    })
    assert r.status_code == 401

    # Wrong activation code is rejected
    r = await client.post(f"{API}/auth/activate", json={
        "phone_number": patient_phone,
        "activation_code": "000000",
        "new_password": "chosen-pass-1",
    })
    assert r.status_code == 400

    # Correct activation: patient chooses their own password
    r = await client.post(f"{API}/auth/activate", json={
        "phone_number": patient_phone,
        "activation_code": code,
        "new_password": "chosen-pass-1",
    })
    assert r.status_code == 200, r.text
    assert r.json()["access_token"]

    r = await client.post(f"{API}/auth/login", json={
        "phone_number": patient_phone, "password": "chosen-pass-1",
    })
    assert r.status_code == 200

async def test_patient_cannot_enroll_patients(client):
    _, token = await register_patient(client)
    r = await client.post(f"{API}/pharmacist/enroll", headers=auth(token), json={
        "phone_number": unique_phone(), "full_name": "Nope",
    })
    assert r.status_code == 403

# ── Research export consent gate (G5) ───────────────────────────

async def test_research_export_requires_attested_consent(client):
    _, token = await register_patient(client)

    # No profile/consent at all
    r = await client.get(f"{API}/research/export", headers=auth(token))
    assert r.status_code == 403

    # Profile with consent recorded but not all acknowledgements given
    r = await client.post(f"{API}/profile", headers=auth(token), json={
        "full_name": "Consent Test",
        "consent_timestamp": datetime.now(timezone.utc).isoformat(),
        "consent_status": True,
        "consent_checks": [True, True, False, True, True, True],
    })
    assert r.status_code == 200, r.text

    r = await client.get(f"{API}/research/export", headers=auth(token))
    assert r.status_code == 403

    # Full consent unlocks the export
    r = await client.post(f"{API}/profile", headers=auth(token), json={
        "full_name": "Consent Test",
        "consent_timestamp": datetime.now(timezone.utc).isoformat(),
        "consent_status": True,
        "consent_checks": [True] * 6,
    })
    assert r.status_code == 200

    r = await client.get(f"{API}/research/export", headers=auth(token))
    assert r.status_code == 200, r.text
    export = r.json()
    assert export["data_governance"]["pii_in_export"] is False
    # De-identification invariants: no raw dates, no free text in records
    for rec in export["adherence"]["records"]:
        assert set(rec.keys()) == {"study_day", "slot", "status"}
    for entry in export["symptoms"]["entries"]:
        assert "symptoms_observed" not in entry
        assert "additional_notes" not in entry
