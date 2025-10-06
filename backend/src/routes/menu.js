const express = require('express');
const { body, param, validationResult } = require('express-validator');
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

// GET /api/menu/categories - Get all menu categories
router.get('/categories', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM menu_categories ORDER BY name_es');
        const categories = stmt.all().map(category => ({
            ...category,
            default_customizations: category.default_customizations ? JSON.parse(category.default_customizations) : []
        }));
        
        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/menu/items - Get all menu items
router.get('/items', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT 
                mi.*,
                mc.name_es as category_name_es,
                mc.name_en as category_name_en,
                mc.default_customizations
            FROM menu_items mi
            LEFT JOIN menu_categories mc ON mi.category_id = mc.id
            WHERE mi.available = 1
            ORDER BY mc.name_es, mi.name_es
        `);
        
        const items = stmt.all().map(item => ({
            ...item,
            available: Boolean(item.available),
            default_customizations: item.default_customizations ? JSON.parse(item.default_customizations) : []
        }));
        
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
], (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const stmt = db.prepare(`
            SELECT 
                mi.*,
                mc.default_customizations as category_customizations
            FROM menu_items mi
            LEFT JOIN menu_categories mc ON mi.category_id = mc.id
            WHERE mi.category_id = ? AND mi.available = 1
            ORDER BY mi.name_es
        `);
        
        const items = stmt.all(categoryId).map(item => ({
            ...item,
            available: Boolean(item.available),
            category_customizations: item.category_customizations ? JSON.parse(item.category_customizations) : []
        }));
        
        res.json({ items });
    } catch (error) {
        console.error('Get category items error:', error);
        res.status(500).json({ error: 'Failed to fetch category items' });
    }
});

// POST /api/menu/categories - Create new category
router.post('/categories', [
    body('id').isString(),
    body('name_es').isLength({ min: 1, max: 100 }),
    body('name_en').isLength({ min: 1, max: 100 }),
    body('default_customizations').optional().isArray(),
    handleValidation
], (req, res) => {
    try {
        const { id, name_es, name_en, default_customizations = [] } = req.body;
        
        const stmt = db.prepare(`
            INSERT INTO menu_categories (id, name_es, name_en, default_customizations)
            VALUES (?, ?, ?, ?)
        `);
        
        stmt.run(id, name_es, name_en, JSON.stringify(default_customizations));
        
        res.status(201).json({ id, message: 'Category created successfully' });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// POST /api/menu/items - Create new menu item
router.post('/items', [
    body('id').isString(),
    body('category_id').isString(),
    body('name_es').isLength({ min: 1, max: 100 }),
    body('name_en').isLength({ min: 1, max: 100 }),
    body('price').isNumeric(),
    body('description_es').optional().isString(),
    body('description_en').optional().isString(),
    body('available').optional().isBoolean(),
    handleValidation
], (req, res) => {
    try {
        const { 
            id, category_id, name_es, name_en, price, 
            description_es, description_en, available = true 
        } = req.body;
        
        const stmt = db.prepare(`
            INSERT INTO menu_items (
                id, category_id, name_es, name_en, price, 
                description_es, description_en, available
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            id, category_id, name_es, name_en, price,
            description_es, description_en, available ? 1 : 0
        );
        
        res.status(201).json({ id, message: 'Menu item created successfully' });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
});

// PUT /api/menu/items/:id/availability - Update item availability
router.put('/items/:id/availability', [
    param('id').isString(),
    body('available').isBoolean(),
    handleValidation
], (req, res) => {
    try {
        const { id } = req.params;
        const { available } = req.body;
        
        const stmt = db.prepare('UPDATE menu_items SET available = ? WHERE id = ?');
        const result = stmt.run(available ? 1 : 0, id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        
        res.json({ message: 'Item availability updated successfully' });
    } catch (error) {
        console.error('Update item availability error:', error);
        res.status(500).json({ error: 'Failed to update item availability' });
    }
});

module.exports = router;