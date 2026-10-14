# 📝 To-Do List REST API (Express + SQLite + React)

A simple, beginner-friendly full-stack To-Do List application built with **Express.js** and **SQLite** for the REST API backend, and **React.js** for the frontend user interface.

---

## 🚀 Features

- **Standard RESTful API**: Follows REST conventions (`GET`, `POST`, `PUT`, `DELETE`).
- **Data Persistence**: Uses built-in SQLite (`todos.db`) with zero external database configuration needed.
- **Task Model**:
  - `id`: Auto-incrementing unique integer
  - `title`: String (required)
  - `description`: String (optional)
  - `completed`: Boolean (`true` / `false`)
  - `created_at`: Creation date and timestamp
- **Error Handling**: Input validation (400 Bad Request), missing resource detection (404 Not Found), and centralized error handling (500 Internal Server Error).
- **Postman Testing**: Includes a ready-to-import Postman collection.
- **Clean React UI**: Allows creating, toggling completion, editing, searching, and deleting tasks.

---

## 📂 Project Structure

```text
TO Do List/
├── api/
│   └── index.js                # Vercel serverless function entry point
├── backend/
│   ├── server.js               # Express application and REST API routes
│   ├── db.js                   # Universal SQLite database connection with Vercel support
│   ├── todos.db                # SQLite database file (created automatically)
│   ├── test_api.js             # Automated API test suite
│   ├── postman_collection.json # Exported Postman collection for 1-click import
│   └── package.json            # Backend dependencies (express, cors)
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # React component with CRUD operations
│   │   ├── App.css             # Component styling and responsive design
│   │   ├── index.css           # Global CSS variables and resets
│   │   └── main.jsx            # React root mount
│   ├── vite.config.js          # Vite configuration with proxy
│   └── package.json            # Frontend dependencies
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Root build and run scripts
└── README.md                   # Documentation and API guide
```

---

## ⚡ Quick Start

### 1. Start the Backend API (Port 5000)

Open a terminal in the project root:

```bash
npm run start:backend
# or:
cd backend
node server.js
```

The REST API will be running at `http://localhost:5000`.

### 2. Start the React Frontend (Port 3000)

Open a second terminal in the project root:

```bash
npm run start:frontend
# or:
cd frontend
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 📡 REST API Documentation

**Base URL**: `http://localhost:5000/api/tasks`

| Method | Endpoint | Description | Success Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks (ordered newest first) | `200 OK` |
| `GET` | `/api/tasks/:id` | Get a single task by ID | `200 OK` |
| `POST` | `/api/tasks` | Create a new task | `201 Created` |
| `PUT` | `/api/tasks/:id` | Update a task's title, description, or status | `200 OK` |
| `DELETE` | `/api/tasks/:id` | Delete a task by ID | `200 OK` |

---

### Request & Response Examples

#### 1. Get All Tasks
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/tasks`
- **Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, and bread",
    "completed": false,
    "created_at": "2026-10-14 10:30:00"
  }
]
```

#### 2. Get Task by ID
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/tasks/1`
- **Response** (`200 OK`):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, and bread",
  "completed": false,
  "created_at": "2026-10-14 10:30:00"
}
```

#### 3. Create a Task
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/tasks`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "title": "Prepare presentation",
  "description": "Create slides for Monday meeting"
}
```
- **Response** (`201 Created`):
```json
{
  "id": 2,
  "title": "Prepare presentation",
  "description": "Create slides for Monday meeting",
  "completed": false,
  "created_at": "2026-10-14 10:35:10"
}
```

#### 4. Update a Task
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/tasks/2`
- **Headers**: `Content-Type: application/json`
- **Body** (toggle completion or change title):
```json
{
  "completed": true
}
```
- **Response** (`200 OK`):
```json
{
  "id": 2,
  "title": "Prepare presentation",
  "description": "Create slides for Monday meeting",
  "completed": true,
  "created_at": "2026-10-14 10:35:10"
}
```

#### 5. Delete a Task
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/tasks/2`
- **Response** (`200 OK`):
```json
{
  "message": "Task with ID 2 deleted successfully",
  "deletedTask": {
    "id": 2,
    "title": "Prepare presentation",
    "description": "Create slides for Monday meeting",
    "completed": true,
    "created_at": "2026-10-14 10:35:10"
  }
}
```

---

## ⚠️ Error Handling Responses

### Missing or Empty Title (`400 Bad Request`)
If you send a `POST` request without a title or with an empty string:
```json
{
  "error": "Title is required and cannot be empty"
}
```

### Task Not Found (`404 Not Found`)
If you request, update, or delete a non-existent task ID (e.g. `/api/tasks/9999`):
```json
{
  "error": "Task with ID 9999 not found"
}
```

### Invalid Task ID (`400 Bad Request`)
If you supply a non-numeric ID (e.g. `/api/tasks/abc`):
```json
{
  "error": "Task ID must be a valid number"
}
```

---

## 🧪 Testing the API Using Postman

### Option A: Import Pre-Configured Collection (Recommended)

1. Open **Postman**.
2. Click the **Import** button in the top-left corner.
3. Drag and drop or browse to select:
   ```text
   backend/postman_collection.json
   ```
4. You will see a collection named **"To-Do List REST API"** with 7 pre-configured requests:
   - `1. Get All Tasks`
   - `2. Create Task (Success)`
   - `3. Create Task (Validation Error - Empty Title)`
   - `4. Get Task by ID`
   - `5. Update Task (Toggle Completed or Edit Title)`
   - `6. Delete Task`
   - `7. Get Non-Existent Task (404 Error Test)`
5. Click **Send** on any request to test!

### Option B: Manual Testing in Postman

1. **Create Task**:
   - Set dropdown to `POST`
   - URL: `http://localhost:5000/api/tasks`
   - Go to **Body** tab -> select **raw** -> select **JSON**
   - Enter:
     ```json
     {
       "title": "My First Task",
       "description": "Testing from Postman"
     }
     ```
   - Click **Send**. Status will be `201 Created`.
2. **View Tasks**:
   - Set dropdown to `GET`
   - URL: `http://localhost:5000/api/tasks`
   - Click **Send**. Status will be `200 OK`.
3. **Update Task**:
   - Set dropdown to `PUT`
   - URL: `http://localhost:5000/api/tasks/1`
   - Body: `{"completed": true}`
   - Click **Send**.
4. **Delete Task**:
   - Set dropdown to `DELETE`
   - URL: `http://localhost:5000/api/tasks/1`
   - Click **Send**.

---

## 🌐 Deploying to Vercel (Why Build Failed & How It Is Solved)

### Why did the build fail earlier?
1. **Missing `"build"` script in root `package.json`**: When you import a repository, Vercel executes `npm run build` in the root folder. Without a `"build"` script in root `package.json`, Vercel immediately errors with `npm error Missing script: "build"`.
2. **Output Directory mismatch**: Vite produces build artifacts inside `frontend/dist`. Without configuration, Vercel looks for `./dist` in the root.
3. **Serverless Filesystem**: Vercel lambdas have a read-only filesystem except `/tmp`.

### What has been configured to fix it:
- ✅ **Root `"build"` script added**: Installs frontend dependencies, builds Vite React, and guarantees the output is placed in `./dist`.
- ✅ **`vercel.json` configured**: Specifies `"buildCommand": "npm run build"`, `"outputDirectory": "dist"`, and routes `/api/*` to the Express serverless function.
- ✅ **`api/index.js` added**: Exports the Express REST API as a Vercel Serverless Function.
- ✅ **Ephemeral SQLite & Fallback Storage**: Automatically detects Vercel (`process.env.VERCEL`) and uses `/tmp` so the database does not encounter read-only filesystem errors.

### Deployment Steps:
1. Push your project to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Leave all settings at default (**Root Directory: `./`**, **Build Command: default**, **Output Directory: default**).
5. Click **Deploy**!
   - Your frontend will be live at `https://your-app.vercel.app`
   - Your API will be live at `https://your-app.vercel.app/api/tasks`

