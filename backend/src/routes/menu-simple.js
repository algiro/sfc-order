const express = require('express');
const { param, validationResult } = require('express-validator');
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

// GET /api/menu/categories - Get all menu categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await db.getMenuCategories();
        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/menu/items - Get all menu items
router.get('/items', async (req, res) => {
    try {
        const items = await db.getMenuItems();
        res.json({ items });
    } catch (error) {
        console.error('Get menu items error:', error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
});

// GET /api/menu/items/:categoryId - Get items by category
router.get('/items/:categoryId', [
    param('categoryId').isString(),
    handleValidation
], async (req, res) => {
    try {
        const { categoryId } = req.params;
        const items = await db.getMenuItems(categoryId);
        res.json({ items });
    } catch (error) {
        console.error('Get category items error:', error);
        res.status(500).json({ error: 'Failed to fetch category items' });
    }
});

module.exports = router;