from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import or_
import shutil
import os

from . import models, schemas, auth, ml
from .database import engine, Base, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if new_user.role == "athlete":
        athlete = models.Athlete(user_id=new_user.id, name=user.email.split("@")[0], age=18, state="Unknown", gender="Unknown")
        db.add(athlete)
        db.commit()
        
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": db_user}

@app.get("/api/auth/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/tests", response_model=List[schemas.TestDefinition])
def get_tests(db: Session = Depends(get_db)):
    # Sync default tests
    default_tests = [
        {"id": "height", "label": "Height", "icon": "↕", "unit": "cm", "color": "#38BFFF", "aiModule": "Body measurement AI", "min_val": 130, "max_val": 220},
        {"id": "weight", "label": "Weight", "icon": "⊗", "unit": "kg", "color": "#FFCC00", "aiModule": "Mass estimation AI", "min_val": 35, "max_val": 120},
        {"id": "vjump", "label": "Vertical Jump", "icon": "↟", "unit": "cm", "color": "#FF7D1A", "aiModule": "Pose + velocity AI", "min_val": 10, "max_val": 100},
        {"id": "shuttle", "label": "Shuttle Run", "icon": "⇆", "unit": "s", "color": "#00C97B", "aiModule": "Motion tracking AI", "min_val": 8, "max_val": 22},
        {"id": "situps", "label": "Sit-ups / min", "icon": "↻", "unit": "reps", "color": "#A78BFA", "aiModule": "Rep counter AI", "min_val": 5, "max_val": 80},
        {"id": "run1600", "label": "1600m Run", "icon": "▶", "unit": "min", "color": "#38BFFF", "aiModule": "Gait + GPS AI", "min_val": 4, "max_val": 14},
        {"id": "pushups", "label": "Push-ups", "icon": "⍒", "unit": "reps", "color": "#F43F5E", "aiModule": "Rep counter AI", "min_val": 5, "max_val": 80},
        {"id": "pullups", "label": "Pull-ups", "icon": "⍋", "unit": "reps", "color": "#EAB308", "aiModule": "Rep counter AI", "min_val": 0, "max_val": 40},
    ]
    
    for t in default_tests:
        if not db.query(models.TestDefinition).filter(models.TestDefinition.id == t["id"]).first():
            db.add(models.TestDefinition(**t))
    db.commit()
    return db.query(models.TestDefinition).all()

@app.get("/api/athletes", response_model=List[schemas.Athlete])
def get_athletes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    athletes = db.query(models.Athlete).offset(skip).limit(limit).all()
    return athletes

@app.get("/api/athletes/me", response_model=schemas.Athlete)
def get_my_athlete_profile(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "athlete":
        raise HTTPException(status_code=403, detail="Not an athlete")
    athlete = db.query(models.Athlete).filter(models.Athlete.user_id == current_user.id).first()
    
    if not athlete:
        # Lazy create for existing users who don't have a profile
        athlete = models.Athlete(user_id=current_user.id, name=current_user.email.split("@")[0], age=18, state="Unknown", gender="Unknown")
        db.add(athlete)
        db.commit()
        db.refresh(athlete)
        
    return athlete

@app.get("/api/athletes/{athlete_id}", response_model=schemas.Athlete)
def get_athlete(athlete_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    athlete = db.query(models.Athlete).filter(models.Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return athlete

@app.post("/api/scores", response_model=schemas.TestScore)
def submit_score(score: schemas.ScoreSubmitRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    athlete = db.query(models.Athlete).filter(models.Athlete.id == score.athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    # Check if score already exists for this test, if so, update
    db_score = db.query(models.TestScore).filter(models.TestScore.athlete_id == score.athlete_id, models.TestScore.test_id == score.test_id).first()
    if db_score:
        db_score.value = score.value
    else:
        db_score = models.TestScore(athlete_id=score.athlete_id, test_id=score.test_id, value=score.value)
        db.add(db_score)
    
    # Simple logic to add XP and coins upon completion
    athlete.xp += 120
    athlete.coins += 15
    db.commit()
    db.refresh(db_score)
    return db_score

@app.get("/api/benchmarks")
def get_benchmarks():
    return {
        "male":   { "height": 172, "weight": 67, "vjump": 58, "shuttle": 11.2, "situps": 45, "run1600": 6.2, "pushups": 40, "pullups": 12 },
        "female": { "height": 161, "weight": 56, "vjump": 44, "shuttle": 12.4, "situps": 37, "run1600": 7.1, "pushups": 25, "pullups": 4 },
    }

@app.post("/api/analyze-video")
def analyze_video_endpoint(
    file: UploadFile = File(...),
    test_id: str = Form("auto"),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Save the file temporarily
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Process using ml module
        analysis_result = ml.analyze_video(temp_file_path, test_id)
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))
        
    if os.path.exists(temp_file_path):
        os.remove(temp_file_path)
        
    return analysis_result

@app.get("/api/coaches", response_model=List[schemas.User])
def get_coaches(db: Session = Depends(get_db)):
    coaches = db.query(models.User).filter(models.User.role == "coach").all()
    return coaches

@app.post("/api/shortlist")
def toggle_shortlist(req: schemas.ShortlistCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "coach":
        raise HTTPException(status_code=403, detail="Only coaches can shortlist athletes")
        
    existing = db.query(models.Shortlist).filter(
        models.Shortlist.coach_id == current_user.id,
        models.Shortlist.athlete_id == req.athlete_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed"}
    else:
        new_sl = models.Shortlist(coach_id=current_user.id, athlete_id=req.athlete_id)
        db.add(new_sl)
        db.commit()
        return {"status": "added"}

@app.get("/api/shortlist", response_model=List[int])
def get_shortlist(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "coach":
        return []
    items = db.query(models.Shortlist).filter(models.Shortlist.coach_id == current_user.id).all()
    return [item.athlete_id for item in items]

@app.post("/api/messages", response_model=schemas.Message)
def send_message(msg: schemas.MessageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=msg.receiver_id,
        content=msg.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@app.get("/api/messages/{other_user_id}", response_model=List[schemas.Message])
def get_messages(other_user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    messages = db.query(models.Message).filter(
        or_(
            (models.Message.sender_id == current_user.id) & (models.Message.receiver_id == other_user_id),
            (models.Message.sender_id == other_user_id) & (models.Message.receiver_id == current_user.id)
        )
    ).order_by(models.Message.timestamp.asc()).all()
    return messages
