import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.database import get_db
from src.models import Base

# Setup a local in-memory SQLite database specifically for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture()
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_register_anonymous_user(test_db):
    response = client.post("/auth/register")
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "user_id" in data
    
    # We can use this token securely
    token = data["access_token"]
    me_response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["user_id"] == data["user_id"]

def test_submit_mood_logs(test_db):
    # First register
    register_response = client.post("/auth/register")
    token = register_response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Send a positive log
    log_data = {"mood_score": 8, "journal_entry": "I had a great day today studying!"}
    response = client.post("/mood-logs", json=log_data, headers=headers)
    assert response.status_code == 201
    assert response.json()["sentiment_detected"] is True

def test_stress_analysis_with_passive_data(test_db):
    # Register
    register_response = client.post("/auth/register")
    token = register_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Send very poor sleep data
    passive_data = {"sleep_hours": 3.0, "study_screen_time_hours": 12.0}
    response = client.post("/data-markers", json=passive_data, headers=headers)
    assert response.status_code == 201
    
    # Send very poor mood log
    log_data = {"mood_score": 2, "journal_entry": "I am completely exhausted, this is awful and I want to quit."}
    client.post("/mood-logs", json=log_data, headers=headers)
    
    # Trigger analysis evaluation
    analysis_response = client.post("/analyze/stress", headers=headers)
    
    assert analysis_response.status_code == 200
    res_data = analysis_response.json()
    
    # Since sleep is < 4 and sentiment is highly negative, this should be high risk
    assert res_data["current_alert"] == "High"
