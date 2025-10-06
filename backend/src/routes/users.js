const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const dbManager = require('../database/connection');

const router = express.Router();
const db = dbManager.getDatabase();

// Validation middleware
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    next();
};

// GET /api/users - Get all users
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM users ORDER BY name');
        const users = stmt.all();
        
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
], (req, res) => {
    try {
        const { id } = req.params;
        
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id);
        
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
], (req, res) => {
    try {
        const { name, role } = req.body;
        const id = uuidv4();
        
        const stmt = db.prepare('INSERT INTO users (id, name, role) VALUES (?, ?, ?)');
        stmt.run(id, name, role);
        
        res.status(201).json({ id, message: 'User created successfully' });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', [
    param('id').isString(),
    body('name').optional().isLength({ min: 1, max: 100 }),
    body('role').optional().isIn(['WAITER', 'KITCHEN', 'ADMIN']),
    handleValidation
], (req, res) => {
    try {
        const { id } = req.params;
        const { name, role } = req.body;
        
        const updates = [];
        const params = [];
        
        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        params.push(id);
        
        const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
        const result = stmt.run(...params);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', [
    param('id').isString(),
    handleValidation
], (req, res) => {
    try {
        const { id } = req.params;
        
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;