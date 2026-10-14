const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

// Connect to SQLite database file (stored in the backend directory)
const dbPath = path.join(__dirname, 'todos.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency performance
db.exec('PRAGMA journal_mode = WAL;');

// Initialize tasks table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/**
 * Format database row into a clean JSON response object
 * Converts SQLite integer (0 or 1) to boolean (false or true)
 */
function formatTask(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    title: row.title,
    description: row.description || '',
    completed: Boolean(row.completed),
    created_at: row.created_at
  };
}

module.exports = {
  db,
  formatTask
};
