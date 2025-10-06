const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path - will be in external volume for Docker
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/sfc-order.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                // Ensure data directory exists
                const dataDir = path.dirname(DB_PATH);
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }

                // Initialize database
                this.db = new sqlite3.Database(DB_PATH, (err) => {
                    if (err) {
                        console.error('❌ Database connection failed:', err);
                        reject(err);
                        return;
                    }

                    // Enable WAL mode and other optimizations
                    this.db.serialize(() => {
                        this.db.run('PRAGMA journal_mode = WAL');
                        this.db.run('PRAGMA foreign_keys = ON');
                        this.db.run('PRAGMA synchronous = NORMAL');
                        this.db.run('PRAGMA cache_size = 10000');

                        // Run schema
                        this.initSchema()
                            .then(() => {
                                console.log(`✅ Database initialized at: ${DB_PATH}`);
                                resolve();
                            })
                            .catch(reject);
                    });
                });
            } catch (error) {
                console.error('❌ Database initialization failed:', error);
                reject(error);
            }
        });
    }

    initSchema() {
        return new Promise((resolve, reject) => {
            try {
                const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
                
                this.db.exec(schema, (err) => {
                    if (err) {
                        console.error('❌ Schema application failed:', err);
                        reject(err);
                    } else {
                        console.log('✅ Database schema applied successfully');
                        resolve();
                    }
                });
            } catch (error) {
                console.error('❌ Schema read failed:', error);
                reject(error);
            }
        });
    }

    getDatabase() {
        return this.db;
    }

    // Prepared statement helpers (sqlite3 compatible)
    prepare(sql) {
        return {
            run: (...params) => {
                return new Promise((resolve, reject) => {
                    this.db.run(sql, params, function(err) {
                        if (err) reject(err);
                        else resolve({ changes: this.changes, lastID: this.lastID });
                    });
                });
            },
            get: (...params) => {
                return new Promise((resolve, reject) => {
                    this.db.get(sql, params, (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            },
            all: (...params) => {
                return new Promise((resolve, reject) => {
                    this.db.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });
            }
        };
    }

    // Transaction helper
    transaction(callback) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                
                try {
                    const result = callback();
                    this.db.run('COMMIT', (err) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                } catch (error) {
                    this.db.run('ROLLBACK');
                    reject(error);
                }
            });
        });
    }

    // Backup database
    backup(backupPath) {
        try {
            // For sqlite3, we'll copy the file directly
            fs.copyFileSync(DB_PATH, backupPath);
            console.log(`✅ Database backed up to: ${backupPath}`);
            return true;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            return false;
        }
    }

    // Health check
    healthCheck() {
        return new Promise((resolve) => {
            this.db.get('SELECT 1 as health', (err, row) => {
                if (err) {
                    console.error('❌ Database health check failed:', err);
                    resolve(false);
                } else {
                    resolve(row && row.health === 1);
                }
            });
        });
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('📦 Database connection closed');
                }
            });
        }
    }
}

// Singleton instance
const dbManager = new DatabaseManager();

// Graceful shutdown
process.on('SIGINT', () => {
    dbManager.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    dbManager.close();
    process.exit(0);
});

module.exports = dbManager;