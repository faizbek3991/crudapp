# CRUD App (MERN-style)

A simple **CRUD (Create, Read, Update, Delete)** example app using:

- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Frontend:** Vanilla HTML/CSS/JavaScript

---

## 📦 Project Structure

```
crudapp/
  ├─ backend/           # Express API + MongoDB models
  │   ├─ server.js      # Main API server
  │   ├─ routes/tasks.js
  │   ├─ models/Task.js
  │   └─ .env           # Local dev settings (not committed)
  ├─ frontend/          # Static web UI (served by Express)
  │   ├─ index.html
  │   ├─ style.css
  │   └─ app.js
  └─ .gitignore
```

---

## ✅ Prerequisites

Make sure you have the following installed locally:

- Node.js (LTS) + npm
- MongoDB (local or remote)

---

## 🚀 Local Setup (Development)

### 1) Install dependencies

```bash
cd crudapp/backend
npm install
```

### 2) Configure environment

Create (or update) `crudapp/backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crudapp

# Admin login (used by the frontend login page)
ADMIN_USER=admin
ADMIN_PASS=secret
```

> If you use MongoDB Atlas, set `MONGO_URI` to your connection string.
> 
> You can change `ADMIN_USER`/`ADMIN_PASS` to secure the app.

### 3) Start the server

```bash
cd crudapp/backend
node server.js
```

Then open the UI:

- http://localhost:5000/

> The backend exposes:
> - GET  `/api/tasks`
> - POST `/api/tasks`
> - PUT  `/api/tasks/:id`
> - DELETE `/api/tasks/:id`

---

## 🧪 Frontend

The frontend lives in `crudapp/frontend/` and is served statically by Express.

It uses `fetch()` to call the backend API at `/api/tasks`.

---

## 🧩 How to use

1. Open the app in your browser.
2. Create tasks using the form.
3. Edit or delete tasks using the buttons.

---

## 🔁 Deployment Notes (AWS EC2 + Nginx)

1. Deploy the repository to your EC2 instance (clone or pull from GitHub).
2. Install Node.js + npm and MongoDB (or use Atlas).
3. Run the app with `node server.js` (or use PM2/systemd for production).
4. Use Nginx as a reverse proxy to expose the app on port 80.

---

## 📄 License

MIT
