"""
PMAS — Pydantic Schemas (Data Contracts)
Request/response validation for all API endpoints.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


# ─── Auth Schemas ───────────────────────────────────────────

class UserRegister(BaseModel):
    phone_number: str = Field(..., pattern=r"^(\+91\d{10}|\d{10})$")
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(default="patient")
    preferred_language: str = Field(default="en", max_length=10)


class UserLogin(BaseModel):
    phone_number: str = Field(..., pattern=r"^(\+91\d{10}|\d{10})$")
    password: str = Field(...)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


# ─── Profile Schemas ────────────────────────────────────────

class PatientProfileCreate(BaseModel):
    full_name: str = Field(..., max_length=100)
    hospital_mrn: Optional[str] = Field(None, max_length=50)
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, pattern=r"^(\+91\d{10}|\d{10})$")
    date_of_birth: Optional[date]
    gender: Optional[str]
    blood_group: Optional[str]
    known_allergies: Optional[str]
    chronic_conditions: Optional[str]
    consent_timestamp: datetime
    consent_version: str = "1.0-RIPER"
    consent_checks: Optional[dict]


class PatientProfileResponse(BaseModel):
    user_id: UUID
    full_name: str
    hospital_mrn: Optional[str]
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[str]
    blood_group: Optional[str]
    known_allergies: Optional[str]
    chronic_conditions: Optional[str]

    class Config:
        from_attributes = True


# ─── Medication Schemas ─────────────────────────────────────

class MedicationPlanCreate(BaseModel):
    medicine_name: str = Field(..., max_length=150)
    dosage: str = Field(..., max_length=50)
    frequency_morning: bool = False
    frequency_afternoon: bool = False
    frequency_night: bool = False
    morning_time: Optional[str] = None
    afternoon_time: Optional[str] = None
    night_time: Optional[str] = None
    start_date: date
    end_date: date
    instructions_localized: Optional[str] = None


class MedicationPlanResponse(BaseModel):
    id: UUID
    medicine_name: str
    dosage: str
    frequency_morning: bool
    frequency_afternoon: bool
    frequency_night: bool
    morning_time: Optional[str]
    afternoon_time: Optional[str]
    night_time: Optional[str]
    start_date: date
    end_date: date
    instructions_localized: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# ─── Adherence Schemas ──────────────────────────────────────

class AdherenceRecordCreate(BaseModel):
    medication_id: UUID
    dose_date: date
    dose_slot: str = Field(..., pattern=r"^(morning|afternoon|night)$")
    status: str = Field(..., pattern=r"^(taken|delayed|missed)$")


class AdherenceRecordResponse(BaseModel):
    id: UUID
    medication_id: UUID
    dose_date: date
    dose_slot: str
    status: str
    recorded_at: datetime

    class Config:
        from_attributes = True


class AdherenceSummary(BaseModel):
    total_scheduled: int
    total_taken: int
    adherence_pct: float


# ─── Symptom Schemas ────────────────────────────────────────

class SymptomLogCreate(BaseModel):
    log_date: date
    pain_score: int = Field(default=0, ge=0, le=10)
    systolic_bp: Optional[int] = Field(None, ge=50, le=260)
    diastolic_bp: Optional[int] = Field(None, ge=30, le=160)
    temperature: Optional[float] = Field(None, ge=35.0, le=42.0)
    weight_kg: Optional[float] = Field(None, ge=1.0, le=300.0)
    symptoms_observed: Optional[str] = None
    side_effects: Optional[str] = None
    additional_notes: Optional[str] = None


class SymptomLogResponse(BaseModel):
    id: UUID
    log_date: date
    pain_score: int
    systolic_bp: Optional[int]
    diastolic_bp: Optional[int]
    temperature: Optional[float]
    weight_kg: Optional[float]
    red_flag_triggered: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SymptomResponse(BaseModel):
    status: str
    red_flag_alert: bool
    action_required: Optional[str] = None


# ─── Appointment Schemas ────────────────────────────────────

class AppointmentCreate(BaseModel):
    appointment_date: date
    appointment_time: str
    doctor_name: str = Field(..., max_length=150)
    department: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: UUID
    appointment_date: date
    appointment_time: str
    doctor_name: str
    department: Optional[str]
    notes: Optional[str]
    status: str

    class Config:
        from_attributes = True


# ─── Pharmacist Dashboard Schemas ───────────────────────────

class PatientEnrollment(BaseModel):
    """Pharmacist registers a new patient"""
    phone_number: str = Field(..., pattern=r"^(\+91\d{10}|\d{10})$")
    full_name: str = Field(..., max_length=100)
    hospital_mrn: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_language: str = "en"
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    known_allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None


class PharmacistDashboard(BaseModel):
    total_patients: int
    active_medications: int
    today_adherence_avg: float
    red_flag_alerts: int
    recent_patients: List[dict]
