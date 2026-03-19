const API_BASE = 'http://localhost:5000/api/tasks';

const elements = {
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

async function fetchTasks() {
  try {
    setStatus('Loading tasks...', 'info');
    const res = await fetch(API_BASE);
    const data = await res.json();

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create task');
  return data;
}

async function updateTask(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update task');
  return data;
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
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
  elements.form.addEventListener('submit', handleSubmit);
  elements.cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearForm();
    setStatus('');
  });

  document.getElementById('refreshBtn').addEventListener('click', fetchTasks);
  fetchTasks();
}

window.addEventListener('DOMContentLoaded', init);
