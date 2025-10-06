# Database Management Guide

## 📁 **Correct Database Location**
All JSON database files are now stored in:
```
C:\projects\react\sfc-order\database\
```

## 📝 **Available Files**
- `orders.json` - Customer orders with status tracking
- `users.json` - Waiter and staff information  
- `menu.json` - Menu categories and items
- `tables.json` - Restaurant tables (ID + name)
- `settings.json` - Application preferences

## ✏️ **How to Edit Files**

### Manual Editing
```powershell
# Open with VS Code
code database\tables.json
code database\users.json

# Open with Notepad
notepad database\menu.json
```

### Using Database Manager
```powershell
# Run the management tool
.\database-manager.bat
```

### API Testing
```powershell
# List all tables
Invoke-RestMethod -Uri http://localhost:3001/api/tables

# List all users
Invoke-RestMethod -Uri http://localhost:3001/api/users

# Check health
Invoke-RestMethod -Uri http://localhost:3001/health
```

## 🔄 **Live Updates**
Changes made to JSON files in the `database\` directory are immediately reflected in the running application - no restart needed!

## ⚠️ **Important Notes**
- Only edit files in `C:\projects\react\sfc-order\database\`
- Do NOT edit files in `backend\data\` (this directory was removed)
- Changes are immediately live - no container restart needed
- Files are automatically backed up when using the database manager

## 📊 **File Structure Examples**

### tables.json
```json
[
  { "id": "T01", "name": "Mesa Principal" },
  { "id": "VIP", "name": "Mesa VIP" },
  { "id": "BAR", "name": "Barra" }
]
```

### users.json
```json
[
  { "id": "1", "name": "María García", "role": "WAITER", "created_at": "2025-10-06T14:00:26.878Z" },
  { "id": "2", "name": "Carlos López", "role": "WAITER", "created_at": "2025-10-06T14:00:26.878Z" }
]
```