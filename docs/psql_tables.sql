CREATE TABLE profiles (
	profile_id SERIAL PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	gender VARCHAR(50) NOT NULL,
	date_of_birth DATE NOT NULL DEFAULT CURRENT_DATE,
	height FLOAT NOT NULL,
	weight FLOAT NOT NULL,
	phone_number VARCHAR(50) UNIQUE NOT NULL,
	profile_photo TEXT,
	before_photo TEXT,
	after_photo TEXT,
	bio TEXT,
	is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE goals (
	goal_id SERIAL PRIMARY KEY,
	calorie_goal INT,
	water_goal FLOAT,
	weight_goal NUMERIC(5,2)
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
	profile_id INTEGER REFERENCES profiles(profile_id),
	goal_id INTEGER REFERENCES goals(goal_id),
    username VARCHAR(50) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE,
	date_joined TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE records (
	record_id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(user_id),
	date_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	record_type CHAR(20)
);

CREATE TABLE calories (
	calorie_id SERIAL PRIMARY KEY,
	record_id INTEGER REFERENCES records(record_id),
	food_item TEXT,
	calories_consumed INT
);

CREATE TABLE hydration (
	hydration_id SERIAL PRIMARY KEY,
	record_id INTEGER REFERENCES records(record_id),
	water_consumed_milli_litres INT,
);

CREATE TABLE compositions (
	composition_id SERIAL PRIMARY KEY,
	record_id INTEGER REFERENCES records(record_id),
	bone_mass NUMERIC(5,2),
	body_mass_index NUMERIC(5,2),
	body_fat_percentage NUMERIC(4,1),
	muscle_mass NUMERIC(5,2),
	water_percentage NUMERIC(4,1),
	protein_percentage NUMERIC(4,1),
	basal_metabolism SMALLINT,
	visceral_fat SMALLINT,
	weight NUMERIC(5,2),
	ideal_weight NUMERIC(5,2),
	metabolic_age SMALLINT,
	body_type VARCHAR(20)
);


CREATE TABLE workouts (
	workout_id SERIAL PRIMARY KEY,
	record_id INTEGER REFERENCES records(record_id),
	muscle_group_worked VARCHAR(255),
	calories_burned INT,
	workout_name VARCHAR(255)
);

CREATE TABLE photos (
	photo_id SERIAL PRIMARY KEY,
	record_id INTEGER REFERENCES records(record_id),
	d_type VARCHAR(100),
	image TEXT,
	caption TEXT,
);

CREATE TABLE videos (
	video_id SERIAL PRIMARY KEY,
	record_id INTEGER REFERENCES records(record_id),
	d_type VARCHAR(100),
	video TEXT,
	caption TEXT
);




