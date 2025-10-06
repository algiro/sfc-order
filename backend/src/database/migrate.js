const dbManager = require('./connection');
const { v4: uuidv4 } = require('uuid');

class DatabaseMigrator {
    constructor() {
        this.db = dbManager.getDatabase();
    }

    async runMigrations() {
        console.log('🚀 Starting database migrations...');
        
        try {
            // Check if migrations table exists
            const migrationsTable = this.db.prepare(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            migrationsTable.run();

            // List of migrations to run
            const migrations = [
                { name: 'initial_schema', fn: this.initialSchema.bind(this) },
                { name: 'seed_default_data', fn: this.seedDefaultData.bind(this) }
            ];

            for (const migration of migrations) {
                await this.runMigration(migration.name, migration.fn);
            }

            console.log('✅ All migrations completed successfully');
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }

    async runMigration(name, migrationFn) {
        const checkStmt = this.db.prepare('SELECT 1 FROM migrations WHERE name = ?');
        const exists = checkStmt.get(name);

        if (exists) {
            console.log(`⏭️ Skipping migration: ${name} (already executed)`);
            return;
        }

        console.log(`🔄 Running migration: ${name}`);
        
        try {
            await migrationFn();
            
            const insertStmt = this.db.prepare('INSERT INTO migrations (name) VALUES (?)');
            insertStmt.run(name);
            
            console.log(`✅ Migration completed: ${name}`);
        } catch (error) {
            console.error(`❌ Migration failed: ${name}`, error);
            throw error;
        }
    }

    initialSchema() {
        // Schema is already applied by connection.js
        console.log('  - Schema tables verified');
    }

    seedDefaultData() {
        console.log('  - Seeding default users...');
        
        const insertUser = this.db.prepare(`
            INSERT OR REPLACE INTO users (id, name, role) VALUES (?, ?, ?)
        `);

        const defaultUsers = [
            { id: '1', name: 'Maria García', role: 'WAITER' },
            { id: '2', name: 'Carlos López', role: 'WAITER' },
            { id: '3', name: 'Ana Martínez', role: 'KITCHEN' },
            { id: '4', name: 'José Rodríguez', role: 'KITCHEN' },
            { id: 'admin', name: 'Administrator', role: 'ADMIN' }
        ];

        const insertMany = this.db.transaction(() => {
            for (const user of defaultUsers) {
                insertUser.run(user.id, user.name, user.role);
            }
        });
        insertMany();

        console.log('  - Seeding menu categories...');
        
        const insertCategory = this.db.prepare(`
            INSERT OR REPLACE INTO menu_categories (id, name_es, name_en, default_customizations) 
            VALUES (?, ?, ?, ?)
        `);

        const categories = [
            {
                id: 'cafes',
                name_es: 'Cafés',
                name_en: 'Coffee',
                customizations: ['descafeinado', 'con avena', 'con soja', 'con almendra', 'sin lactosa', 'oscuro', 'muy caliente', 'clarito', 'no tan caliente', 'sin espuma', 'mucha espuma']
            },
            {
                id: 'te',
                name_es: 'Té e Infusiones',
                name_en: 'Tea & Infusions',
                customizations: ['con miel', 'con limón', 'muy caliente', 'tibio', 'sin azúcar', 'con stevia']
            },
            {
                id: 'bebidas',
                name_es: 'Bebidas',
                name_en: 'Drinks',
                customizations: ['con hielo', 'sin hielo', 'con limón', 'muy frío', 'temperatura ambiente']
            },
            {
                id: 'tostas',
                name_es: 'Tostas',
                name_en: 'Toast',
                customizations: ['sin gluten', 'más tostada', 'menos tostada', 'sin tomate', 'extra aguacate', 'sin cebolla']
            },
            {
                id: 'arepas',
                name_es: 'Arepas',
                name_en: 'Arepas',
                customizations: ['sin queso', 'extra queso', 'sin cebolla', 'más relleno', 'menos sal', 'bien caliente']
            }
        ];

        const insertCategoryMany = this.db.transaction(() => {
            for (const category of categories) {
                insertCategory.run(
                    category.id,
                    category.name_es,
                    category.name_en,
                    JSON.stringify(category.customizations)
                );
            }
        });
        insertCategoryMany();

        console.log('  - Default data seeded successfully');
    }
}

// Run migrations if called directly
if (require.main === module) {
    const migrator = new DatabaseMigrator();
    migrator.runMigrations()
        .then(() => {
            console.log('🎉 Database ready!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('🚫 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = DatabaseMigrator;