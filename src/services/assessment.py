"""
Comprehensive Mental Health Assessment Engine.
Combines clinically-inspired questionnaire scores with passive data 
(sleep, screen time, mood, sentiment) for a multi-dimensional analysis.
"""
import json
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from .. import models

# ─── Question bank (adapted from PHQ-9 / GAD-7 concepts) ───
QUESTIONS = [
    {
        "id": 1,
        "text": "How often have you felt little interest or pleasure in doing things?",
        "dimension": "Depression",
        "options": ["Never", "Sometimes", "Often", "Always"]
    },
    {
        "id": 2,
        "text": "How often have you felt down, hopeless, or overwhelmed?",
        "dimension": "Depression",
        "options": ["Never", "Sometimes", "Often", "Always"]
    },
    {
        "id": 3,
        "text": "How often have you felt nervous, anxious, or on edge?",
        "dimension": "Anxiety",
        "options": ["Never", "Sometimes", "Often", "Always"]
    },
    {
        "id": 4,
        "text": "How often have you been unable to stop or control worrying?",
        "dimension": "Anxiety",
        "options": ["Never", "Sometimes", "Often", "Always"]
    },
    {
        "id": 5,
        "text": "How often have you had trouble concentrating on tasks like studying?",
        "dimension": "Cognitive",
        "options": ["Never", "Sometimes", "Often", "Always"]
    },
    {
        "id": 6,
        "text": "How often have you felt tired or had little energy?",
        "dimension": "Physical",
        "options": ["Never", "Sometimes", "Often", "Always"]
    },
    {
        "id": 7,
        "text": "How often have you avoided social interactions or activities?",
        "dimension": "Social",
        "options": ["Never", "Sometimes", "Often", "Always"]
    },
    {
        "id": 8,
        "text": "How often have you felt that you can't cope with academic pressure?",
        "dimension": "Academic",
        "options": ["Never", "Sometimes", "Often", "Always"]
    },
]

# ─── Dimension severity thresholds (max per dimension = 6, except single-question dims = 3) ───
def _severity_label(score, max_score):
    """Returns severity label and a 0-100 percentage."""
    pct = round((score / max_score) * 100) if max_score > 0 else 0
    if pct <= 33:
        return "Minimal", pct
    elif pct <= 66:
        return "Moderate", pct
    else:
        return "Severe", pct

# ─── Recommendation engine per dimension ───
RECOMMENDATIONS = {
    "Depression": {
        "Minimal": "Your mood appears stable. Continue nurturing positive activities and social connections.",
        "Moderate": "You're showing some signs of low mood. Try scheduling enjoyable activities daily, maintaining a routine, and consider journaling your thoughts. Light exercise can also help lift your spirits.",
        "Severe": "Your responses indicate significant depressive symptoms. We strongly recommend reaching out to a campus counselor or mental health professional. You don't have to face this alone — peer support groups and crisis lines are also available."
    },
    "Anxiety": {
        "Minimal": "Your anxiety levels are within normal ranges. Keep practicing healthy stress management.",
        "Moderate": "You're experiencing moderate anxiety. Deep breathing exercises (4-7-8 technique), progressive muscle relaxation, and limiting caffeine intake can help. Consider trying a mindfulness app for guided sessions.",
        "Severe": "Your anxiety symptoms are elevated. Grounding techniques (5-4-3-2-1 method) can help in acute moments. We recommend speaking with a counselor who can provide evidence-based strategies like CBT techniques."
    },
    "Cognitive": {
        "Minimal": "Your concentration and cognitive function seem healthy. Keep up good study habits.",
        "Moderate": "You're having some difficulty concentrating. Try the Pomodoro technique (25 min focus, 5 min break), reduce multitasking, and ensure your study environment is distraction-free.",
        "Severe": "Significant concentration difficulties detected. This may be linked to sleep deprivation, stress, or anxiety. Prioritize sleep, break tasks into smaller chunks, and consider speaking with an academic advisor about accommodations."
    },
    "Physical": {
        "Minimal": "Your energy levels seem adequate. Continue maintaining good sleep and exercise habits.",
        "Moderate": "You're experiencing some fatigue. Ensure you're getting 7-9 hours of sleep, staying hydrated, eating balanced meals, and incorporating at least 20 minutes of physical activity daily.",
        "Severe": "Persistent fatigue can significantly impact academic performance and wellbeing. Rule out medical causes with a health check, prioritize sleep hygiene, and consider whether stress or mood issues are contributing."
    },
    "Social": {
        "Minimal": "You're maintaining healthy social connections. Social support is a key protective factor for mental health.",
        "Moderate": "You're withdrawing somewhat from social activities. Try joining one low-pressure social activity per week, reaching out to a friend, or attending a campus club event. Social connection is a powerful stress buffer.",
        "Severe": "Significant social withdrawal can worsen feelings of isolation. Consider joining a peer support group where others understand what you're going through. A counselor can also help identify barriers to social engagement."
    },
    "Academic": {
        "Minimal": "You're coping well with academic demands. Keep using effective study strategies and time management.",
        "Moderate": "Academic pressure is building. Break large assignments into small tasks, use a planner, communicate with professors early about concerns, and don't hesitate to use tutoring or writing center services.",
        "Severe": "You're feeling overwhelmed by academic pressure. This is common among students and not a personal failure. Speak with your academic advisor about workload management, consider dropping or adjusting course loads if needed, and prioritize your mental health."
    }
}


def run_comprehensive_analysis(user_id: str, answers: list[int], db: Session) -> dict:
    """
    Core assessment engine. Combines questionnaire answers with 
    passive data (sleep, screen time, mood, sentiment) to generate
    a detailed multi-dimensional mental health report.
    """
    # ─── 1. Score per dimension from questionnaire answers ───
    dimension_scores = {
        "Depression": answers[0] + answers[1],   # Q1 + Q2, max 6
        "Anxiety": answers[2] + answers[3],       # Q3 + Q4, max 6
        "Cognitive": answers[4],                   # Q5, max 3
        "Physical": answers[5],                    # Q6, max 3
        "Social": answers[6],                      # Q7, max 3
        "Academic": answers[7],                    # Q8, max 3
    }
    dimension_max = {
        "Depression": 6, "Anxiety": 6,
        "Cognitive": 3, "Physical": 3,
        "Social": 3, "Academic": 3
    }

    questionnaire_total = sum(answers)  # Max 24

    # ─── 2. Collect passive data from past 7 days ───
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    recent_sleep = db.query(models.SleepActivityData).filter(
        models.SleepActivityData.user_id == user_id,
        models.SleepActivityData.logged_at >= seven_days_ago
    ).all()

    recent_moods = db.query(models.MoodLog).filter(
        models.MoodLog.user_id == user_id,
        models.MoodLog.logged_at >= seven_days_ago
    ).all()

    # Calculate averages
    avg_sleep = round(sum(r.sleep_hours for r in recent_sleep) / len(recent_sleep), 1) if recent_sleep else None
    avg_screen = round(sum(r.study_screen_time_hours for r in recent_sleep) / len(recent_sleep), 1) if recent_sleep else None
    avg_mood = round(sum(r.mood_score for r in recent_moods) / len(recent_moods), 1) if recent_moods else None

    sentiments = [r.sentiment_score for r in recent_moods if r.sentiment_score is not None]
    avg_sentiment = round(sum(sentiments) / len(sentiments), 2) if sentiments else None

    # ─── 3. Passive data penalty calculations ───
    penalty = 0
    passive_insights = []

    if avg_sleep is not None:
        if avg_sleep < 5:
            penalty += 3
            passive_insights.append(f"⚠️ Your average sleep is critically low at {avg_sleep}h (recommended: 7-9h). This significantly impacts mood, cognition, and stress resilience.")
        elif avg_sleep < 6:
            penalty += 1
            passive_insights.append(f"😴 Your average sleep of {avg_sleep}h is below the recommended 7-9 hours. Even small improvements in sleep duration can boost mental clarity.")
        else:
            passive_insights.append(f"✅ Your average sleep of {avg_sleep}h is within a healthy range.")
    else:
        passive_insights.append("ℹ️ No sleep data available yet. Log your sleep in the Data tab for a more accurate analysis.")

    if avg_screen is not None:
        if avg_screen > 10:
            penalty += 2
            passive_insights.append(f"⚠️ Your average screen time of {avg_screen}h/day is very high. Prolonged screen time is linked to eye strain, disrupted sleep, and increased anxiety.")
        elif avg_screen > 8:
            penalty += 1
            passive_insights.append(f"📱 Your average screen time of {avg_screen}h/day is elevated. Consider scheduling regular breaks using the 20-20-20 rule.")
        else:
            passive_insights.append(f"✅ Your screen time of {avg_screen}h/day is within a manageable range.")
    else:
        passive_insights.append("ℹ️ No screen time data available yet.")

    if avg_mood is not None:
        if avg_mood < 4:
            penalty += 3
            passive_insights.append(f"⚠️ Your average mood score is {avg_mood}/10, indicating consistently low mood over the past week.")
        elif avg_mood < 6:
            penalty += 1
            passive_insights.append(f"😐 Your average mood score is {avg_mood}/10. There's room for improvement — try incorporating one enjoyable activity each day.")
        else:
            passive_insights.append(f"✅ Your average mood score of {avg_mood}/10 suggests generally positive emotional state.")
    else:
        passive_insights.append("ℹ️ No mood data available yet. Use the Check-in tab to log your mood for richer insights.")

    if avg_sentiment is not None:
        if avg_sentiment < -0.3:
            penalty += 2
            passive_insights.append(f"⚠️ Your journal entries show strongly negative sentiment ({avg_sentiment}). Writing about difficult feelings is healthy, but persistent negativity may indicate deeper distress.")
        elif avg_sentiment < 0:
            penalty += 1
            passive_insights.append(f"📝 Your journal sentiment trend is slightly negative ({avg_sentiment}). Reflective journaling is valuable — consider also noting positive moments.")
        else:
            passive_insights.append(f"✅ Your journal sentiment is positive ({avg_sentiment}), indicating healthy emotional processing.")

    # ─── 4. Composite score ───
    composite_score = questionnaire_total + penalty  # Max theoretical ≈ 35

    # ─── 5. Overall risk level from composite ───
    if composite_score >= 20:
        overall_risk = "High"
        overall_summary = "Your assessment indicates significant mental health concerns across multiple areas. We strongly encourage you to connect with professional support — you deserve help, and seeking it is a sign of strength, not weakness."
    elif composite_score >= 12:
        overall_risk = "Medium"
        overall_summary = "Your assessment shows moderate stress with some areas of concern. Proactive self-care and targeted strategies can help prevent escalation. Consider peer support resources if you feel comfortable."
    elif composite_score >= 6:
        overall_risk = "Mild"
        overall_summary = "Your overall mental health appears generally healthy with some mild stress indicators. Maintaining your current coping strategies and staying aware of changes is recommended."
    else:
        overall_risk = "Healthy"
        overall_summary = "Your assessment looks great! Your mental health indicators are within healthy parameters. Continue your current habits and stay connected with your support network."

    # ─── 6. Build per-dimension breakdown ───
    dimensions = []
    for dim_name, dim_score in dimension_scores.items():
        max_s = dimension_max[dim_name]
        severity, pct = _severity_label(dim_score, max_s)
        rec = RECOMMENDATIONS[dim_name][severity]
        dimensions.append({
            "name": dim_name,
            "score": dim_score,
            "max_score": max_s,
            "percentage": pct,
            "severity": severity,
            "recommendation": rec
        })

    # ─── 7. Save to database ───
    db_response = models.QuestionnaireResponse(
        user_id=user_id,
        answers_json=json.dumps(answers),
        depression_score=dimension_scores["Depression"],
        anxiety_score=dimension_scores["Anxiety"],
        cognitive_score=dimension_scores["Cognitive"],
        physical_score=dimension_scores["Physical"],
        social_score=dimension_scores["Social"],
        academic_score=dimension_scores["Academic"],
        composite_score=composite_score,
        detailed_report=json.dumps({
            "overall_risk": overall_risk,
            "overall_summary": overall_summary,
        })
    )
    db.add(db_response)
    db.commit()
    db.refresh(db_response)

    return {
        "assessment_id": db_response.id,
        "overall_risk": overall_risk,
        "overall_summary": overall_summary,
        "composite_score": composite_score,
        "questionnaire_score": questionnaire_total,
        "passive_penalty": penalty,
        "dimensions": dimensions,
        "passive_data": {
            "avg_sleep": avg_sleep,
            "avg_screen_time": avg_screen,
            "avg_mood": avg_mood,
            "avg_sentiment": avg_sentiment,
            "insights": passive_insights
        }
    }
