const express = require('express');
const { query, validationResult } = require('express-validator');
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

// GET /api/analytics/summary - Get daily summary
router.get('/summary', [
    query('date').optional().isISO8601(),
    handleValidation
], async (req, res) => {
    try {
        const { date } = req.query;
        const analytics = await db.getAnalyticsSummary(date);
        res.json(analytics);
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
});

// GET /api/analytics/trends - Get trends over time
router.get('/trends', [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    handleValidation
], async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // For now, return empty trends (can be implemented later)
        res.json({ 
            startDate, 
            endDate, 
            trends: [] 
        });
    } catch (error) {
        console.error('Analytics trends error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics trends' });
    }
});

module.exports = router;