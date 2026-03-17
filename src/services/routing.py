from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from .. import models
from .exam_logic import is_exam_period

logger = logging.getLogger(__name__)

def generate_risk_alert(user_id: str, risk_level: str, reason: str, db: Session) -> models.RiskAlert:
    """Smart routing module that maps user's risk to resources."""
    alert = models.RiskAlert(
        user_id=user_id,
        risk_level=risk_level,
        reason=reason
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # Ideally, here we would also dispatch an async task for push notifications
    # or specific smart routing interventions:
    # Low Risk -> Automated Coping Strategies / Mindfulness Nudges
    # Medium Risk -> Peer-Support Gateway Prompt
    # High Risk -> Crisis Line & Fast-track Campus Counselor Booking
    
    return alert


def analyze_stress_level(user_id: str, db: Session) -> models.RiskAlert:
    """
    Passive Stress Detection Logic (Early Detection Engine)
    Collects past 3 days of data markers, sentiment logs, and computes stress escalation.
    """
    three_days_ago = datetime.utcnow() - timedelta(days=3)
    
    # Ingest passive data
    recent_sleep = db.query(models.SleepActivityData).filter(
        models.SleepActivityData.user_id == user_id,
        models.SleepActivityData.logged_at >= three_days_ago
    ).all()
    
    # Ingest mood logs
    recent_moods = db.query(models.MoodLog).filter(
        models.MoodLog.user_id == user_id,
        models.MoodLog.logged_at >= three_days_ago
    ).all()
    
    # Variables for logic
    avg_sleep = 0
    avg_mood = 0
    avg_sentiment = 0.0
    
    if recent_sleep:
        avg_sleep = sum([r.sleep_hours for r in recent_sleep]) / len(recent_sleep)
    if recent_moods:
        avg_mood = sum([r.mood_score for r in recent_moods]) / len(recent_moods)
        sentiments = filter(None, [r.sentiment_score for r in recent_moods])
        sentiments_list = list(sentiments)
        if len(sentiments_list) > 0:
            avg_sentiment = sum(sentiments_list) / len(sentiments_list)
            
    # Logic calculation rules (adjust thresholds clinically)
    risk_level = "Low"
    reason = ""
    
    exam_period_active = is_exam_period()
    
    # High Risk scenario: (Poor sleep + Negative sentiment + Low mood OR Exam Period amplifier)
    if avg_sleep > 0 and avg_sleep < 4.0 and avg_mood < 4 and avg_sentiment < -0.3:
        risk_level = "High"
        reason = "Critically low sleep duration combined with negative mood and sentiment markers."
    elif avg_sleep > 0 and avg_sleep < 5.0 and exam_period_active: # Amplified by exam calendar
        risk_level = "High"
        reason = "Exam period detected with dangerously low sleep patterns."
        
    # Medium Risk scenario
    elif avg_sleep > 0 and avg_sleep < 6.0 and avg_mood < 6:
        risk_level = "Medium"
        reason = "Suboptimal sleep patterns with dropping mood."
    elif avg_sentiment < -0.1 and len(recent_moods) >= 2:
        risk_level = "Medium"
        reason = "Consistent negative sentiment in recent journal entries."
        
    # Low Risk scenario
    elif avg_sleep > 6.0 and avg_mood >= 6 and avg_sentiment >= 0.0:
        risk_level = "Low"
        reason = "Data is within healthy parameters. Recommending standard coping strategies."
        return None # No active alert needed

    if risk_level in ["Medium", "High"]:
        return generate_risk_alert(user_id, risk_level, reason, db)
    
    return None
