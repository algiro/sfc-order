-- SFC Order Management Database Schema
-- SQLite Database for Restaurant Order Management

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('WAITER', 'KITCHEN', 'ADMIN')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Menu categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id TEXT PRIMARY KEY,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    default_customizations TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES menu_categories(id),
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    customizations TEXT, -- JSON array
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    table_number INTEGER NOT NULL,
    waiter_id TEXT NOT NULL REFERENCES users(id),
    waiter_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('TO_CONFIRM', 'CONFIRMED', 'PREPARED', 'PAGADO', 'MODIFIED', 'CANCELED')),
    todo_junto BOOLEAN DEFAULT FALSE,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME NULL,
    prepared_at DATETIME NULL,
    paid_at DATETIME NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
    menu_item_name_es TEXT NOT NULL, -- Denormalized for history
    menu_item_name_en TEXT NOT NULL, -- Denormalized for history
    price DECIMAL(10,2) NOT NULL, -- Denormalized for history
    customizations TEXT, -- JSON array of customizations
    custom_text TEXT,
    status TEXT NOT NULL CHECK (status IN ('TO_PREPARE', 'PREPARING', 'PREPARED', 'CANCELED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Order history/audit log
CREATE TABLE IF NOT EXISTS order_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL REFERENCES orders(id),
    action TEXT NOT NULL, -- 'CREATED', 'STATUS_CHANGED', 'ITEM_ADDED', etc.
    old_value TEXT,
    new_value TEXT,
    user_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
CREATE INDEX IF NOT EXISTS idx_order_audit_order_id ON order_audit(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_timestamp ON order_audit(timestamp);

-- Triggers for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_orders_timestamp 
    AFTER UPDATE ON orders
    BEGIN
        UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_order_items_timestamp 
    AFTER UPDATE ON order_items
    BEGIN
        UPDATE order_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger to update order total when items change
CREATE TRIGGER IF NOT EXISTS update_order_total_on_insert
    AFTER INSERT ON order_items
    BEGIN
        UPDATE orders 
        SET total_amount = (
            SELECT COALESCE(SUM(price), 0) 
            FROM order_items 
            WHERE order_id = NEW.order_id AND status != 'CANCELED'
        )
        WHERE id = NEW.order_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_order_total_on_update
    AFTER UPDATE ON order_items
    BEGIN
        UPDATE orders 
        SET total_amount = (
            SELECT COALESCE(SUM(price), 0) 
            FROM order_items 
            WHERE order_id = NEW.order_id AND status != 'CANCELED'
        )
        WHERE id = NEW.order_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_order_total_on_delete
    AFTER DELETE ON order_items
    BEGIN
        UPDATE orders 
        SET total_amount = (
            SELECT COALESCE(SUM(price), 0) 
            FROM order_items 
            WHERE order_id = OLD.order_id AND status != 'CANCELED'
        )
        WHERE id = OLD.order_id;
    END;