const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

// Database file path - will be in external volume for Docker
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/sfc-order.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

class DatabaseManager {
    constructor() {
        this.db = null;
    }

    async init() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(DB_PATH);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Initialize database
            this.db = await sqlite.open({
                filename: DB_PATH,
                driver: sqlite3.Database
            });

            // Enable optimizations
            await this.db.exec('PRAGMA journal_mode = WAL');
            await this.db.exec('PRAGMA foreign_keys = ON');
            await this.db.exec('PRAGMA synchronous = NORMAL');
            await this.db.exec('PRAGMA cache_size = 10000');

            // Run schema
            await this.initSchema();
            
            console.log(`✅ Database initialized at: ${DB_PATH}`);
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    async initSchema() {
        try {
            const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
            await this.db.exec(schema);
            console.log('✅ Database schema applied successfully');
        } catch (error) {
            console.error('❌ Schema application failed:', error);
            throw error;
        }
    }

    getDatabase() {
        return this.db;
    }

    // Health check
    async healthCheck() {
        try {
            const result = await this.db.get('SELECT 1 as health');
            return result && result.health === 1;
        } catch (error) {
            console.error('❌ Database health check failed:', error);
            return false;
        }
    }

    // Backup database
    backup(backupPath) {
        try {
            fs.copyFileSync(DB_PATH, backupPath);
            console.log(`✅ Database backed up to: ${backupPath}`);
            return true;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            return false;
        }
    }

    // Close database connection
    async close() {
        if (this.db) {
            await this.db.close();
            console.log('📦 Database connection closed');
        }
    }
}

// Create singleton instance
let dbManager = null;

const getDbManager = async () => {
    if (!dbManager) {
        dbManager = new DatabaseManager();
        await dbManager.init();
    }
    return dbManager;
};

// Graceful shutdown
process.on('SIGINT', async () => {
    if (dbManager) await dbManager.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    if (dbManager) await dbManager.close();
    process.exit(0);
});

module.exports = { getDbManager, DatabaseManager };