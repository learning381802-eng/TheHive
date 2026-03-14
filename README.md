# The Hive 🐝

The Hive is a Google Chat-like team chat app with:
- **Frontend:** React + Vite (deploy to **Netlify**)
- **Backend:** Express + Socket.IO (deploy to **Render**)
- **Database:** **MongoDB Atlas**
- **CI/CD flow:** Deploy from **GitHub**

## Project Structure

- `frontend/` → Netlify app
- `backend/` → Render API + realtime socket server
- `render.yaml` → optional Render blueprint

## 1) Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas database URI

### Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### Configure environment variables

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Update:
- `frontend/.env`
  - `VITE_API_URL=http://localhost:5000`
  - `VITE_SOCKET_URL=http://localhost:5000`
- `backend/.env`
  - `MONGODB_URI=<your_mongodb_connection_string>`
  - `FRONTEND_ORIGIN=http://localhost:5173`

### Run locally

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## 2) Deploy with GitHub + Netlify + Render

1. Push this repo to GitHub.
2. Create a MongoDB Atlas database and copy your URI.
3. On Render:
   - Create a new **Web Service** from the GitHub repo.
   - Use `backend` as root directory.
   - Build command: `npm install`
   - Start command: `npm start`
   - Set environment variables:
     - `MONGODB_URI`
     - `FRONTEND_ORIGIN` (your Netlify URL)
4. On Netlify:
   - Import the GitHub repo.
   - Set base directory to `frontend`.
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set environment variables:
     - `VITE_API_URL` = your Render backend URL
     - `VITE_SOCKET_URL` = your Render backend URL
5. Redeploy both services after environment variables are set.

## API Endpoints

- `GET /api/health` → server health check
- `GET /api/messages?room=global` → fetch recent messages
- `POST /api/messages` → send message

Example payload:

```json
{
  "room": "global",
  "senderName": "Ava",
  "content": "Hello team!"
}
```

## 3) Export a ZIP file

From repo root:

```bash
zip -r TheHive.zip . -x "*/node_modules/*" -x "*.git*"
```

This produces `TheHive.zip` ready to share.
