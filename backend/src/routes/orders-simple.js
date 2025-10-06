const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
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

// GET /api/orders - Get all orders with optional filters
router.get('/', [
    query('status').optional().isIn(['TO_CONFIRM', 'CONFIRMED', 'PREPARED', 'PAGADO', 'MODIFIED', 'CANCELED']),
    query('table_number').optional().isInt({ min: 1 }),
    query('date').optional().isISO8601(),
    query('waiter_id').optional().isString(),
    handleValidation
], async (req, res) => {
    try {
        const { status, table_number, date, waiter_id } = req.query;
        
        const filters = {};
        if (status) filters.status = status;
        if (table_number) filters.table_number = table_number;
        if (date) filters.date = date;
        if (waiter_id) filters.waiter_id = waiter_id;
        
        const orders = await db.getAllOrders(filters);
        
        // Process orders for frontend compatibility
        const processedOrders = orders.map(order => ({
            ...order,
            todo_junto: Boolean(order.todo_junto),
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
], async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await db.getOrder(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const processedOrder = {
            ...order,
            todo_junto: Boolean(order.todo_junto),
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
    body('waiterId').isString(),
    body('waiterName').isLength({ min: 1 }),
    body('todoJunto').optional().isBoolean(),
    body('items').isArray({ min: 1 }),
    body('items.*.menuItemId').isString(),
    body('items.*.customizations').optional().isArray(),
    body('items.*.customText').optional().isString(),
    handleValidation
], async (req, res) => {
    try {
        const result = await db.createOrder(req.body);
        
        // Broadcast update
        if (global.server) {
            global.server.broadcast({ type: 'order_created', orderId: result.orderId });
        }
        
        res.status(201).json({ orderId: result.orderId, message: 'Order created successfully' });
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
], async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await db.updateOrderStatus(id, status);
        
        // Broadcast update
        if (global.server) {
            global.server.broadcast({ type: 'order_status_updated', orderId: id, status });
        }
        
        res.json(result);
    } catch (error) {
        console.error('Update order status error:', error);
        if (error.message === 'Order not found') {
            res.status(404).json({ error: 'Order not found' });
        } else {
            res.status(500).json({ error: 'Failed to update order status' });
        }
    }
});

// PUT /api/orders/:orderId/items/:itemId/status - Update item status
router.put('/:orderId/items/:itemId/status', [
    param('orderId').isUUID(),
    param('itemId').isUUID(),
    body('status').isIn(['TO_PREPARE', 'PREPARING', 'PREPARED', 'CANCELED']),
    handleValidation
], async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body;
        
        const result = await db.updateItemStatus(orderId, itemId, status);
        
        // Broadcast update
        if (global.server) {
            global.server.broadcast({ 
                type: 'item_status_updated', 
                orderId, 
                itemId, 
                status,
                orderStatus: result.orderStatus
            });
        }
        
        res.json({ message: result.message });
    } catch (error) {
        console.error('Update item status error:', error);
        if (error.message === 'Order not found' || error.message === 'Order item not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to update item status' });
        }
    }
});

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', [
    param('id').isUUID(),
    handleValidation
], async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.cancelOrder(id);
        
        // Broadcast update
        if (global.server) {
            global.server.broadcast({ type: 'order_canceled', orderId: id });
        }
        
        res.json(result);
    } catch (error) {
        console.error('Cancel order error:', error);
        if (error.message === 'Order not found') {
            res.status(404).json({ error: 'Order not found' });
        } else {
            res.status(500).json({ error: 'Failed to cancel order' });
        }
    }
});

module.exports = router;