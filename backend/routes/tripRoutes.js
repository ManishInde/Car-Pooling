const express = require('express');
const router = express.Router();

const { createTrip, getAllTrips, joinTrip, getTripMessages } = require('../controllers/tripController');

const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, createTrip);
router.get('/', verifyToken, getAllTrips);
router.post('/:id/join', verifyToken, joinTrip);

router.get('/:id/messages', verifyToken, getTripMessages);

module.exports = router;
