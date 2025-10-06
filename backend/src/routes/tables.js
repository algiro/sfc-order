const express = require('express');
const router = express.Router();
const db = require('../database/json-db');

// Get all tables
router.get('/', async (req, res) => {
    try {
        const tables = await db.getAllTables();
        res.json(tables);
    } catch (error) {
        console.error('Error getting tables:', error);
        res.status(500).json({ error: 'Failed to get tables' });
    }
});

// Get table by ID
router.get('/:id', async (req, res) => {
    try {
        const table = await db.getTable(req.params.id);
        
        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }
        
        res.json(table);
    } catch (error) {
        console.error('Error getting table:', error);
        res.status(500).json({ error: 'Failed to get table' });
    }
});

// Create new table
router.post('/', async (req, res) => {
    try {
        const { id, name } = req.body;
        
        if (!id || !name) {
            return res.status(400).json({ error: 'Table ID and name are required' });
        }

        // Check if table ID already exists
        const existingTable = await db.getTable(id);
        if (existingTable) {
            return res.status(409).json({ error: 'Table ID already exists' });
        }

        const result = await db.createTable({ id, name });
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating table:', error);
        res.status(500).json({ error: 'Failed to create table' });
    }
});

// Update table
router.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Table name is required' });
        }

        const result = await db.updateTable(req.params.id, { name });
        res.json(result);
    } catch (error) {
        console.error('Error updating table:', error);
        
        if (error.message === 'Table not found') {
            return res.status(404).json({ error: 'Table not found' });
        }
        
        res.status(500).json({ error: 'Failed to update table' });
    }
});

// Delete table
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.deleteTable(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting table:', error);
        
        if (error.message === 'Table not found') {
            return res.status(404).json({ error: 'Table not found' });
        }
        
        res.status(500).json({ error: 'Failed to delete table' });
    }
});

module.exports = router;