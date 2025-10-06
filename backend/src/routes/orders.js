const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
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

// GET /api/orders - Get all orders with optional filters
router.get('/', [
    query('status').optional().isIn(['TO_CONFIRM', 'CONFIRMED', 'PREPARED', 'PAGADO', 'MODIFIED', 'CANCELED']),
    query('table_number').optional().isInt({ min: 1 }),
    query('date').optional().isISO8601(),
    query('waiter_id').optional().isUUID(),
    handleValidation
], async (req, res) => {
    try {
        const { status, table_number, date, waiter_id } = req.query;
        
        let sql = `
            SELECT 
                o.*,
                json_group_array(
                    json_object(
                        'id', oi.id,
                        'menuItemId', oi.menu_item_id,
                        'menuItem', json_object(
                            'id', oi.menu_item_id,
                            'name', json_object('es', oi.menu_item_name_es, 'en', oi.menu_item_name_en),
                            'price', oi.price
                        ),
                        'customizations', json(oi.customizations),
                        'customText', oi.custom_text,
                        'status', oi.status,
                        'timestamp', oi.created_at
                    )
                ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status) {
            sql += ' AND o.status = ?';
            params.push(status);
        }
        
        if (table_number) {
            sql += ' AND o.table_number = ?';
            params.push(table_number);
        }
        
        if (date) {
            sql += ' AND DATE(o.created_at) = DATE(?)';
            params.push(date);
        }
        
        if (waiter_id) {
            sql += ' AND o.waiter_id = ?';
            params.push(waiter_id);
        }
        
        sql += ' GROUP BY o.id ORDER BY o.created_at DESC';
        
        const stmt = dbManager.prepare(sql);
        const orders = await stmt.all(...params);
        
        // Parse JSON items
        const processedOrders = orders.map(order => ({
            ...order,
            todo_junto: Boolean(order.todo_junto),
            items: JSON.parse(order.items).filter(item => item.id), // Remove null items
            createdAt: order.created_at,
            confirmedAt: order.confirmed_at,
            preparedAt: order.prepared_at,
            paidAt: order.paid_at
        }));
        
        res.json({ orders: processedOrders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', [
    param('id').isUUID(),
    handleValidation
], (req, res) => {
    try {
        const { id } = req.params;
        
        const orderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
        const order = orderStmt.get(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const itemsStmt = db.prepare(`
            SELECT 
                oi.*,
                json_object(
                    'id', oi.menu_item_id,
                    'name', json_object('es', oi.menu_item_name_es, 'en', oi.menu_item_name_en),
                    'price', oi.price
                ) as menuItem
            FROM order_items oi 
            WHERE oi.order_id = ?
            ORDER BY oi.created_at
        `);
        
        const items = itemsStmt.all(id).map(item => ({
            ...item,
            menuItem: JSON.parse(item.menuItem),
            customizations: item.customizations ? JSON.parse(item.customizations) : [],
            timestamp: item.created_at
        }));
        
        const processedOrder = {
            ...order,
            todo_junto: Boolean(order.todo_junto),
            items,
            createdAt: order.created_at,
            confirmedAt: order.confirmed_at,
            preparedAt: order.prepared_at,
            paidAt: order.paid_at
        };
        
        res.json({ order: processedOrder });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// POST /api/orders - Create new order
router.post('/', [
    body('tableNumber').isInt({ min: 1, max: 100 }),
    body('waiterId').isUUID(),
    body('waiterName').isLength({ min: 1 }),
    body('todoJunto').optional().isBoolean(),
    body('items').isArray({ min: 1 }),
    body('items.*.menuItemId').isString(),
    body('items.*.customizations').optional().isArray(),
    body('items.*.customText').optional().isString(),
    handleValidation
], (req, res) => {
    try {
        const { tableNumber, waiterId, waiterName, todoJunto = false, items } = req.body;
        const orderId = uuidv4();
        
        const transaction = db.transaction(() => {
            // Insert order
            const insertOrder = db.prepare(`
                INSERT INTO orders (id, table_number, waiter_id, waiter_name, status, todo_junto)
                VALUES (?, ?, ?, ?, 'TO_CONFIRM', ?)
            `);
            insertOrder.run(orderId, tableNumber, waiterId, waiterName, todoJunto ? 1 : 0);
            
            // Insert order items
            const insertItem = db.prepare(`
                INSERT INTO order_items (
                    id, order_id, menu_item_id, menu_item_name_es, menu_item_name_en, 
                    price, customizations, custom_text, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'TO_PREPARE')
            `);
            
            for (const item of items) {
                const itemId = uuidv4();
                insertItem.run(
                    itemId,
                    orderId,
                    item.menuItemId,
                    item.menuItem.name.es,
                    item.menuItem.name.en,
                    item.menuItem.price,
                    JSON.stringify(item.customizations || []),
                    item.customText || null
                );
            }
        });
        
        transaction();
        
        // Broadcast update
        if (global.server) {
            global.server.broadcast({ type: 'order_created', orderId });
        }
        
        res.status(201).json({ orderId, message: 'Order created successfully' });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', [
    param('id').isUUID(),
    body('status').isIn(['TO_CONFIRM', 'CONFIRMED', 'PREPARED', 'PAGADO', 'MODIFIED', 'CANCELED']),
    handleValidation
], (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updateStmt = db.prepare(`
            UPDATE orders 
            SET status = ?,
                confirmed_at = CASE WHEN ? = 'CONFIRMED' THEN CURRENT_TIMESTAMP ELSE confirmed_at END,
                prepared_at = CASE WHEN ? = 'PREPARED' THEN CURRENT_TIMESTAMP ELSE prepared_at END,
                paid_at = CASE WHEN ? = 'PAGADO' THEN CURRENT_TIMESTAMP ELSE paid_at END
            WHERE id = ?
        `);
        
        const result = updateStmt.run(status, status, status, status, id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Broadcast update
        if (global.server) {
            global.server.broadcast({ type: 'order_status_updated', orderId: id, status });
        }
        
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// PUT /api/orders/:orderId/items/:itemId/status - Update item status
router.put('/:orderId/items/:itemId/status', [
    param('orderId').isUUID(),
    param('itemId').isUUID(),
    body('status').isIn(['TO_PREPARE', 'PREPARING', 'PREPARED', 'CANCELED']),
    handleValidation
], (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body;
        
        const updateStmt = db.prepare('UPDATE order_items SET status = ? WHERE id = ? AND order_id = ?');
        const result = updateStmt.run(status, itemId, orderId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order item not found' });
        }
        
        // Check if all items are prepared to update order status
        const itemsStmt = db.prepare('SELECT status FROM order_items WHERE order_id = ? AND status != "CANCELED"');
        const items = itemsStmt.all(orderId);
        
        const allPrepared = items.length > 0 && items.every(item => item.status === 'PREPARED');
        
        if (allPrepared) {
            const updateOrderStmt = db.prepare('UPDATE orders SET status = "PREPARED", prepared_at = CURRENT_TIMESTAMP WHERE id = ?');
            updateOrderStmt.run(orderId);
        }
        
        // Broadcast update
        if (global.server) {
            global.server.broadcast({ 
                type: 'item_status_updated', 
                orderId, 
                itemId, 
                status,
                orderStatus: allPrepared ? 'PREPARED' : undefined
            });
        }
        
        res.json({ message: 'Item status updated successfully' });
    } catch (error) {
        console.error('Update item status error:', error);
        res.status(500).json({ error: 'Failed to update item status' });
    }
});

// DELETE /api/orders/:id - Delete order (soft delete by setting status to CANCELED)
router.delete('/:id', [
    param('id').isUUID(),
    handleValidation
], (req, res) => {
    try {
        const { id } = req.params;
        
        const updateStmt = db.prepare('UPDATE orders SET status = "CANCELED" WHERE id = ?');
        const result = updateStmt.run(id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Broadcast update
        if (global.server) {
            global.server.broadcast({ type: 'order_canceled', orderId: id });
        }
        
        res.json({ message: 'Order canceled successfully' });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

module.exports = router;