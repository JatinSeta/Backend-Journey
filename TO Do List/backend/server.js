const express = require('express');
const cors = require('cors');
const { db, formatTask } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for easy debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the To-Do List REST API',
    endpoints: {
      'GET /api/tasks': 'Get all tasks',
      'GET /api/tasks/:id': 'Get task by ID',
      'POST /api/tasks': 'Create a new task',
      'PUT /api/tasks/:id': 'Update a task',
      'DELETE /api/tasks/:id': 'Delete a task'
    }
  });
});

// ==========================================
// REST API ROUTES
// ==========================================

/**
 * 1. GET /api/tasks - Retrieve all tasks
 */
app.get('/api/tasks', (req, res, next) => {
  try {
    const query = db.prepare('SELECT * FROM tasks ORDER BY id DESC');
    const rows = query.all();
    const tasks = rows.map(formatTask);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

/**
 * 2. GET /api/tasks/:id - Retrieve a single task by ID
 */
app.get('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    const query = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = query.get(taskId);

    if (!row) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    res.status(200).json(formatTask(row));
  } catch (err) {
    next(err);
  }
});

/**
 * 3. POST /api/tasks - Create a new task
 * Expected body: { title: string, description?: string, completed?: boolean }
 */
app.post('/api/tasks', (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    // Validate title (required & non-empty)
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required and cannot be empty' });
    }

    const cleanTitle = title.trim();
    const cleanDesc = description && typeof description === 'string' ? description.trim() : '';
    const isCompleted = completed === true ? 1 : 0;

    const insertStmt = db.prepare(`
      INSERT INTO tasks (title, description, completed)
      VALUES (?, ?, ?)
    `);

    const result = insertStmt.run(cleanTitle, cleanDesc, isCompleted);
    const newTaskId = Number(result.lastInsertRowid);

    // Fetch the newly inserted task to return full object
    const createdTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(newTaskId);

    res.status(201).json(formatTask(createdTask));
  } catch (err) {
    next(err);
  }
});

/**
 * 4. PUT /api/tasks/:id - Update an existing task
 * Accepts: { title?: string, description?: string, completed?: boolean }
 */
app.put('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    // Check if task exists
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    const { title, description, completed } = req.body;

    // Validate title if supplied
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
    }

    const updatedTitle = title !== undefined ? title.trim() : existingTask.title;
    const updatedDesc = description !== undefined ? (typeof description === 'string' ? description.trim() : '') : existingTask.description;
    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : existingTask.completed;

    const updateStmt = db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, completed = ?
      WHERE id = ?
    `);

    updateStmt.run(updatedTitle, updatedDesc, updatedCompleted, taskId);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.status(200).json(formatTask(updatedTask));
  } catch (err) {
    next(err);
  }
});

/**
 * 5. DELETE /api/tasks/:id - Delete a task by ID
 */
app.delete('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    // Check if task exists
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    deleteStmt.run(taskId);

    res.status(200).json({
      message: `Task with ID ${taskId} deleted successfully`,
      deletedTask: formatTask(existingTask)
    });
  } catch (err) {
    next(err);
  }
});

// 404 Route Handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`To-Do REST API server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
