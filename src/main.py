from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .api import routes

# Initialize tables on startup for simplicity in this prototype. 
# For production, Use Alembic for migrations instead.
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Mental Health Early Detection Platform",
    description="Privacy-first mental health backend for college students. Anonymous operations via token-based JWTs, daily check-ins, passive data markers, and early detection routing.",
    version="1.0.0"
)

# CORS middleware for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the endpoints
app.include_router(routes.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Mental Health Early Detection Platform Backend.",
        "status": "Online",
        "privacy": "Anonymous PII-free operations enabled."
    }
