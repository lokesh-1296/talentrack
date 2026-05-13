from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class TestScoreBase(BaseModel):
    test_id: str
    value: float

class TestScoreCreate(TestScoreBase):
    pass

class TestScore(TestScoreBase):
    id: int
    athlete_id: int

    class Config:
        from_attributes = True

class AthleteBase(BaseModel):
    name: str
    age: int
    state: str
    gender: str
    score: int = 0
    badge: str = "Developing"
    xp: int = 0
    coins: int = 0
    verified: bool = False
    paraCategory: Optional[str] = None
    tags: List[str] = []
    flags: List[str] = []

class AthleteCreate(AthleteBase):
    pass

class Athlete(AthleteBase):
    id: int
    user_id: Optional[int] = None
    scores: List[TestScore] = []

    class Config:
        from_attributes = True

class TestDefinitionBase(BaseModel):
    id: str
    label: str
    icon: str
    unit: str
    color: str
    aiModule: str
    min_val: float
    max_val: float

class TestDefinition(TestDefinitionBase):
    class Config:
        from_attributes = True

class ScoreSubmitRequest(BaseModel):
    athlete_id: int
    test_id: str
    value: float

class UserBase(BaseModel):
    email: str
    role: str = "athlete"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class ShortlistCreate(BaseModel):
    athlete_id: int

class Shortlist(BaseModel):
    id: int
    coach_id: int
    athlete_id: int
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class Message(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
