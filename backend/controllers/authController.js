const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, role || 'passenger']
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET
        );

        res.status(201).json({
            message: 'User resgitered succesfully',
            token,
            user: {
                id: newUser.rows[0].id,
                name: newUser.rows[0].name,
                role: newUser.rows[0].role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid Credentials ' });
        }
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid Credentials ' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET
        );

        res.status(200).json({
            message: 'Login Succesful',
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }

        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' })
    }

};

const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { phone } = req.body;
        const result = await pool.query(
            'UPDATE users SET phone = $1 WHERE id = $2 RETURNING id, name, email, phone, role',
            [phone, req.user.id]
        );

        res.status(200).json({ message: 'Profile updated', user: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = { register, login, getProfile, updateProfile };