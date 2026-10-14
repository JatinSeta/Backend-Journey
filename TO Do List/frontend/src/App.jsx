import { useState, useEffect } from 'react';
import './App.css';

// Base API URL (falls back to relative path using Vite proxy or directly to port 5000)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Edit task state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Filter & Search state
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [search, setSearch] = useState('');

  // Fetch all tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`Failed to load tasks (Status: ${res.status})`);
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Fetch tasks error:', err);
      showAlert('error', 'Unable to connect to backend server. Make sure Express is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Create Task (POST /api/tasks)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showAlert('error', 'Task title is required!');
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      setTasks((prev) => [data, ...prev]);
      setTitle('');
      setDescription('');
      showAlert('success', 'Task created successfully!');
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Toggle Task Completion (PUT /api/tasks/:id)
  const handleToggleComplete = async (task) => {
    try {
      const updatedStatus = !task.completed;
      const res = await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? data : t))
      );
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  // 3. Start Editing a Task
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
  };

  // Cancel Editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  // Save Task Edit (PUT /api/tasks/:id)
  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) {
      showAlert('error', 'Title cannot be empty');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? data : t))
      );
      cancelEdit();
      showAlert('success', 'Task updated successfully!');
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  // 4. Delete Task (DELETE /api/tasks/:id)
  const handleDeleteTask = async (id) => {
    if (!window.confirm(`Are you sure you want to delete task #${id}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete task');

      setTasks((prev) => prev.filter((t) => t.id !== id));
      showAlert('success', `Task #${id} deleted successfully!`);
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  // Format timestamp helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Stats calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  // Filter and search logic
  const filteredTasks = tasks.filter((task) => {
    // Filter by tab
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = (task.description || '').toLowerCase().includes(query);
      return matchTitle || matchDesc;
    }
    return true;
  });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 className="brand-title">
          <span>📝</span> To-Do List
          <span className="brand-badge">REST API</span>
        </h1>
        <button
          className="btn-sm btn-cancel"
          onClick={fetchTasks}
          title="Refresh task list from database"
        >
          🔄 Refresh
        </button>
      </header>

      {/* Alert Notices */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.message}</span>
          <button className="alert-close" onClick={() => setAlert(null)}>
            ×
          </button>
        </div>
      )}

      {/* Stats Counter */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {pendingCount}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {completedCount}
          </div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Task Creation Form */}
      <section className="card">
        <form onSubmit={handleCreateTask} className="task-form">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add New Task</h2>

          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Read Chapter 4 of Node.js Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description (optional)</label>
            <input
              id="task-desc"
              type="text"
              className="form-input"
              placeholder="Additional details, notes, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={actionLoading || !title.trim()}
          >
            {actionLoading ? (
              <>
                <span className="spinner" /> Adding...
              </>
            ) : (
              '+ Add Task'
            )}
          </button>
        </form>
      </section>

      {/* Toolbar: Filters & Search */}
      <div className="toolbar">
        <div className="filter-tabs">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tasks List */}
      <div className="task-list">
        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ margin: '0 auto 1rem', borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            <p>Loading tasks from database...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">📋</div>
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {tasks.length === 0
                ? 'No tasks yet! Add your first task above.'
                : 'No tasks match your current filter or search.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              {editingId === task.id ? (
                // Edit Mode Form
                <div className="edit-form">
                  <div className="form-group">
                    <label>Edit Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Edit Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                  </div>
                  <div className="edit-buttons">
                    <button
                      className="btn-sm btn-save"
                      onClick={() => handleSaveEdit(task.id)}
                    >
                      Save Changes
                    </button>
                    <button className="btn-sm btn-cancel" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="task-left">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                    />
                    <div className="task-details">
                      <div className="task-title">{task.title}</div>
                      {task.description && (
                        <div className="task-desc">{task.description}</div>
                      )}
                      <div className="task-meta">
                        <span className="task-id">ID: #{task.id}</span>
                        <span
                          className={`task-status ${
                            task.completed ? 'status-completed' : 'status-pending'
                          }`}
                        >
                          {task.completed ? '✓ Completed' : '⏳ Pending'}
                        </span>
                        <span>📅 {formatDate(task.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      className="btn-icon"
                      title="Edit task"
                      onClick={() => startEdit(task)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon delete"
                      title="Delete task"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
