const express = require('express');
const router = express.Router();
const db = require('../database/json-db');

// Get all fruits
router.get('/', async (req, res) => {
    try {
        const fruits = await db.getFruits();
        res.json({ fruits });
    } catch (error) {
        console.error('Error getting fruits:', error);
        res.status(500).json({ error: 'Failed to get fruits' });
    }
});

module.exports = router;