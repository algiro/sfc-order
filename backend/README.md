# SFC Order Backend - SQLite Database Solution

## Overview

This backend service replaces the localStorage persistence system with a sophisticated SQLite database solution that provides:

- ✅ **Multi-device support** - Access from multiple devices/browsers
- ✅ **Server-side persistence** - Data survives browser sessions
- ✅ **Real-time synchronization** - WebSocket updates across clients
- ✅ **Automatic backups** - Scheduled database backups
- ✅ **Analytics & reporting** - Comprehensive order analytics
- ✅ **Docker deployment** - Containerized with persistent volumes

## Architecture

### Database Schema

The SQLite database includes 8 tables with proper relationships, indexes, and triggers:

- **orders** - Main order records with status tracking
- **order_items** - Individual menu items in orders
- **users** - Waiters, kitchen staff, and admins
- **menu_categories** - Menu organization (Cafés, Té, Bebidas, etc.)
- **menu_items** - Individual menu items with pricing
- **user_sessions** - User authentication (future use)
- **settings** - System configuration
- **migrations** - Database version control

### API Endpoints

#### Orders API (`/api/orders`)
```
GET    /api/orders              # Get all orders with filters
GET    /api/orders/:id          # Get specific order
POST   /api/orders              # Create new order
PUT    /api/orders/:id/status   # Update order status
PUT    /api/orders/:orderId/items/:itemId/status  # Update item status
DELETE /api/orders/:id          # Cancel order
```

#### Users API (`/api/users`)
```
GET    /api/users               # Get all users
GET    /api/users/:id           # Get specific user
POST   /api/users               # Create new user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
```

#### Menu API (`/api/menu`)
```
GET    /api/menu/categories     # Get menu categories
GET    /api/menu/items          # Get all menu items
GET    /api/menu/items/:categoryId  # Get items by category
POST   /api/menu/categories     # Create category
POST   /api/menu/items          # Create menu item
PUT    /api/menu/items/:id/availability  # Update availability
```

#### Analytics API (`/api/analytics`)
```
GET    /api/analytics/summary   # Daily summary with metrics
GET    /api/analytics/trends    # Trends over time period
```

### Real-time Features

- **WebSocket Server** - Real-time order updates
- **Broadcast System** - Notify all connected clients
- **Subscription Model** - Clients subscribe to specific channels

## Installation & Setup

### Development Environment

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Initialize Database**
```bash
npm run migrate
```

4. **Start Development Server**
```bash
npm run dev
```

### Production Deployment

#### Docker Deployment (Recommended)

1. **Build and Run with Docker Compose**
```bash
# From project root
docker-compose up --build
```

This will start:
- Backend server on port 3001
- Frontend on port 3000
- Persistent database volume

2. **Backend-only Docker**
```bash
cd backend
docker build -t sfc-order-backend .
docker run -p 3001:3001 -v sfc_data:/app/data sfc-order-backend
```

### Manual Production Setup

1. **Install Node.js 18+**
2. **Install Dependencies**
```bash
npm ci --only=production
```

3. **Set Environment Variables**
```bash
export NODE_ENV=production
export PORT=3001
export DATABASE_PATH=/path/to/orders.db
export FRONTEND_URL=http://your-frontend-url
```

4. **Run Migrations**
```bash
npm run migrate
```

5. **Start Server**
```bash
npm start
```

## Database Management

### Migrations

Run database migrations to set up schema:
```bash
npm run migrate
```

The migration system:
- Creates all necessary tables and indexes
- Seeds default users and menu categories
- Tracks migration history
- Safe to run multiple times

### Backups

#### Automatic Backups
The system creates automatic backups based on configuration:
```bash
# Environment variables
BACKUP_ENABLED=true
BACKUP_INTERVAL_HOURS=6
BACKUP_RETENTION_DAYS=30
```

#### Manual Backup Management
```bash
# Create backup
npm run backup create

# List backups
npm run backup list

# Restore from backup
npm run backup restore /path/to/backup.db
```

### Database Location

- **Development**: `./data/orders.db`
- **Docker**: `/app/data/orders.db` (mounted volume)
- **Production**: Set via `DATABASE_PATH` environment variable

## API Usage Examples

### Frontend Integration

The frontend now uses the API service instead of localStorage:

```typescript
import { apiService } from './services/api';

// Create order
const { orderId } = await apiService.createOrder({
  tableNumber: 5,
  waiterId: 'user-id',
  waiterName: 'Maria García',
  todoJunto: true,
  items: [
    {
      menuItemId: 'cafe-con-leche',
      menuItem: { ... },
      customizations: ['con avena', 'muy caliente']
    }
  ]
});

// Get orders with filters
const { orders } = await apiService.getOrders({
  status: 'CONFIRMED',
  tableNumber: 5
});

// Real-time updates
const ws = apiService.connectWebSocket((data) => {
  if (data.type === 'order_status_updated') {
    // Update UI with new status
  }
});
```

### WebSocket Events

```javascript
// Client subscription
ws.send(JSON.stringify({ 
  type: 'subscribe', 
  channels: ['orders'] 
}));

// Server broadcasts
{
  "type": "order_created",
  "orderId": "uuid"
}

{
  "type": "order_status_updated",
  "orderId": "uuid",
  "status": "PREPARED"
}

{
  "type": "item_status_updated",
  "orderId": "uuid",
  "itemId": "uuid",
  "status": "PREPARED"
}
```

## Monitoring & Health

### Health Check
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### Logging

The server provides structured logging:
- Request logging with timestamps
- Error logging with stack traces
- WebSocket connection events
- Database operation logs

### Performance

- **Database**: WAL mode for concurrent access
- **Prepared Statements**: Cached for performance
- **Indexes**: Optimized queries for orders and items
- **Rate Limiting**: 1000 requests per 15 minutes per IP

## Migration from localStorage

The new system maintains full compatibility with the existing frontend while providing enhanced capabilities:

### Data Migration
1. Export existing localStorage data (if needed)
2. Use the migration system to seed initial data
3. Update frontend to use API service
4. Enable real-time WebSocket updates

### Rollback Plan
The localStorage system remains available as fallback:
- Keep existing Zustand store implementation
- Switch API endpoints in environment variables
- Gradual migration possible

## Security Features

- **Rate Limiting**: Express rate limiter
- **CORS Protection**: Configured for frontend domain
- **Helmet Security**: Security headers
- **Input Validation**: Express validator
- **SQL Injection Protection**: Prepared statements

## Troubleshooting

### Common Issues

1. **Database locked error**
   - Ensure proper WAL mode configuration
   - Check file permissions
   - Restart server if needed

2. **WebSocket connection failed**
   - Verify port 3001 is accessible
   - Check CORS configuration
   - Ensure server is running

3. **Migration errors**
   - Check database permissions
   - Verify SQLite installation
   - Review migration logs

### Debug Mode
```bash
export NODE_ENV=development
export LOG_LEVEL=debug
npm run dev
```

## Production Checklist

- [ ] Set production environment variables
- [ ] Configure external database volume
- [ ] Set up backup schedule
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
- [ ] Monitor disk space for database growth
- [ ] Set up log rotation
- [ ] Configure firewall rules

## Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test migrations on fresh database
5. Verify Docker build works

## License

This project is part of the SFC Order Management System.