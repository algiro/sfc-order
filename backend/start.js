#!/usr/bin/env node

/**
 * SFC Order Backend Startup Script
 * Handles database initialization and server startup
 */

const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory');
}

// Set environment variables if not set
if (!process.env.DATABASE_PATH) {
    process.env.DATABASE_PATH = dataDir;
}

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

// Start the server
console.log('🚀 Starting SFC Order Backend...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`� Data Directory: ${process.env.DATABASE_PATH}`);

require('./src/server-simple');