// Use a relative API endpoint so the frontend works when served from any host.
const API_BASE = '/api/tasks';

const elements = {
  loginSection: document.getElementById('loginSection'),
  loginForm: document.getElementById('loginForm'),
  loginUsername: document.getElementById('loginUsername'),
  loginPassword: document.getElementById('loginPassword'),
  loginStatus: document.getElementById('loginStatus'),
  logoutBtn: document.getElementById('logoutBtn'),
  appSection: document.getElementById('appSection'),

  form: document.getElementById('taskForm'),
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  isDone: document.getElementById('isDone'),
  taskId: document.getElementById('taskId'),
  submitBtn: document.getElementById('submitBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  status: document.getElementById('status'),
  tasksTbody: document.getElementById('tasksTbody'),
  formTitle: document.getElementById('formTitle'),
};

let authToken = localStorage.getItem('crudapp_token') || '';

function getAuthHeader() {
  if (!authToken) return {};
  return { Authorization: `Basic ${authToken}` };
}

function showLogin(message) {
  elements.loginSection.hidden = false;
  elements.appSection.hidden = true;
  elements.logoutBtn.hidden = true;
  if (message) setLoginStatus(message, 'error');
}

function showApp() {
  elements.loginSection.hidden = true;
  elements.appSection.hidden = false;
  elements.logoutBtn.hidden = false;
  setLoginStatus('');
}

function setLoginStatus(message, type = 'info') {
  elements.loginStatus.textContent = message;
  elements.loginStatus.className = `status ${type}`;
}

function setStatus(message, type = 'info') {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
}

function clearForm() {
  elements.taskId.value = '';
  elements.title.value = '';
  elements.description.value = '';
  elements.isDone.checked = false;
  elements.formTitle.textContent = 'Create Task';
  elements.submitBtn.textContent = 'Create';
  elements.cancelBtn.hidden = true;
}

function renderTasks(tasks) {
  elements.tasksTbody.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    elements.tasksTbody.innerHTML = '<tr><td colspan="4" class="muted">No tasks found.</td></tr>';
    return;
  }

  tasks.forEach((task) => {
    const tr = document.createElement('tr');

    const titleTd = document.createElement('td');
    titleTd.textContent = task.title;

    const descTd = document.createElement('td');
    descTd.textContent = task.description || '-';

    const doneTd = document.createElement('td');
    doneTd.textContent = task.isDone ? '✅' : '❌';

    const actionsTd = document.createElement('td');
    actionsTd.className = 'right';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn';
    editBtn.addEventListener('click', () => startEdit(task));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn danger';
    deleteBtn.addEventListener('click', () => deleteTask(task._id));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(titleTd);
    tr.appendChild(descTd);
    tr.appendChild(doneTd);
    tr.appendChild(actionsTd);

    elements.tasksTbody.appendChild(tr);
  });
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };
}

async function fetchTasks() {
  try {
    setStatus('Loading tasks...', 'info');
    const res = await fetch(API_BASE, { headers: getHeaders() });
    const data = await res.json();

    if (res.status === 401) {
      showLogin('Please log in to view tasks.');
      return;
    }

    if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks');

    renderTasks(data);
    setStatus('Tasks loaded.', 'success');
  } catch (err) {
    setStatus(err.message || 'Failed to load tasks', 'error');
  }
}

async function createTask(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (res.status === 401) {
    showLogin('Please login to create tasks.');
    throw new Error('Unauthorized');
  }

  if (!res.ok) throw new Error(data.message || 'Failed to create task');
  return data;
}

async function updateTask(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (res.status === 401) {
    showLogin('Please login to update tasks.');
    throw new Error('Unauthorized');
  }

  if (!res.ok) throw new Error(data.message || 'Failed to update task');
  return data;
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();

    if (res.status === 401) {
      showLogin('Please login to delete tasks.');
      throw new Error('Unauthorized');
    }

    if (!res.ok) throw new Error(data.message || 'Failed to delete task');
    setStatus('Task deleted.', 'success');
    fetchTasks();
  } catch (err) {
    setStatus(err.message || 'Failed to delete task', 'error');
  }
}

function startEdit(task) {
  elements.taskId.value = task._id;
  elements.title.value = task.title;
  elements.description.value = task.description || '';
  elements.isDone.checked = Boolean(task.isDone);
  elements.formTitle.textContent = 'Edit Task';
  elements.submitBtn.textContent = 'Update';
  elements.cancelBtn.hidden = false;
}

function setAuthToken(token) {
  authToken = token || '';
  if (authToken) {
    localStorage.setItem('crudapp_token', authToken);
  } else {
    localStorage.removeItem('crudapp_token');
  }
}

async function login(username, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data.token;
}

async function handleLogin(event) {
  event.preventDefault();

  const username = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value.trim();

  if (!username || !password) {
    setLoginStatus('Username and password are required.', 'error');
    return;
  }

  try {
    setLoginStatus('Logging in...', 'info');
    const token = await login(username, password);
    setAuthToken(token);
    setLoginStatus('Logged in successfully.', 'success');
    showApp();
    fetchTasks();
  } catch (err) {
    setLoginStatus(err.message || 'Login failed', 'error');
  }
}

function logout() {
  setAuthToken('');
  showLogin('Logged out.');
}

async function handleSubmit(event) {
  event.preventDefault();

  const payload = {
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
    isDone: elements.isDone.checked,
  };

  if (!payload.title) {
    setStatus('Title is required', 'error');
    return;
  }

  try {
    setStatus('Saving...', 'info');

    if (elements.taskId.value) {
      await updateTask(elements.taskId.value, payload);
      setStatus('Task updated.', 'success');
    } else {
      await createTask(payload);
      setStatus('Task created.', 'success');
    }

    clearForm();
    fetchTasks();
  } catch (err) {
    setStatus(err.message || 'Failed to save task', 'error');
  }
}

function init() {
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.logoutBtn.addEventListener('click', logout);

  elements.form.addEventListener('submit', handleSubmit);
  elements.cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearForm();
    setStatus('');
  });

  document.getElementById('refreshBtn').addEventListener('click', fetchTasks);

  if (authToken) {
    showApp();
    fetchTasks();
  } else {
    showLogin();
  }
}

window.addEventListener('DOMContentLoaded', init);
