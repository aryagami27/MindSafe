from datetime import datetime

# In a real-world scenario, this might cross-reference a university's academic calendar API.
# For demonstration purposes, we'll hardcode some "high stress" periods (e.g., December and May).
EXAM_MONTHS = [5, 12] 

def is_exam_period(current_date: datetime = None) -> bool:
    """
    Predictive Support:
    Returns True if the current date falls within known high-stress exam periods.
    This flag can be used by the frontend to trigger more frequent nudges or surface counseling earlier.
    """
    if current_date is None:
        current_date = datetime.utcnow()
        
    return current_date.month in EXAM_MONTHS
