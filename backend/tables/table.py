from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, LargeBinary, LargeBinary
from sqlalchemy.orm import declarative_base, relationship, backref
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer(), primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    password = Column(String(60), nullable=False, unique=True)
    email = Column(String(255), nullable=True, unique=True)
    date_joined = Column(DateTime(), default=datetime.now)
    profile_id = Column(Integer(), ForeignKey('profiles.profile_id'))
    profile = relationship('Profile', backref=backref('user', uselist=False))


class Profile(Base):
    __tablename__ = 'profiles'

    profile_id = Column(Integer(), primary_key=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    gender = Column(String(50), nullable=False)
    date_of_birth = Column(DateTime(), nullable=False)
    height = Column(Float(), nullable=False)
    weight = Column(Float(), nullable=False)
    phone_number = Column(String(50), nullable=False)
    profile_photo = Column(LargeBinary, nullable=True)

