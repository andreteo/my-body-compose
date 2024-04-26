import os, bcrypt, psycopg2, pickle, json
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
from pathlib import Path
from tables.table import User, Profile

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

# .env
dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path)

# Flask App
app = Flask(__name__)
CORS(app)


# JWT Authentication
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
JWTManager(app)

# Connect to DB
try:
    url = URL.create(
        drivername="postgresql",
        username=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASS"),
        host=os.getenv("POSTGRES_HOST", "127.0.0.1"),
        port=os.getenv("POSTGRES_PORT", 5432),
        database=os.getenv("POSTGRES_DB"),
    )

    engine = create_engine(url)

    Base = declarative_base()
    Base.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    connection = engine.connect()
    print("Connected to PostgreSQL")

except (psycopg2.Error, Exception) as e:
    print(f"Error while connecting to PostgreSQL: {e}")


def obj_to_dict(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}


# APIs
@app.route("/")
def home():
    return "Hello, World!"


@app.route("/auth/register", methods=["POST"])
def register():
    if request.is_json:
        data = request.json
        print(data)
        hashed_password = bcrypt.hashpw(
            data["password"].encode("utf-8"), bcrypt.gensalt()
        )

        new_profile = Profile(
            first_name=data["first_name"],
            last_name=data["last_name"],
            gender=data["gender"],
            date_of_birth=data["date_of_birth"],
            height=data["height"],
            weight=data["weight"],
            phone_number=data["phone_number"],
            profile_photo=data["profile_photo"],
            bio=data["bio"],
        )

        try:
            session.add(new_profile)
            session.commit()

            new_user = User(
                username=data["username"],
                password=hashed_password.decode(),
                email=data["email"],
                profile_id=new_profile.profile_id,
            )

            session.add(new_user)
            session.commit()

            return make_response(
                jsonify({"ok": True, "message": "User registered successfully"}), 200
            )
        except Exception as e:
            session.rollback()
            return make_response(
                jsonify(
                    {"ok": False, "message": "Failed to register user", "error": str(e)}
                ),
                500,
            )

    else:
        return make_response(
            jsonify({"ok": False, "error": "Request must contain JSON data"}),
            400,
        )


@app.route("/auth/login", methods=["POST"])
def login():
    if request.is_json:
        data = request.json
        user = session.query(User).filter_by(username=data["username"]).first()

        if user:
            if bcrypt.checkpw(
                data["password"].encode("utf-8"), user.password.encode("utf-8")
            ):
                user_profile = (
                    session.query(Profile).filter_by(profile_id=user.profile_id).first()
                )

                access_token = create_access_token(identity=data["username"])

                response_data = {
                    "token": access_token,
                    "user_profile": obj_to_dict(user_profile),
                }
                return make_response(jsonify(response_data), 200)
            else:
                response_data = {"ok": False, "message": "Bad Username or Password"}
                return make_response(jsonify(response_data), 401)
        else:
            response_data = {"ok": False, "message": "User not found"}
            return make_response(jsonify(response_data), 404)
    else:
        response_data = {"ok": False, "error": "Request must contain JSON data"}
        return make_response(jsonify(response_data), 400)


@app.route("/user/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    user_found = get_jwt_identity()

    if user_found:
        user = session.query(User).filter_by(username=user_found).first()
        user_profile = (
            session.query(Profile).filter_by(profile_id=user.profile_id).first()
        )

        if user_profile:
            profile_dict = obj_to_dict(
                user_profile
            )  # Convert SQLAlchemy object to dictionary
            response_data = {"ok": True, "user_profile": profile_dict}
            return make_response(jsonify(response_data), 200)
        else:
            response_data = {"ok": False, "message": "User profile not found"}
            return make_response(jsonify(response_data), 404)
    else:
        response_data = {"ok": False, "message": "User not found"}
        return make_response(jsonify(response_data), 404)


@app.route("/user/profile/edit", methods=["POST"])
@jwt_required()
def edit_user_profile():
    if request.is_json:
        user_found = get_jwt_identity()

        if user_found:
            data = request.json

            user = session.query(User).filter_by(username=user_found).first()
            user_profile = (
                session.query(Profile).filter_by(profile_id=user.profile_id).first()
            )

            if user_profile:
                changed = []
                for k, v in data.items():
                    if data[k] != getattr(user_profile, k):
                        setattr(user_profile, k, v)
                        changed.append(k)

                session.commit()
                response_data = {
                    "ok": True,
                    "message": "Profile updated",
                    "user_profile": obj_to_dict(user_profile),
                    "changed": changed,
                }
                return make_response(jsonify(response_data), 200)
            else:
                response_data = {"ok": False, "message": "User profile not found"}
                return make_response(jsonify(response_data), 404)
        else:
            response_data = {"ok": False, "message": "User not found"}
            return make_response(jsonify(response_data), 404)
    else:
        response_data = {"ok": False, "error": "Request must contain JSON data"}
        return make_response(jsonify(response_data), 400)


if __name__ == "__main__":
    app.run(debug=True)
