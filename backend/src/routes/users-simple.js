const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../database/json-db');

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    next();
};

// GET /api/users - Get all users
router.get('/', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/users/:id - Get specific user
router.get('/:id', [
    param('id').isString(),
    handleValidation
], async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await db.getUser(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// POST /api/users - Create new user
router.post('/', [
    body('name').isLength({ min: 1, max: 100 }),
    body('role').isIn(['WAITER', 'KITCHEN', 'ADMIN']),
    handleValidation
], async (req, res) => {
    try {
        const result = await db.createUser(req.body);
        res.status(201).json({ id: result.id, message: 'User created successfully' });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

module.exports = router;