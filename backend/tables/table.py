from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    Float,
    ForeignKey,
    LargeBinary,
    LargeBinary,
    Numeric,
    SmallInteger,
)
from sqlalchemy.orm import declarative_base, relationship, backref
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer(), primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    password = Column(String(60), nullable=False, unique=True)
    email = Column(String(255), nullable=True, unique=True)
    date_joined = Column(DateTime(), default=datetime.now)
    profile_id = Column(Integer(), ForeignKey("profiles.profile_id"))
    profile = relationship("Profile", backref=backref("user", uselist=False))
    goal_id = Column(Integer(), ForeignKey("goals.goal_id"))
    goal = relationship("Goal", backref=backref("user", uselist=False))


class Profile(Base):
    __tablename__ = "profiles"

    profile_id = Column(Integer(), primary_key=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    gender = Column(String(50), nullable=False)
    date_of_birth = Column(DateTime(), nullable=False)
    height = Column(Float(), nullable=False)
    weight = Column(Float(), nullable=False)
    phone_number = Column(String(50), nullable=False)
    profile_photo = Column(Text, nullable=True)
    before_photo = Column(Text, nullable=True)
    after_photo = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    is_admin = Column(Boolean(), default=False)


class Goal(Base):
    __tablename__ = "goals"

    goal_id = Column(Integer(), primary_key=True)
    calorie_goal = Column(Integer(), nullable=True)
    water_goal = Column(Float(), nullable=True)
    weight_goal = Column(Float(), nullable=True)


class Record(Base):
    __tablename__ = "records"

    record_id = Column(Integer(), primary_key=True)
    user_id = Column(Integer(), ForeignKey("users.user_id"))
    user = relationship("User", backref=backref("records"))
    date_added = Column(DateTime(), nullable=False, default=datetime.now)
    record_type = Column(String(20))
    hydration = relationship("Hydration", backref=backref("records"))
    calories = relationship("Calorie", backref=backref("records"))
    composition = relationship("Composition", backref=backref("records"))


class Calorie(Base):
    __tablename__ = "calories"

    calorie_id = Column(Integer(), primary_key=True)
    record_id = Column(Integer(), ForeignKey("records.record_id"))
    # record = relationship("Record", backref=backref("calories"))
    food_item = Column(Text())
    calories_consumed = Column(Integer())


class Hydration(Base):
    __tablename__ = "hydration"

    hydration_id = Column(Integer(), primary_key=True)
    record_id = Column(Integer(), ForeignKey("records.record_id"))
    # record = relationship("Record", backref=backref("hydration"))
    water_consumed_milli_litres = Column(Integer(), nullable=False)


class Composition(Base):
    __tablename__ = "compositions"

    composition_id = Column(Integer(), primary_key=True)
    record_id = Column(Integer(), ForeignKey("records.record_id"))
    # record = relationship("Record", backref=backref("compositions"))
    bone_mass = Column(Numeric(5, 2))
    body_mass_index = Column(Numeric(5, 2))
    body_fat_percentage = Column(Numeric(4, 1))
    muscle_mass = Column(Numeric(5, 2))
    water_percentage = Column(Numeric(4, 1))
    protein_percentage = Column(Numeric(4, 1))
    basal_metabolism = Column(SmallInteger())
    visceral_fat = Column(SmallInteger())
    weight = Column(Numeric(5, 2))
    ideal_weight = Column(Numeric(5, 2))
    metabolic_age = Column(SmallInteger())
    body_type = Column(String(255))


class Workout(Base):
    __tablename__ = "workouts"

    workout_id = Column(Integer(), primary_key=True)
    record_id = Column(Integer(), ForeignKey("records.record_id"))
    # record = relationship("Record", backref=backref("workouts"))
    muscle_group_worked = Column(String(255))
    calories_burned = Column(Integer())
    workout_name = Column(String(255))


class Photo(Base):
    __tablename__ = "photos"

    photo_id = Column(Integer(), primary_key=True)
    record_id = Column(Integer(), ForeignKey("records.record_id"))
    # record = relationship("Record", backref=backref("photos"))
    d_type = Column(String(100))
    image = Column(Text())
    caption = Column(Text())


class Video(Base):
    __tablename__ = "videos"

    video_id = Column(Integer(), primary_key=True)
    record_id = Column(Integer(), ForeignKey("records.record_id"))
    # record = relationship("Record", backref=backref("videos"))
    d_type = Column(String(100))
    video = Column(Text())
    caption = Column(Text())
