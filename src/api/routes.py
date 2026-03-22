from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import logging
from textblob import TextBlob

from src import models, database, auth, schemas
from src.services.exam_logic import is_exam_period
from src.services.routing import analyze_stress_level, generate_risk_alert
from src.services.assessment import QUESTIONS, run_comprehensive_analysis

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register_anonymous_user(db: Session = Depends(database.get_db)):
    """
    Creates an anonymous user and returns a strict-privacy JWT.
    No PII required! Just a fresh identity to associate logs securely.
    """
    # Simply generate a fresh password hash (meaningless since they never type it, login is seamless)
    dummy_password = models.generate_uuid()[:30]  # Bcrypt limits to 72 chars, uuid is 36 but we can just use 30
    hashed_password = auth.pwd_context.hash(dummy_password)
    
    new_user = models.User(hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create the token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(new_user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": new_user.id}


@router.get("/users/me")
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"user_id": current_user.id, "created_at": current_user.created_at}

@router.post("/mood-logs", status_code=status.HTTP_201_CREATED)
def submit_mood_log(
    log_data: schemas.MoodLogCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Gamified daily check-in. User provides a 1-10 self-assessment, and optional journaling.
    """
    sentiment = None
    if log_data.journal_entry:
        # Basic NLP text analysis using TextBlob
        blob = TextBlob(log_data.journal_entry)
        sentiment = blob.sentiment.polarity
        
    db_log = models.MoodLog(
        user_id=current_user.id,
        mood_score=log_data.mood_score,
        journal_entry=log_data.journal_entry,
        sentiment_score=sentiment
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    # Check if we should trigger an alert early
    analyze_stress_level(current_user.id, db)
    
    return {"status": "success", "log_id": db_log.id, "sentiment_detected": sentiment is not None}

@router.post("/data-markers", status_code=status.HTTP_201_CREATED)
def ingest_passive_data(
    data: schemas.PassiveDataCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Ingest passive indicators (sleep variations, study hours proxy via screen time).
    """
    db_marker = models.SleepActivityData(
        user_id=current_user.id,
        sleep_hours=data.sleep_hours,
        study_screen_time_hours=data.study_screen_time_hours
    )
    db.add(db_marker)
    db.commit()
    db.refresh(db_marker)
    
    analyze_stress_level(current_user.id, db)
    
    return {"status": "success", "marker_id": db_marker.id}

@router.post("/analyze/stress")
def test_analyze_stress(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Manually triggers the evaluation logic for testing and checking dynamic risk matching.
    """
    alert = analyze_stress_level(current_user.id, db)
    
    exam_nudge_active = is_exam_period()
    return {
        "status": "success",
        "current_alert": alert.risk_level if alert else "Safe/Low",
        "reason": alert.reason if alert else "Normal ranges detected.",
        "exam_nudge_active": exam_nudge_active
    }


# ─── Assessment endpoints ───

@router.get("/assessment/questions")
def get_questions():
    """Returns the mental health questionnaire question set."""
    return {"questions": QUESTIONS}


@router.post("/assessment/submit")
def submit_assessment(
    data: schemas.QuestionnaireSubmit,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Submit questionnaire answers and receive a comprehensive multi-dimensional
    mental health analysis combining answers with passive data.
    """
    # Validate answer range
    for i, ans in enumerate(data.answers):
        if ans < 0 or ans > 3:
            raise HTTPException(
                status_code=400,
                detail=f"Answer {i+1} must be between 0 and 3"
            )
    
    report = run_comprehensive_analysis(current_user.id, data.answers, db)
    return report
