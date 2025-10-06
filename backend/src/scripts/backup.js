const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
require('dotenv').config();

class BackupManager {
    constructor() {
        this.dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/orders.db');
        this.backupDir = path.join(path.dirname(this.dbPath), 'backups');
        this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createBackup() {
        try {
            const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
            const backupFileName = `orders_backup_${timestamp}.db`;
            const backupPath = path.join(this.backupDir, backupFileName);
            
            console.log(`💾 Creating backup: ${backupFileName}`);
            
            // Copy database file
            fs.copyFileSync(this.dbPath, backupPath);
            
            console.log(`✅ Backup created successfully: ${backupPath}`);
            
            // Clean old backups
            await this.cleanOldBackups();
            
            return backupPath;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            throw error;
        }
    }

    async cleanOldBackups() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const now = new Date();
            const cutoffDate = new Date(now.getTime() - (this.retentionDays * 24 * 60 * 60 * 1000));
            
            let deletedCount = 0;
            
            for (const file of files) {
                if (file.startsWith('orders_backup_') && file.endsWith('.db')) {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.mtime < cutoffDate) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                        console.log(`🗑️ Deleted old backup: ${file}`);
                    }
                }
            }
            
            if (deletedCount > 0) {
                console.log(`🧹 Cleaned ${deletedCount} old backups`);
            }
        } catch (error) {
            console.error('⚠️ Failed to clean old backups:', error);
        }
    }

    listBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('orders_backup_') && file.endsWith('.db'))
                .map(file => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        path: filePath,
                        size: stats.size,
                        created: stats.mtime
                    };
                })
                .sort((a, b) => b.created - a.created);
                
            return files;
        } catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }

    async restoreBackup(backupPath) {
        try {
            if (!fs.existsSync(backupPath)) {
                throw new Error('Backup file not found');
            }
            
            console.log(`🔄 Restoring backup from: ${backupPath}`);
            
            // Create a backup of current database before restore
            const currentBackup = await this.createBackup();
            console.log(`💾 Current database backed up to: ${currentBackup}`);
            
            // Restore the backup
            fs.copyFileSync(backupPath, this.dbPath);
            
            console.log('✅ Database restored successfully');
            
        } catch (error) {
            console.error('❌ Restore failed:', error);
            throw error;
        }
    }
}

// CLI usage
if (require.main === module) {
    const backupManager = new BackupManager();
    const command = process.argv[2];
    
    switch (command) {
        case 'create':
            backupManager.createBackup()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
            
        case 'list':
            const backups = backupManager.listBackups();
            console.log('Available backups:');
            backups.forEach((backup, index) => {
                console.log(`${index + 1}. ${backup.name} (${(backup.size / 1024).toFixed(1)} KB) - ${backup.created}`);
            });
            break;
            
        case 'restore':
            const backupPath = process.argv[3];
            if (!backupPath) {
                console.error('Please provide backup path');
                process.exit(1);
            }
            backupManager.restoreBackup(backupPath)
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
            
        default:
            console.log('Usage: node backup.js <create|list|restore [path]>');
            break;
    }
}

module.exports = BackupManager;