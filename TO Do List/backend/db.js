const path = require('node:path');
const fs = require('node:fs');

// Detect if running inside Vercel serverless environment
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const dbPath = isVercel ? path.join('/tmp', 'todos.db') : path.join(__dirname, 'todos.db');

let DatabaseSync = null;
try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch {
  // Built-in sqlite not available in this Node runtime
  DatabaseSync = null;
}

let db;

if (DatabaseSync) {
  // Use real SQLite engine
  db = new DatabaseSync(dbPath);
  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch {
    // WAL pragma might fail in ephemeral environments like /tmp
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} else {
  // Fallback for Node environments (< 22.5) where node:sqlite is not yet available
  console.log('Using in-memory/JSON storage fallback (Node runtime without node:sqlite)');
  
  const jsonPath = isVercel ? path.join('/tmp', 'todos.json') : path.join(__dirname, 'todos.json');
  let memoryTasks = [];

  try {
    if (fs.existsSync(jsonPath)) {
      memoryTasks = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
  } catch {
    memoryTasks = [];
  }

  const saveTasks = () => {
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(memoryTasks, null, 2));
    } catch {
      // Ignored in read-only environments
    }
  };

  db = {
    close() {},
    prepare(sql) {
      const cleanSql = sql.trim().replace(/\s+/g, ' ');

      if (cleanSql.startsWith('SELECT * FROM tasks ORDER BY id DESC')) {
        return {
          all: () => [...memoryTasks].sort((a, b) => b.id - a.id)
        };
      }

      if (cleanSql.startsWith('SELECT * FROM tasks WHERE id = ?')) {
        return {
          get: (id) => memoryTasks.find((t) => t.id === Number(id)) || null
        };
      }

      if (cleanSql.startsWith('INSERT INTO tasks')) {
        return {
          run: (title, desc, completed) => {
            const nextId = memoryTasks.length > 0 ? Math.max(...memoryTasks.map((t) => t.id)) + 1 : 1;
            const newTask = {
              id: nextId,
              title,
              description: desc || '',
              completed: completed ? 1 : 0,
              created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
            memoryTasks.push(newTask);
            saveTasks();
            return { changes: 1, lastInsertRowid: nextId };
          }
        };
      }

      if (cleanSql.startsWith('UPDATE tasks')) {
        return {
          run: (title, desc, completed, id) => {
            const index = memoryTasks.findIndex((t) => t.id === Number(id));
            if (index !== -1) {
              memoryTasks[index].title = title;
              memoryTasks[index].description = desc;
              memoryTasks[index].completed = completed ? 1 : 0;
              saveTasks();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
        };
      }

      if (cleanSql.startsWith('DELETE FROM tasks WHERE id = ?')) {
        return {
          run: (id) => {
            const initialLen = memoryTasks.length;
            memoryTasks = memoryTasks.filter((t) => t.id !== Number(id));
            saveTasks();
            return { changes: initialLen - memoryTasks.length };
          }
        };
      }

      return {
        all: () => [],
        get: () => null,
        run: () => ({ changes: 0, lastInsertRowid: 0 })
      };
    }
  };
}

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
