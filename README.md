# University Carpooling Platform

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

A fully functional, real-time carpooling web application built specifically for university students. This platform allows students to offer rides and join carpools safely, featuring interactive map integrations and live chat rooms for seamless coordination.

## Features

- **Secure Authentication:** JWT-based user authentication and protected routes.
- **Interactive Maps:** Integrated `react-leaflet` to allow users to drop pins for their origin and destination. Reverse geocoding automatically fetches street names.
- **Real-Time Chat:** Powered by **Socket.io**, drivers and passengers can instantly message each other in trip-specific chat rooms without refreshing the page.
- **Persistent Data:** Chat histories, user profiles, and trip details are securely stored in a relational **PostgreSQL** database.
- **Modern Dark Mode UI:** A clean, minimalistic, and responsive dark-themed interface.

---

## Tech Stack

### Frontend
- **React.js** (Vite)
- **React Router** for navigation
- **React Leaflet** for map components
- **Socket.io-client** for real-time WebSockets
- **Axios** for API requests
- **Vanilla CSS** for styling

### Backend
- **Node.js & Express.js**
- **Socket.io** for real-time bidirectional event-based communication
- **PostgreSQL (pg)** for the database
- **Bcrypt & JSON Web Tokens (JWT)** for secure password hashing and authentication

---

## Running Locally

### Prerequisites
- Node.js installed
- PostgreSQL installed and running locally

### 1. Clone the repository
```bash
git clone https://github.com/ManishInde/Car-Pooling.git
cd Car-Pooling
```

### 2. Set up the Database
Create a new PostgreSQL database named `carpooling`. Then, run the SQL commands found in `backend/schema.sql` to generate the required tables.

### 3. Start the Backend
```bash
cd backend
npm install

# Create a .env file with your database credentials and JWT Secret
# Example: 
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_NAME=carpooling
# JWT_SECRET=mysecretkey

node server.js
```

### 4. Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.


