#!/usr/bin/env node

/**
 * MongoDB Backup Script
 * Usage: node scripts/backup.js
 *
 * Environment variables:
 *   MONGO_URI - MongoDB connection string
 *   BACKUP_DIR - Directory to store backups (default: ./backups)
 *
 * Requires mongodump to be installed on the system.
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI;
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS) || 7;

if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is required');
  process.exit(1);
}

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

console.log(`Starting backup to ${backupPath}...`);

try {
  execSync(`mongodump --uri="${MONGO_URI}" --out="${backupPath}"`, {
    stdio: 'inherit',
  });
  console.log(`Backup completed successfully: ${backupPath}`);

  // Clean up old backups (keep only MAX_BACKUPS most recent)
  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith('backup-'))
    .sort()
    .reverse();

  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS);
    for (const dir of toDelete) {
      const fullPath = path.join(BACKUP_DIR, dir);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Deleted old backup: ${dir}`);
    }
  }

  console.log(
    `Backup rotation complete. Keeping ${Math.min(backups.length, MAX_BACKUPS)} backups.`
  );
} catch (error) {
  console.error('Backup failed:', error.message);
  process.exit(1);
}
