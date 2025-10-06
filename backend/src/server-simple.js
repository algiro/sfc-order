const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const db = require('./database/json-db');

// Import routes
const ordersRoutes = require('./routes/orders-simple');
const usersRoutes = require('./routes/users-simple');
const menuRoutes = require('./routes/menu-simple');
const analyticsRoutes = require('./routes/analytics-simple');
const tablesRoutes = require('./routes/tables');

class SFCOrderServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.port = process.env.PORT || 3001;
        
        this.init();
    }

    init() {
        try {
            console.log('🚀 Initializing SFC Order Server...');
            
            // Setup middleware
            this.setupMiddleware();
            
            // Setup routes
            this.setupRoutes();
            
            // Setup WebSocket for real-time updates
            this.setupWebSocket();
            
            // Error handling
            this.setupErrorHandling();
            
            // Start server
            this.start();
        } catch (error) {
            console.error('❌ Server initialization failed:', error);
            process.exit(1);
        }
    }

    setupMiddleware() {
        // Security
        this.app.use(helmet());
        
        // CORS - Allow frontend access
        this.app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // Limit each IP to 1000 requests per windowMs
            message: 'Too many requests from this IP'
        });
        this.app.use(limiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            const dbHealth = db.healthCheck();
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                database: dbHealth ? 'connected' : 'disconnected',
                version: '1.0.0'
            });
        });

        // API routes
        this.app.use('/api/orders', ordersRoutes);
        this.app.use('/api/users', usersRoutes);
        this.app.use('/api/menu', menuRoutes);
        this.app.use('/api/analytics', analyticsRoutes);
        this.app.use('/api/tables', tablesRoutes);

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });
    }

    setupWebSocket() {
        console.log('🔌 Setting up WebSocket server...');
        
        this.wss.on('connection', (ws, req) => {
            console.log('🔗 New WebSocket connection');
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    console.log('WebSocket message:', data);
                    
                    // Handle different message types
                    switch (data.type) {
                        case 'subscribe':
                            ws.subscriptions = data.channels || ['orders'];
                            ws.send(JSON.stringify({ type: 'subscribed', channels: ws.subscriptions }));
                            break;
                        case 'ping':
                            ws.send(JSON.stringify({ type: 'pong' }));
                            break;
                    }
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            });
            
            ws.on('close', () => {
                console.log('🔌 WebSocket connection closed');
            });
            
            ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
            });
            
            // Send welcome message
            ws.send(JSON.stringify({ 
                type: 'connected', 
                message: 'Connected to SFC Order WebSocket' 
            }));
        });
    }

    // Broadcast to all connected clients
    broadcast(data, channel = 'orders') {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && 
                (!client.subscriptions || client.subscriptions.includes(channel))) {
                client.send(JSON.stringify(data));
            }
        });
    }

    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`✅ SFC Order Server running on port ${this.port}`);
            console.log(`🌐 API: http://localhost:${this.port}`);
            console.log(`🔌 WebSocket: ws://localhost:${this.port}`);
            console.log(`📊 Health: http://localhost:${this.port}/health`);
        });
    }
}

// Create and start server
const server = new SFCOrderServer();

// Make server instance available globally for WebSocket broadcasting
global.server = server;

module.exports = server;