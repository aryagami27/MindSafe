from pydantic import BaseModel, Field
from typing import Optional, List

class MoodLogCreate(BaseModel):
    mood_score: int = Field(..., ge=1, le=10, description="Mood score from 1 to 10")
    journal_entry: Optional[str] = Field(None, description="Optional text entry for NLP evaluation")

class PassiveDataCreate(BaseModel):
    sleep_hours: float = Field(..., ge=0, description="Hours slept last night")
    study_screen_time_hours: float = Field(..., ge=0, description="Hours spent studying/on-screen")
    
class RiskAlertResponse(BaseModel):
    id: str
    risk_level: str
    reason: str
    is_resolved: int

class QuestionnaireSubmit(BaseModel):
    answers: List[int] = Field(
        ...,
        min_length=8, max_length=8,
        description="List of 8 answer scores (0=Never, 1=Sometimes, 2=Often, 3=Always)"
    )

