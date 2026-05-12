const pool = require('../db');

function calculationDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}


const createTrip = async (req, res) => {
    try {
        const { origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, departure_time, seats_available, car_model, license_plate } = req.body;

        const distance = calculationDistance(origin_lat, origin_lng, dest_lat, dest_lng);
        let calculatedPrice = (distance * 4) / Math.max(1, seats_available);
        calculatedPrice = Math.round(calculatedPrice * 100) / 100;

        const newTrip = await pool.query(
            `INSERT INTO trips (driver_id, origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, departure_time, seats_available, price, car_model, license_plate)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [req.user.id, origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, departure_time, seats_available, calculatedPrice, car_model, license_plate]
        );

        res.status(201).json({
            message: 'Trip created succesfully',
            trip: newTrip.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error ' });
    }
};

const getAllTrips = async (req, res) => {
    try {
        const { origin, destination } = req.query;

        let queryStr = `
        SELECT trips.*, users.name AS driver_name
        FROM trips
        JOIN users ON trips.driver_id = users.id
        WHERE trips.seats_available > 0
        `;
        const queryParams = [];
        let paramIndex = 1;

        if (origin) {
            queryStr += ` AND trips.origin ILIKE $${paramIndex}`;
            queryParams.push(`%${origin}%`);
            paramIndex++;
        }

        if (destination) {
            queryStr += ` AND trips.destination ILIKE $${paramIndex}`;
            queryParams.push(`%${destination}%`);
            paramIndex++;
        }

        queryStr += ` ORDER BY trips.departure_time ASC`;

        const trips = await pool.query(queryStr, queryParams);

        res.status(200).json({ trips: trips.rows });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

const joinTrip = async (req, res) => {
    try {

        const tripId = req.params.id;
        const userId = req.user.id;
        const tripResult = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
        if (tripResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        const trip = tripResult.rows[0];

        if (trip.driver_id === userId) {
            return res.status(400).json({ error: 'You cannot join your own trip. ' });
        }

        const overlapCheck = await pool.query(
            `SELECT trips.* FROM bookings
            JOIN trips ON bookings.trip_id = trips.id
            WHERE bookings.passenger_id = $1
            AND ABS(EXTRACT(EPOCH FROM (trips.departure_time - $2::TIMESTAMP))) < 3600`,
            [userId, trip.departure_time]
        );

        if (overlapCheck.rows.length > 0) {
            return res.status(400).json({ error: 'You already have a booking within 1 hour of this trip. ' });
        }


        const tripUpdate = await pool.query(
            `UPDATE trips 
             SET seats_available = seats_available - 1 
             WHERE id = $1 AND seats_available > 0 
             RETURNING *`,
            [tripId]
        );


        if (tripUpdate.rows.length === 0) {
            return res.status(400).json({ error: 'Trip is full or does not exist!' });
        }


        const booking = await pool.query(
            `INSERT INTO bookings (trip_id, passenger_id)
            VALUES ($1, $2) RETURNING *`,
            [tripId, userId]
        );

        res.status(201).json({
            message: 'Trip Joined Successfully',
            booking: booking.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

const getTripMessages = async (req, res) => {
    try {
        const tripId = req.params.id;

        const messages = await pool.query(
            `SELECT messages.*, users.name as username
            FROM messages
            JOIN users ON messages.user_id = users.id
            WHERE trip_id = $1
            ORDER BY created_at ASC`,
            [tripId]
        );

        res.status(200).json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = { createTrip, getAllTrips, joinTrip, getTripMessages };