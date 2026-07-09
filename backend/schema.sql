CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'passenger',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES users(id),
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  seats_available INTEGER NOT NULL,
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id),
  passenger_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id),
  reviewer_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE trips
 ADD COLUMN origin_lat DECIMAL(10,8),
 ADD COLUMN origin_lng DECIMAL(10,8),
 ADD COLUMN dest_lat DECIMAL(10,8),
 ADD COLUMN dest_lng DECIMAL(10,8);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id),
  user_id INTEGER REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE trips
 ADD COLUMN car_model VARCHAR(100),
 ADD COLUMN license_plate VARCHAR(50);

 ALTER TABLE trips ADD COLUMN status VARCHAR(20) DEFAULT 'active';
 ALTER TABLE users ADD COLUMN phone VARCHAR(20);

