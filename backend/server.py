import os, bcrypt, psycopg2, pickle
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy.orm import declarative_base, sessionmaker
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


# APIs
@app.route("/")
def home():
    return "Hello, World!"


@app.route("/auth/register", methods=["POST"])
def register():
    if request.is_json:
        data = request.json
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
            profile_photo=pickle.dumps(data["profile_photo"]),
            phone_number=data["phone_number"],
        )

        new_user = User(
            username=data["username"],
            password=hashed_password.decode(),
            email=data["email"],
            profile_id=new_profile.profile_id,
        )

        try:
            session.add_all([new_profile, new_user])
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
                access_token = create_access_token(identity=data["username"])
                response_data = {
                    "ok": True,
                    "message": "Login successful",
                    "token": access_token,
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


if __name__ == "__main__":
    app.run(debug=True)
