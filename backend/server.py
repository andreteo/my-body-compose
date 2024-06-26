import os, bcrypt, psycopg2, pickle, json
from datetime import datetime, date, timedelta, timezone
from urllib import response

from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import URL
from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
    load_only,
    joinedload,
    class_mapper,
)
from dotenv import load_dotenv
from pathlib import Path
from tables.table import *

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    JWTManager,
    get_jwt,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)

# .env
dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path)

# Flask App
app = Flask(__name__)
CORS(app)


# JWT Authentication
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

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
        hashed_password = bcrypt.hashpw(
            data["password"].encode("utf-8"), bcrypt.gensalt()
        )

        try:
            new_profile = Profile(
                first_name=data["first_name"],
                last_name=data["last_name"],
                gender=data["gender"],
                date_of_birth=data["date_of_birth"],
                height=data["height"],
                weight=data["weight"],
                phone_number=data["phone_number"],
            )

            for k in [
                "profile_photo",
                "before_photo",
                "after_photo",
                "bio",
                "is_admin",
            ]:
                if k in data:
                    setattr(new_profile, k, data[k])

            session.add(new_profile)
            session.commit()

            new_goal = Goal(
                calorie_goal=data["calorie_goal"],
                water_goal=data["water_goal"],
                weight_goal=data["weight_goal"],
            )

            session.add(new_goal)
            session.commit()

            new_user = User(
                username=data["username"],
                password=hashed_password.decode(),
                email=data["email"],
                profile_id=new_profile.profile_id,
                goal_id=new_goal.goal_id,
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

                set_access_cookies(jsonify({"msg": "Login Successful"}), access_token)

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


@app.route("/auth/logout", methods=["POST"])
def logout():
    response_data = jsonify({"msg": "Logout Successful"})
    unset_jwt_cookies(response_data)
    return response_data


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


@app.route("/user/profile/photos", methods=["GET"])
@jwt_required()
def get_user_profile_images():
    user_found = get_jwt_identity()

    if user_found:
        try:
            user = session.query(User).filter_by(username=user_found).first()
            user_profile = (
                session.query(Profile)
                .options(
                    load_only(
                        Profile.profile_photo, Profile.before_photo, Profile.after_photo
                    )
                )
                .filter_by(profile_id=user.profile_id)
                .first()
            )

            if user_profile:
                profile_dict = {
                    "before_photo": user_profile.before_photo,
                    "after_photo": user_profile.after_photo,
                }

                response_data = {"ok": True, "user_photos": profile_dict}
                return make_response(jsonify(response_data), 200)
            else:
                response_data = {"ok": False, "message": "User profile not found"}
                return make_response(jsonify(response_data), 404)
        except Exception as e:
            # Handle any exceptions (e.g., database errors)
            response_data = {"ok": False, "message": str(e)}
            return make_response(jsonify(response_data), 500)
    else:
        response_data = {"ok": False, "message": "User not found"}
        return make_response(jsonify(response_data), 404)


@app.route("/user/profile/goals", methods=["GET"])
@jwt_required()
def get_user_profile_goals():
    user_found = get_jwt_identity()

    if user_found:
        try:
            user = session.query(User).filter_by(username=user_found).first()
            if user:
                user_goals = session.query(Goal).filter_by(goal_id=user.goal_id).first()

                if user_goals:
                    goals_dict = {
                        "calorie_goal": user_goals.calorie_goal,
                        "water_goal": user_goals.water_goal,
                        "weight_goal": user_goals.weight_goal,
                    }

                    response_data = {"ok": True, "user_goals": goals_dict}
                    return make_response(jsonify(response_data), 200)
                else:
                    response_data = {"ok": False, "message": "User goals not found"}
                    return make_response(jsonify(response_data), 404)
            else:
                response_data = {"ok": False, "message": "User not found"}
                return make_response(jsonify(response_data), 404)
        except Exception as e:
            # Handle any exceptions (e.g., database errors)
            response_data = {"ok": False, "message": str(e)}
            return make_response(jsonify(response_data), 500)
    else:
        response_data = {"ok": False, "message": "User not found"}
        return make_response(jsonify(response_data), 404)


@app.route("/user/profile/goals", methods=["PATCH"])
@jwt_required()
def update_user_goals():
    user_found = get_jwt_identity()

    if user_found:
        try:
            user = session.query(User).filter_by(username=user_found).first()
            if user:
                data = request.json

                new_goals = {k: data.get(k) for k in data.keys() if k}

                user_goals = session.query(Goal).filter_by(goal_id=user.goal_id).first()

                if user_goals:
                    for key, value in new_goals.items():
                        # Update each goal attribute individually
                        setattr(user_goals, key, value)

                    session.commit()

                    response_data = {
                        "ok": True,
                        "message": "Goals updated successfully",
                    }
                    return make_response(jsonify(response_data), 200)
                else:
                    response_data = {"ok": False, "message": "User goals not found"}
                    return make_response(jsonify(response_data), 404)
            else:
                response_data = {"ok": False, "message": "User not found"}
                return make_response(jsonify(response_data), 404)
        except Exception as e:
            # Handle any exceptions (e.g., database errors)
            response_data = {"ok": False, "message": str(e)}
            return make_response(jsonify(response_data), 500)
    else:
        response_data = {"ok": False, "message": "User not found"}
        return make_response(jsonify(response_data), 404)


@app.route("/user/records/composition", methods=["GET"])
@jwt_required()
def get_user_composition_records():
    user_found = get_jwt_identity()

    if user_found:
        try:
            user = session.query(User).filter_by(username=user_found).first()

            if user:
                user_records = (
                    session.query(Record)
                    .options(joinedload(Record.composition))
                    .filter(
                        Record.user_id == user.user_id,
                    )
                    .order_by(Record.date_added)
                    .all()
                )

                if user_records:
                    composition_data = {
                        column.key: []
                        for column in class_mapper(Composition).columns
                        if "_id" not in column.key
                    }
                    composition_data.update({"date_added": []})

                    # all_composition_tables = [
                    #     session.query(Composition)
                    #     .filter_by(record_id=user_record.record_id)
                    #     .all()
                    #     for user_record in user_records
                    #     if user_record is not None
                    # ]

                    for user_record in user_records:
                        for composition_record in user_record.composition:
                            for key in composition_data.keys():
                                if key == "date_added":
                                    composition_data[key].append(user_record.date_added)
                                    continue

                                composition_data[key].append(
                                    getattr(composition_record, key)
                                )

                    response_data = {"ok": True, "user_records": composition_data}
                    return make_response(jsonify(response_data), 200)
                else:
                    response_data = {"ok": True, "user_records": []}
                    return make_response(jsonify(response_data), 200)

            else:
                response_data = {"ok": False, "message": "User not found"}
                return make_response(jsonify(response_data), 404)
        except Exception as e:
            # Handle any exceptions (e.g., database errors)
            response_data = {"ok": False, "message": str(e)}
            return make_response(jsonify(response_data), 500)
    else:
        response_data = {"ok": False, "message": "User not found"}
        return make_response(jsonify(response_data), 404)


@app.route("/user/records/today", methods=["GET"])
@jwt_required()
def get_sum_of_user_records_today():
    user_found = get_jwt_identity()

    if user_found:
        try:
            res = 0
            user = session.query(User).filter_by(username=user_found).first()

            if user:
                start_of_day = datetime.now().replace(
                    hour=0, minute=0, second=0, microsecond=0
                )
                end_of_day = start_of_day + timedelta(days=1)

                user_records = (
                    session.query(Record)
                    .options(joinedload(Record.hydration))
                    .options(joinedload(Record.calories))
                    .filter(
                        Record.user_id == user.user_id,
                        Record.date_added >= start_of_day,
                        Record.date_added < end_of_day,
                    )
                    .all()
                )

                if user_records:
                    record_type = request.args.get("record_type")

                    if record_type == "hydration":
                        hydration_records = []

                        for user_record in user_records:
                            (
                                hydration_records.extend(user_record.hydration)
                                if user_record.hydration
                                else None
                            )

                        if hydration_records:
                            res = sum(
                                [
                                    record.water_consumed_milli_litres
                                    for record in hydration_records
                                ]
                            )

                    elif record_type == "calories":
                        calorie_records = []

                        for user_record in user_records:
                            (
                                calorie_records.extend(user_record.calories)
                                if user_record.calories
                                else None
                            )

                        if calorie_records:
                            res = sum(
                                [record.calories_consumed for record in calorie_records]
                            )
                    elif record_type == "compositions":
                        user_record = (
                            session.query(Record)
                            .options(joinedload(Record.composition))
                            .filter(
                                Record.user_id == user.user_id,
                                Record.date_added >= start_of_day,
                                Record.date_added < end_of_day,
                            )
                            .order_by(Record.date_added.desc())
                            .first()
                        )

                        if user_record and user_record.composition:
                            last_composition = user_record.composition[-1]
                            res = obj_to_dict(last_composition)
                        else:
                            get_compositions_columns = inspect(
                                Composition
                            ).columns.keys()
                            res = {k: "Not measured" for k in get_compositions_columns}

                    response_data = {"ok": True, "user_records": res}
                    return make_response(jsonify(response_data), 200)
                else:
                    if request.args.get("record_type") == "compositions":
                        get_compositions_columns = inspect(Composition).columns.keys()
                        res = {k: "Not measured" for k in get_compositions_columns}
                    else:
                        res = 0
                    response_data = {"ok": True, "user_records": res}
                    return make_response(jsonify(response_data), 200)

            else:
                response_data = {"ok": False, "message": "User not found"}
                return make_response(jsonify(response_data), 404)
        except Exception as e:
            # Handle any exceptions (e.g., database errors)
            response_data = {"ok": False, "message": str(e)}
            return make_response(jsonify(response_data), 500)
    else:
        response_data = {"ok": False, "message": "User not found"}
        return make_response(jsonify(response_data), 404)


@app.route("/user/records/insert", methods=["PUT"])
@jwt_required()
def insert_records():
    if request.is_json:
        user_found = get_jwt_identity()

        if user_found:
            data = request.json
            user = session.query(User).filter_by(username=user_found).first()

            if "record_type" in data:
                record_type = data["record_type"]

                new_record_type = Record(
                    user_id=user.user_id,
                    record_type=data["record_type"],
                )

                if "date_added" in data:
                    setattr(new_record_type, "date_added", data["date_added"])

                session.add(new_record_type)
                session.commit()

                if record_type == "hydration":
                    if "water_consumed_milli_litres" in data:
                        amount = data["water_consumed_milli_litres"]
                        new_record = Hydration(
                            record_id=new_record_type.record_id,
                            water_consumed_milli_litres=amount,
                        )
                    else:
                        session.rollback()
                        response_data = {
                            "ok": False,
                            "error": "'water_consumed_milli_litres' field is missing for hydration record",
                        }
                        return make_response(jsonify(response_data), 400)
                elif record_type == "calories":
                    if "calories_consumed" in data and "food_item" in data:
                        food_type = data["food_item"]
                        amount = data["calories_consumed"]
                        new_record = Calorie(
                            record_id=new_record_type.record_id,
                            food_item=food_type,
                            calories_consumed=amount,
                        )
                    else:
                        response_data = {
                            "ok": False,
                            "error": "Some field(s) is missing for calories record",
                        }
                        return make_response(jsonify(response_data), 400)
                elif record_type == "compositions":
                    get_compositions_columns = inspect(Composition).columns.keys()
                    filtered_compositions_columns = list(
                        filter(
                            lambda key: "_id" not in key,
                            get_compositions_columns,
                        )
                    )

                    res = {}

                    for k in filtered_compositions_columns:
                        if k in data:
                            res[k] = data[k]

                    # if res turns out empty, it means none of the keys in data match the columns in Composition table
                    if not res:
                        session.rollback()
                        response_data = {
                            "ok": False,
                            "error": "'water_consumed_milli_litres' field is missing for hydration record",
                        }
                        return make_response(jsonify(response_data), 400)

                    new_record = Composition(record_id=new_record_type.record_id)

                    for k, v in res.items():
                        setattr(new_record, k, v)

                elif record_type == "workouts":
                    # Handle workouts record
                    pass
                elif record_type == "photos":
                    # Handle photos record
                    pass
                elif record_type == "videos":
                    # Handle videos record
                    pass
                else:
                    response_data = {"ok": False, "error": "Invalid record type"}
                    return make_response(jsonify(response_data), 400)

                session.add(new_record)
                session.commit()

                response_data = {"ok": True, "message": "Record inserted successfully"}
                return make_response(jsonify(response_data), 200)

            else:
                response_data = {"ok": False, "error": "Record type not provided"}
                return make_response(jsonify(response_data), 400)

        else:
            response_data = {"ok": False, "message": "User not found"}
            return make_response(jsonify(response_data), 404)
    else:
        response_data = {"ok": False, "error": "Request must contain JSON data"}
        return make_response(jsonify(response_data), 400)


@app.route("/user/profile/checkadmin", methods=["GET"])
@jwt_required()
def check_admin():
    user_found = get_jwt_identity()
    if user_found:
        user = session.query(User).filter_by(username=user_found).first()
        if user:
            user_profile = (
                session.query(Profile).filter_by(profile_id=user.profile_id).first()
            )
            if user_profile:
                if user_profile.is_admin:
                    response_data = {"ok": True, "is_admin": True}
                else:
                    response_data = {"ok": True, "is_admin": False}
                return make_response(jsonify(response_data), 200)
            else:
                response_data = {
                    "ok": False,
                    "message": "Profile not found for the user",
                }
                return make_response(jsonify(response_data), 404)
        else:
            response_data = {"ok": False, "message": "User not found"}
            return make_response(jsonify(response_data), 404)
    else:
        response_data = {"ok": False, "message": "User not found"}
        return make_response(jsonify(response_data), 404)


@app.route("/auth/refresh", methods=["GET"])
@jwt_required()
def get_refresh_token():
    user_found = get_jwt_identity()

    exp_timestamp = get_jwt()["exp"]
    now = datetime.now(timezone.utc)
    target_timestamp = datetime.timestamp(now + timedelta(minutes=30))

    if target_timestamp > exp_timestamp:
        user_profile = (
            session.query(Profile).filter_by(profile_id=user_found.profile_id).first()
        )

        access_token = create_access_token(identity=user_found.username)

        # Set access token in cookies
        response = make_response(jsonify({"msg": "Refresh Successful"}), 200)
        set_access_cookies(response, access_token)

        response_data = {
            "ok": True,
            "token": access_token,
            # "user_profile": obj_to_dict(user_profile),
        }

        return make_response(jsonify(response_data), 200)
    else:
        return make_response(jsonify({"ok": False, "msg": "Token not expired"}), 200)


@app.route("/user/users", methods=["GET"])
@jwt_required()
def get_all_users():
    user_found = get_jwt_identity()

    if user_found:
        try:
            user = session.query(User).filter_by(username=user_found).first()

            if user:
                user_profile = (
                    session.query(Profile).filter_by(profile_id=user.profile_id).first()
                )

                if user_profile:
                    if user_profile.is_admin:
                        all_users = session.query(User).all()
                        all_user_profiles = session.query(Profile).all()

                        users_data = [obj_to_dict(u) for u in all_users]

                        profiles_data = [
                            obj_to_dict(profile) for profile in all_user_profiles
                        ]

                        response_data = {
                            "ok": True,
                            "users": users_data,
                            "profiles": profiles_data,
                        }
                        return make_response(jsonify(response_data), 200)
                    else:
                        response_data = {"ok": False, "message": "User is not an admin"}
                        return make_response(jsonify(response_data), 403)
                else:
                    response_data = {"ok": False, "message": "User profile not found"}
                    return make_response(jsonify(response_data), 404)
            else:
                response_data = {"ok": False, "message": "User not found"}
                return make_response(jsonify(response_data), 404)
        except Exception as e:
            response_data = {"ok": False, "message": str(e)}
            return make_response(jsonify(response_data), 500)
    else:
        response_data = {"ok": False, "message": "User not found"}
        return make_response(jsonify(response_data), 404)


@app.route("/user/privileges/admin", methods=["POST"])
@jwt_required()
def add_remove_admin_privileges():
    if request.is_json:
        data = request.json
        user_admin_found = get_jwt_identity()

        user_admin = session.query(User).filter_by(username=user_admin_found).first()
        user_admin_profile = (
            session.query(Profile).filter_by(profile_id=user_admin.profile_id).first()
        )

        if user_admin_profile and user_admin_profile.is_admin:
            user_in_moderation = (
                session.query(User).filter_by(user_id=data["user_id"]).first()
            )

            if user_in_moderation:
                user_in_moderation_profile = (
                    session.query(Profile)
                    .filter_by(profile_id=user_in_moderation.profile_id)
                    .first()
                )

                if user_in_moderation_profile:
                    user_in_moderation_profile.is_admin = (
                        not user_in_moderation_profile.is_admin
                    )
                    session.commit()

                    response_data = {
                        "ok": True,
                        "message": "Profile updated",
                        "user_profile": obj_to_dict(user_in_moderation_profile),
                    }
                else:
                    response_data = {
                        "ok": False,
                        "message": "User in moderation profile not found",
                    }
            else:
                response_data = {"ok": False, "message": "User in moderation not found"}
        else:
            response_data = {
                "ok": False,
                "message": "User does not have admin privileges",
            }

        return make_response(jsonify(response_data), 200)
    else:
        response_data = {"ok": False, "error": "Request must contain JSON data"}
        return make_response(jsonify(response_data), 400)


@app.route("/user/privileges/delete", methods=["POST"])
@jwt_required()
def delete_user():
    if request.is_json:
        data = request.json
        user_admin_found = get_jwt_identity()

        if user_admin_found:
            user_admin = (
                session.query(User).filter_by(username=user_admin_found).first()
            )
            user_admin_profile = (
                session.query(Profile)
                .filter_by(profile_id=user_admin.profile_id)
                .first()
            )

            if user_admin_profile and user_admin_profile.is_admin:
                user_to_delete = (
                    session.query(User).filter_by(user_id=data["user_id"]).first()
                )

                if user_to_delete:
                    session.delete(user_to_delete)
                    session.commit()

                    response_data = {
                        "ok": True,
                        "message": "User deleted successfully",
                    }
                    return make_response(jsonify(response_data), 200)
                else:
                    response_data = {
                        "ok": False,
                        "message": "User to delete not found",
                    }
                    return make_response(jsonify(response_data), 404)
            else:
                response_data = {
                    "ok": False,
                    "message": "User does not have admin privileges",
                }
                return make_response(jsonify(response_data), 403)
        else:
            response_data = {"ok": False, "message": "User not found"}
            return make_response(jsonify(response_data), 404)
    else:
        response_data = {"ok": False, "error": "Request must contain JSON data"}
        return make_response(jsonify(response_data), 400)


if __name__ == "__main__":
    app.run(debug=True)
