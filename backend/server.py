import os
import bcrypt
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy.orm import declarative_base, sessionmaker
from tables.table import User, Profile

dotenv_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path)


app = Flask(__name__)

try:
    url = URL.create(
        drivername='postgresql',
        username=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASS'),
        host=os.getenv('POSTGRES_HOST', '127.0.0.1'),
        port=os.getenv('POSTGRES_PORT', 5432),
        database=os.getenv('POSTGRES_DB'),
    )

    engine = create_engine(url)

    Base = declarative_base()
    Base.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    connection = engine.connect()
    print('Connected to PostgreSQL')

except (psycopg2.Error, Exception) as e:
    print(f'Error while connecting to PostgreSQL: {e}')


@app.route('/')
def home():
    return 'Hello, World!'


@app.route('/register', methods=['POST'])
def register():
    if request.is_json:
        data = request.json
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

        new_profile = Profile(first_name=data['first_name'],
                              last_name=data['last_name'],
                              gender=data['gender'],
                              date_of_birth=data['date_of_birth'],
                              height=data['height'],
                              weight=data['weight'],
                              phone_number=data['phone_number'])

        new_user = User(username=data['username'],
                        password=hashed_password.decode(),
                        email=data['email'],
                        profile_id=new_profile.profile_id)

        try:
            session.add_all([new_profile, new_user])
            session.commit()
            return jsonify({'ok': True, 'message': 'User registered successfully'}), 200
        except Exception as e:
            session.rollback()
            return jsonify({'ok': False, 'message': 'Failed to register user', 'error': str(e)}), 500
    else:
        return jsonify({'ok': False, 'error': 'Request must contain JSON data'}), 400


@app.route('/login', methods=['POST'])
def login():
    if request.is_json:
        data = request.json
        user = session.query(User).filter_by(username=data['username']).first()

        if user:
            if bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
                return jsonify({'message': 'Login successful'}), 200
            else:
                return jsonify({'message': 'Invalid credentials'}), 401
        else:
            return jsonify({'message': 'User not found'}), 404
    else:
        return jsonify({'error': 'Request must contain JSON data'}), 400



if __name__ == '__main__':
    app.run(debug=True)
