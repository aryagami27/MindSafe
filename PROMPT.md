**System Role:** You are an Expert Python Software Architect, Product Manager, and Digital Health Specialist. Your task is to design and write the foundational Python code for a mental health early detection and intervention platform tailored for college students. 

**Background & Problem Statement (Design Thinking Context):**
College students face immense academic stress, especially during exam periods, which often leads to severe mental health challenges. Due to high stigma and privacy concerns, students frequently avoid visiting campus counselors, risking the escalation of early symptoms. The primary users of this app are highly stressed, digitally native college students who need accessible, anonymous support. 

**Mission:** Create a Python-based backend architecture (using FastAPI or Django) for a mobile/web application that addresses these core "How Might We" (HMW) challenges:
1. HMW reduce stigma and make mental health support easily accessible?
2. HMW encourage daily mood tracking and self-assessment?
3. HMW detect rising stress levels (e.g., via sleep patterns or digital markers) without direct, intrusive questioning?
4. HMW connect students to counselors or peer-support quickly when early signs are detected?

**Core Software Modules to Design & Code:**

**1. Secure & Anonymous User Management (Privacy First)**
* Requirement: The system must allow users to operate completely anonymously. 
* Features: Token-based authentication without requiring PII (Personally Identifiable Information). 
* Goal: Overcome the stigma of seeking help by ensuring digital privacy.

**2. Daily Check-in & Self-Assessment Engine**
* Requirement: Gamified or low-friction daily mood tracking and clinically validated self-assessments (e.g., PHQ-9 or GAD-7 adapted for daily use).
* Features: Reminder/notification logic to encourage well-being habits.

**3. Passive Stress Detection Logic (Early Detection Engine)**
* Requirement: A Python service that analyzes passive data indicators. 
* Features: Logic to ingest and evaluate sleep patterns, study hours (screen time), and text-based journaling (using basic NLP for sentiment analysis). If the data indicates rising stress, the system flags it early.

**4. "Exam Period" Predictive Support & Alerting**
* Requirement: A dynamic calendar integration that recognizes peak stress periods (midterms/finals).
* Features: Automated shifts in the app's behavior (e.g., offering more frequent mindfulness nudges, study-break reminders, and surfacing fast-track counselor booking).

**5. Smart Routing & Peer-Support Gateway**
* Requirement: A module that maps the user's risk level to the appropriate resource.
* Features: Low risk = automated coping strategies. Medium risk = peer-support connections. High risk = quick, anonymous routing to campus counseling or crisis lines.

**Your Deliverables:**
Please provide a comprehensive technical response containing the following:
1. **System Architecture:** A brief text explanation of the recommended Python stack (Framework, Database, ML libraries for text/sentiment analysis).
2. **Database Models (SQLAlchemy or Django ORM):** Code for the schemas representing the Anonymous User, Mood Logs, Sleep/Activity Data, and Risk Alerts.
3. **Core API Endpoints (Code):** Write the foundational Python code for:
    * Submitting a daily mood log.
    * Ingesting sleep/stress data markers.
    * A calculation function (`analyze_stress_level()`) that evaluates recent sleep data and mood logs to determine if an early-detection alert should be triggered.
4. **Actionable Logic:** Write the background task/logic for the "Exam Period" nudges and reminder system.

Ensure the code is clean, modular, well-commented, and explicitly addresses the balance between early data detection and user privacy.