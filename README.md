# Mental Health Early Detection Platform (MindSafe)

A full-stack mental health early detection and intervention platform for college students, featuring a FastAPI backend and a modern React frontend with premium dark-mode glassmorphism UI.

## Tech Stack
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite, TextBlob (NLP), passlib/jose (JWT)
- **Frontend**: Vite, React, Vanilla CSS
- **Package Management**: `uv` (Python), `npm` (Frontend)

## Setup & Run

### Backend
```bash
uv run uvicorn src.main:app --reload
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend && npm run dev
# Runs on http://localhost:5173
```

### Tests
```bash
uv run pytest tests/test_api.py -v
```

## Features and Status

**Project Initialization & Architecture**
- [x] Set up project using `uv`
- [x] Define System Architecture
- [x] Initialize README.md with tracking steps

**Database Models**
- [x] Create User, MoodLog, SleepData, and Alert schemas using SQLAlchemy
- [x] Configure local SQLite tracking

**Core API Endpoints**
- [x] Secure & Anonymous User Management (JWT, no PII)
- [x] Daily mood log submission endpoint
- [x] Sleep/stress data ingestion endpoint
- [x] `analyze_stress_level()` calculation logic

**Actionable Logic**
- [x] Exam period nudges and background task system
- [x] Smart Routing Gateway

**Frontend**
- [x] Vite React project with premium dark-mode glassmorphism UI
- [x] Anonymous single-click login screen
- [x] Dashboard with tab navigation (Check-in, Data, Analysis)
- [x] MoodLogger with emoji selector, slider, and journal textarea
- [x] DataIngestor for passive sleep/screen-time tracking
- [x] RiskAlert with dynamic stress analysis and resource routing
- [x] Full CORS integration between frontend and backend
