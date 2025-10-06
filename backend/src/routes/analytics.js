const express = require('express');
const { query, validationResult } = require('express-validator');
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

// GET /api/analytics/summary - Get daily summary
router.get('/summary', [
    query('date').optional().isISO8601(),
    handleValidation
], (req, res) => {
    try {
        const { date = new Date().toISOString().split('T')[0] } = req.query;
        
        // Orders summary
        const ordersSummaryStmt = db.prepare(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN status = 'PAGADO' THEN 1 END) as paid_orders,
                COUNT(CASE WHEN status = 'CANCELED' THEN 1 END) as canceled_orders,
                SUM(CASE WHEN status = 'PAGADO' THEN total_amount ELSE 0 END) as total_revenue
            FROM orders 
            WHERE DATE(created_at) = DATE(?)
        `);
        
        const ordersSummary = ordersSummaryStmt.get(date);
        
        // Popular items
        const popularItemsStmt = db.prepare(`
            SELECT 
                oi.menu_item_name_es as item_name,
                COUNT(*) as order_count,
                SUM(oi.price) as total_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE DATE(o.created_at) = DATE(?) AND o.status != 'CANCELED'
            GROUP BY oi.menu_item_id, oi.menu_item_name_es
            ORDER BY order_count DESC
            LIMIT 10
        `);
        
        const popularItems = popularItemsStmt.all(date);
        
        // Hourly orders
        const hourlyOrdersStmt = db.prepare(`
            SELECT 
                strftime('%H', created_at) as hour,
                COUNT(*) as order_count
            FROM orders
            WHERE DATE(created_at) = DATE(?) AND status != 'CANCELED'
            GROUP BY strftime('%H', created_at)
            ORDER BY hour
        `);
        
        const hourlyOrders = hourlyOrdersStmt.all(date);
        
        // Table usage
        const tableUsageStmt = db.prepare(`
            SELECT 
                table_number,
                COUNT(*) as order_count,
                SUM(CASE WHEN status = 'PAGADO' THEN total_amount ELSE 0 END) as revenue
            FROM orders
            WHERE DATE(created_at) = DATE(?) AND status != 'CANCELED'
            GROUP BY table_number
            ORDER BY order_count DESC
        `);
        
        const tableUsage = tableUsageStmt.all(date);
        
        // Waiter performance
        const waiterPerformanceStmt = db.prepare(`
            SELECT 
                waiter_name,
                COUNT(*) as orders_taken,
                SUM(CASE WHEN status = 'PAGADO' THEN total_amount ELSE 0 END) as revenue_generated,
                AVG(CASE 
                    WHEN prepared_at IS NOT NULL AND confirmed_at IS NOT NULL 
                    THEN (julianday(prepared_at) - julianday(confirmed_at)) * 24 * 60
                    ELSE NULL
                END) as avg_prep_time_minutes
            FROM orders
            WHERE DATE(created_at) = DATE(?) AND status != 'CANCELED'
            GROUP BY waiter_id, waiter_name
            ORDER BY orders_taken DESC
        `);
        
        const waiterPerformance = waiterPerformanceStmt.all(date);
        
        res.json({
            date,
            summary: {
                ...ordersSummary,
                total_revenue: parseFloat(ordersSummary.total_revenue || 0)
            },
            popularItems: popularItems.map(item => ({
                ...item,
                total_revenue: parseFloat(item.total_revenue)
            })),
            hourlyOrders: hourlyOrders.map(hour => ({
                ...hour,
                hour: parseInt(hour.hour)
            })),
            tableUsage: tableUsage.map(table => ({
                ...table,
                revenue: parseFloat(table.revenue || 0)
            })),
            waiterPerformance: waiterPerformance.map(waiter => ({
                ...waiter,
                revenue_generated: parseFloat(waiter.revenue_generated || 0),
                avg_prep_time_minutes: waiter.avg_prep_time_minutes ? parseFloat(waiter.avg_prep_time_minutes) : null
            }))
        });
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
], (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const trendsStmt = db.prepare(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total_orders,
                COUNT(CASE WHEN status = 'PAGADO' THEN 1 END) as paid_orders,
                SUM(CASE WHEN status = 'PAGADO' THEN total_amount ELSE 0 END) as daily_revenue,
                AVG(CASE 
                    WHEN prepared_at IS NOT NULL AND confirmed_at IS NOT NULL 
                    THEN (julianday(prepared_at) - julianday(confirmed_at)) * 24 * 60
                    ELSE NULL
                END) as avg_prep_time_minutes
            FROM orders
            WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
            AND status != 'CANCELED'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);
        
        const trends = trendsStmt.all(startDate, endDate).map(day => ({
            ...day,
            daily_revenue: parseFloat(day.daily_revenue || 0),
            avg_prep_time_minutes: day.avg_prep_time_minutes ? parseFloat(day.avg_prep_time_minutes) : null
        }));
        
        res.json({ startDate, endDate, trends });
    } catch (error) {
        console.error('Analytics trends error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics trends' });
    }
});

module.exports = router;