from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="athlete") # "athlete", "coach", "admin"

    athlete_profile = relationship("Athlete", back_populates="user", uselist=False)

class Athlete(Base):
    __tablename__ = "athletes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, index=True)
    age = Column(Integer)
    state = Column(String)
    gender = Column(String)
    score = Column(Integer, default=0)
    badge = Column(String, default="Developing")
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    verified = Column(Boolean, default=False)
    paraCategory = Column(String, nullable=True)
    
    tags = Column(JSON, default=list)
    flags = Column(JSON, default=list)
    
    user = relationship("User", back_populates="athlete_profile")
    scores = relationship("TestScore", back_populates="athlete", cascade="all, delete-orphan")

class TestScore(Base):
    __tablename__ = "test_scores"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    test_id = Column(String) # "height", "weight", "vjump"
    value = Column(Float)

    athlete = relationship("Athlete", back_populates="scores")

class TestDefinition(Base):
    __tablename__ = "test_definitions"
    
    id = Column(String, primary_key=True, index=True) # "height"
    label = Column(String)
    icon = Column(String)
    unit = Column(String)
    color = Column(String)
    aiModule = Column(String)
    min_val = Column(Float)
    max_val = Column(Float)

class Shortlist(Base):
    __tablename__ = "shortlists"
    
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("users.id"))
    athlete_id = Column(Integer, ForeignKey("athletes.id"))

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
