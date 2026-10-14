// Simple automated test suite for the REST API
const app = require('./server');
const { db } = require('./db');

const PORT = 5099;
const server = app.listen(PORT, async () => {
  const BASE_URL = `http://localhost:${PORT}`;
  console.log(`Test server running at ${BASE_URL}\n--- Starting Tests ---`);

  try {
    // 1. Test GET /api/tasks (Initial)
    const initialRes = await fetch(`${BASE_URL}/api/tasks`);
    console.log(`1. GET /api/tasks status: ${initialRes.status}`);
    const initialTasks = await initialRes.json();
    console.log(`   Initial count: ${initialTasks.length}`);

    // 2. Test POST /api/tasks (Validation failure: empty title)
    const badPostRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' })
    });
    console.log(`2. POST /api/tasks with empty title status: ${badPostRes.status} (Expected 400)`);
    const badPostJson = await badPostRes.json();
    console.log(`   Error message: ${badPostJson.error}`);

    // 3. Test POST /api/tasks (Successful creation)
    const postRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Learn REST APIs',
        description: 'Understand HTTP methods and status codes'
      })
    });
    console.log(`3. POST /api/tasks status: ${postRes.status} (Expected 201)`);
    const createdTask = await postRes.json();
    console.log(`   Created Task:`, createdTask);

    const taskId = createdTask.id;

    // 4. Test GET /api/tasks/:id (Single task)
    const getSingleRes = await fetch(`${BASE_URL}/api/tasks/${taskId}`);
    console.log(`4. GET /api/tasks/${taskId} status: ${getSingleRes.status} (Expected 200)`);
    const fetchedTask = await getSingleRes.json();
    console.log(`   Fetched Task title: ${fetchedTask.title}`);

    // 5. Test PUT /api/tasks/:id (Update task to completed)
    const putRes = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Learn REST APIs and Express',
        completed: true
      })
    });
    console.log(`5. PUT /api/tasks/${taskId} status: ${putRes.status} (Expected 200)`);
    const updatedTask = await putRes.json();
    console.log(`   Updated Task completed: ${updatedTask.completed}, title: "${updatedTask.title}"`);

    // 6. Test GET non-existent task
    const notFoundRes = await fetch(`${BASE_URL}/api/tasks/99999`);
    console.log(`6. GET /api/tasks/99999 status: ${notFoundRes.status} (Expected 404)`);

    // 7. Test DELETE /api/tasks/:id
    const deleteRes = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE'
    });
    console.log(`7. DELETE /api/tasks/${taskId} status: ${deleteRes.status} (Expected 200)`);
    const deleteJson = await deleteRes.json();
    console.log(`   Delete response:`, deleteJson.message);

    // 8. Verify it was deleted
    const verifyDelRes = await fetch(`${BASE_URL}/api/tasks/${taskId}`);
    console.log(`8. Verify deleted GET status: ${verifyDelRes.status} (Expected 404)`);

    console.log('\n--- All API Tests Passed Successfully! ---');
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  } finally {
    db.close();
    server.close(() => {
      process.exit(0);
    });
  }
});
