const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Database file paths
const DATA_DIR = process.env.DATABASE_PATH || path.join(__dirname, '../../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const TABLES_FILE = path.join(DATA_DIR, 'tables.json');
const FRUITS_FILE = path.join(DATA_DIR, 'fruits.json');

class JSONDatabase {
    constructor() {
        this.ensureDataDir();
        this.initDefaultData();
    }

    ensureDataDir() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    }

    initDefaultData() {
        // Initialize orders file
        if (!fs.existsSync(ORDERS_FILE)) {
            this.writeFile(ORDERS_FILE, []);
        }

        // Initialize users file
        if (!fs.existsSync(USERS_FILE)) {
            const defaultUsers = [
                { id: '1', name: 'María García', role: 'WAITER', created_at: new Date().toISOString() },
                { id: '2', name: 'Carlos López', role: 'WAITER', created_at: new Date().toISOString() },
                { id: '3', name: 'Ana Martínez', role: 'KITCHEN', created_at: new Date().toISOString() },
                { id: '4', name: 'José Rodríguez', role: 'KITCHEN', created_at: new Date().toISOString() },
                { id: 'admin', name: 'Administrator', role: 'ADMIN', created_at: new Date().toISOString() }
            ];
            this.writeFile(USERS_FILE, defaultUsers);
        }

        // Initialize menu file
        if (!fs.existsSync(MENU_FILE)) {
            const defaultMenu = {
                categories: [
                    {
                        id: 'cafes',
                        name_es: 'Cafés',
                        name_en: 'Coffee',
                        default_customizations: ['descafeinado', 'con avena', 'con soja', 'con almendra', 'sin lactosa', 'oscuro', 'muy caliente', 'clarito', 'no tan caliente', 'sin espuma', 'mucha espuma']
                    },
                    {
                        id: 'te',
                        name_es: 'Té e Infusiones',
                        name_en: 'Tea & Infusions',
                        default_customizations: ['con miel', 'con limón', 'muy caliente', 'tibio', 'sin azúcar', 'con stevia']
                    },
                    {
                        id: 'bebidas',
                        name_es: 'Bebidas',
                        name_en: 'Drinks',
                        default_customizations: ['con hielo', 'sin hielo', 'con limón', 'muy frío', 'temperatura ambiente']
                    },
                    {
                        id: 'tostas',
                        name_es: 'Tostas',
                        name_en: 'Toast',
                        default_customizations: ['sin gluten', 'más tostada', 'menos tostada', 'sin tomate', 'extra aguacate', 'sin cebolla']
                    },
                    {
                        id: 'arepas',
                        name_es: 'Arepas',
                        name_en: 'Arepas',
                        default_customizations: ['sin queso', 'extra queso', 'sin cebolla', 'más relleno', 'menos sal', 'bien caliente']
                    }
                ],
                items: []
            };
            this.writeFile(MENU_FILE, defaultMenu);
        }

        // Initialize tables file
        if (!fs.existsSync(TABLES_FILE)) {
            const defaultTables = [
                { id: 'T01', name: 'Mesa 1' },
                { id: 'T02', name: 'Mesa 2' },
                { id: 'T03', name: 'Mesa 3' },
                { id: 'T04', name: 'Mesa 4' },
                { id: 'T05', name: 'Mesa 5' },
                { id: 'T06', name: 'Mesa 6' },
                { id: 'T07', name: 'Mesa 7' },
                { id: 'T08', name: 'Mesa 8' },
                { id: 'T09', name: 'Mesa 9' },
                { id: 'T10', name: 'Mesa 10' },
                { id: 'BAR', name: 'Barra' },
                { id: 'TER', name: 'Terraza' }
            ];
            this.writeFile(TABLES_FILE, defaultTables);
        }

        // Initialize settings file
        if (!fs.existsSync(SETTINGS_FILE)) {
            this.writeFile(SETTINGS_FILE, { initialized: true, created_at: new Date().toISOString() });
        }

        console.log('✅ JSON Database initialized successfully');
    }

    readFile(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error);
            return null;
        }
    }

    writeFile(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`Error writing ${filePath}:`, error);
            return false;
        }
    }

    // Orders API
    async getAllOrders(filters = {}) {
        let orders = this.readFile(ORDERS_FILE) || [];
        
        // Apply filters
        if (filters.status) {
            orders = orders.filter(order => order.status === filters.status);
        }
        if (filters.table_number) {
            orders = orders.filter(order => order.table_number === parseInt(filters.table_number));
        }
        if (filters.date) {
            orders = orders.filter(order => order.created_at.startsWith(filters.date));
        }
        if (filters.waiter_id) {
            orders = orders.filter(order => order.waiter_id === filters.waiter_id);
        }

        // Sort by created_at descending
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return orders;
    }

    async getOrder(id) {
        const orders = this.readFile(ORDERS_FILE) || [];
        return orders.find(order => order.id === id);
    }

    async createOrder(orderData) {
        const orders = this.readFile(ORDERS_FILE) || [];
        const orderId = uuidv4();
        
        const newOrder = {
            id: orderId,
            table_number: orderData.tableNumber,
            waiter_id: orderData.waiterId,
            waiter_name: orderData.waiterName,
            status: 'CONFIRMED',
            todo_junto: orderData.todoJunto || false,
            items: orderData.items.map(item => ({
                id: uuidv4(),
                menuItemId: item.menuItemId,
                menuItem: item.menuItem,
                customizations: item.customizations || [],
                customText: item.customText || '',
                status: 'TO_PREPARE',
                timestamp: new Date().toISOString()
            })),
            total_amount: orderData.items.reduce((total, item) => total + item.menuItem.price, 0),
            created_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
            prepared_at: null,
            paid_at: null
        };

        orders.push(newOrder);
        this.writeFile(ORDERS_FILE, orders);

        return { orderId };
    }

    async updateOrderStatus(orderId, status) {
        const orders = this.readFile(ORDERS_FILE) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            throw new Error('Order not found');
        }

        orders[orderIndex].status = status;
        
        // Update timestamps
        const now = new Date().toISOString();
        if (status === 'CONFIRMED') {
            orders[orderIndex].confirmed_at = now;
        } else if (status === 'PREPARED') {
            orders[orderIndex].prepared_at = now;
        } else if (status === 'PAGADO') {
            orders[orderIndex].paid_at = now;
        }

        this.writeFile(ORDERS_FILE, orders);
        return { message: 'Order status updated successfully' };
    }

    async updateItemStatus(orderId, itemId, status) {
        const orders = this.readFile(ORDERS_FILE) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            throw new Error('Order not found');
        }

        const order = orders[orderIndex];
        const itemIndex = order.items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            throw new Error('Order item not found');
        }

        order.items[itemIndex].status = status;

        // Check if all items are prepared to update order status
        const allPrepared = order.items.every(item => item.status === 'PREPARED' || item.status === 'CANCELED');
        
        if (allPrepared && order.items.some(item => item.status === 'PREPARED')) {
            order.status = 'PREPARED';
            order.prepared_at = new Date().toISOString();
        }

        this.writeFile(ORDERS_FILE, orders);
        return { message: 'Item status updated successfully', orderStatus: allPrepared ? 'PREPARED' : undefined };
    }

    async cancelOrder(orderId) {
        const orders = this.readFile(ORDERS_FILE) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            throw new Error('Order not found');
        }

        orders[orderIndex].status = 'CANCELED';
        this.writeFile(ORDERS_FILE, orders);

        return { message: 'Order canceled successfully' };
    }

    // Users API
    async getAllUsers() {
        return this.readFile(USERS_FILE) || [];
    }

    async getUser(id) {
        const users = this.readFile(USERS_FILE) || [];
        return users.find(user => user.id === id);
    }

    async createUser(userData) {
        const users = this.readFile(USERS_FILE) || [];
        const id = uuidv4();
        
        const newUser = {
            id,
            name: userData.name,
            role: userData.role,
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        this.writeFile(USERS_FILE, users);

        return { id };
    }

    // Menu API
    async getMenuCategories() {
        const menu = this.readFile(MENU_FILE) || { categories: [], items: [] };
        return menu.categories;
    }

    async getMenuItems(categoryId) {
        const menu = this.readFile(MENU_FILE) || { categories: [], items: [] };
        
        if (categoryId) {
            return menu.items.filter(item => item.category_id === categoryId && item.available);
        }
        
        return menu.items.filter(item => item.available);
    }

    // Tables API
    async getAllTables() {
        return this.readFile(TABLES_FILE) || [];
    }

    async getTable(id) {
        const tables = this.readFile(TABLES_FILE) || [];
        return tables.find(table => table.id === id);
    }

    async createTable(tableData) {
        const tables = this.readFile(TABLES_FILE) || [];
        
        const newTable = {
            id: tableData.id,
            name: tableData.name
        };

        tables.push(newTable);
        this.writeFile(TABLES_FILE, tables);

        return { id: newTable.id };
    }

    async updateTable(id, tableData) {
        const tables = this.readFile(TABLES_FILE) || [];
        const tableIndex = tables.findIndex(table => table.id === id);
        
        if (tableIndex === -1) {
            throw new Error('Table not found');
        }

        tables[tableIndex] = { ...tables[tableIndex], ...tableData };
        this.writeFile(TABLES_FILE, tables);

        return { message: 'Table updated successfully' };
    }

    async deleteTable(id) {
        const tables = this.readFile(TABLES_FILE) || [];
        const filteredTables = tables.filter(table => table.id !== id);
        
        if (filteredTables.length === tables.length) {
            throw new Error('Table not found');
        }

        this.writeFile(TABLES_FILE, filteredTables);
        return { message: 'Table deleted successfully' };
    }

    // Fruits API
    async getFruits() {
        return this.readFile(FRUITS_FILE) || [];
    }

    // Analytics API
    async getAnalyticsSummary(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const orders = this.readFile(ORDERS_FILE) || [];
        
        const dayOrders = orders.filter(order => order.created_at.startsWith(targetDate));
        
        const summary = {
            total_orders: dayOrders.length,
            paid_orders: dayOrders.filter(order => order.status === 'PAGADO').length,
            canceled_orders: dayOrders.filter(order => order.status === 'CANCELED').length,
            total_revenue: dayOrders
                .filter(order => order.status === 'PAGADO')
                .reduce((total, order) => total + (order.total_amount || 0), 0)
        };

        return {
            date: targetDate,
            summary,
            popularItems: [],
            hourlyOrders: [],
            tableUsage: [],
            waiterPerformance: []
        };
    }

    // Health check
    healthCheck() {
        return fs.existsSync(ORDERS_FILE) && fs.existsSync(USERS_FILE);
    }

    // Backup
    backup(backupPath) {
        try {
            const backupData = {
                orders: this.readFile(ORDERS_FILE),
                users: this.readFile(USERS_FILE),
                menu: this.readFile(MENU_FILE),
                settings: this.readFile(SETTINGS_FILE),
                tables: this.readFile(TABLES_FILE),
                backup_date: new Date().toISOString()
            };
            
            fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
            console.log(`✅ Database backed up to: ${backupPath}`);
            return true;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const db = new JSONDatabase();

module.exports = db;