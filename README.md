# SmartServe — Backend API

**Node.js + Express REST API** for the SmartServe Data-Driven Volunteer Coordination System.

---

## 📁 Project Structure

```
smartserve-backend/
├── server.js                 ← Entry point
├── package.json
├── .env.example              ← Copy to .env
├── README.md
│
├── routes/
│   ├── reports.js            ← Community reports CRUD
│   ├── volunteers.js         ← Volunteer registry CRUD
│   ├── dashboard.js          ← Analytics & stats
│   └── assign.js             ← Auto-assignment algorithm
│
├── middleware/
│   ├── validate.js           ← Input validation rules
│   └── errorHandler.js       ← 404 + global error handler
│
├── utils/
│   ├── db.js                 ← JSON flat-file database
│   ├── assignEngine.js       ← Matching algorithm
│   └── seed.js               ← Seed starter data
│
├── data/                     ← Auto-created JSON files
│   ├── reports.json
│   └── volunteers.json
│
└── public-js/                ← Updated frontend JS (API-connected)
    ├── community.js
    ├── volunteer.js
    └── dashboard.js
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd smartserve-backend
npm install
```

### 2. Create environment file
```bash
cp .env.example .env
```

### 3. Seed starter data (optional but recommended)
```bash
npm run seed
```

### 4. Start the server
```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The server starts at **http://localhost:5000**

---

## 🔗 Connect Frontend to Backend

Replace the 3 JS files in your `smartserve/js/` folder with the files from `public-js/`:

```
smartserve-backend/public-js/community.js  →  smartserve/js/community.js
smartserve-backend/public-js/volunteer.js  →  smartserve/js/volunteer.js
smartserve-backend/public-js/dashboard.js  →  smartserve/js/dashboard.js
```

Open the frontend via **VS Code Live Server** (port 5500) or any local HTTP server.
Opening `index.html` as a `file://` URL also works — CORS is configured for both.

---

## 📖 API Reference

### Base URL: `http://localhost:5000/api`

---

### 🏘️ Reports — Community Problem Data

| Method   | Endpoint                       | Description               |
|----------|--------------------------------|---------------------------|
| `GET`    | `/reports`                     | List all reports (filterable) |
| `GET`    | `/reports/:id`                 | Get single report         |
| `POST`   | `/reports`                     | Submit new report         |
| `PATCH`  | `/reports/:id`                 | Update report             |
| `PATCH`  | `/reports/:id/status`          | Update status only        |
| `DELETE` | `/reports/:id`                 | Delete report             |

**GET /reports — Query params:**
- `status` — `Pending | Assigned | Urgent | Completed`
- `severity` — `Low | Medium | High`
- `problemType` — `Food | Medical | Education | Logistics | Shelter | Water`
- `urgent` — `true | false`
- `search` — text search across area, location, description
- `page`, `limit` — pagination

**POST /reports — Body:**
```json
{
  "areaName": "North District",
  "problemType": "Food",
  "severity": "High",
  "location": "12.97° N, 77.59° E",
  "population": 500,
  "description": "Food shortage affecting 500 residents",
  "urgent": true
}
```

---

### 🙋 Volunteers

| Method   | Endpoint                          | Description                  |
|----------|-----------------------------------|------------------------------|
| `GET`    | `/volunteers`                     | List all volunteers           |
| `GET`    | `/volunteers/:id`                 | Get single volunteer          |
| `POST`   | `/volunteers`                     | Register new volunteer        |
| `PATCH`  | `/volunteers/:id`                 | Update volunteer profile      |
| `PATCH`  | `/volunteers/:id/availability`    | Toggle availability           |
| `DELETE` | `/volunteers/:id`                 | Remove volunteer              |

**POST /volunteers — Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91 9999000000",
  "location": "Koramangala, Bangalore",
  "skill": "Medical",
  "additionalSkills": ["First Aid", "Counseling"],
  "experience": 3,
  "availability": { "days": ["Mon","Wed","Fri"], "timeSlot": "Morning" },
  "hoursPerWeek": 15,
  "emergency": true
}
```

---

### 📊 Dashboard Analytics

| Method | Endpoint                          | Description                     |
|--------|-----------------------------------|---------------------------------|
| `GET`  | `/dashboard/stats`                | Headline stats (total, urgent…) |
| `GET`  | `/dashboard/breakdown`            | Needs count by problem type     |
| `GET`  | `/dashboard/urgent`               | List urgent needs (top 10)      |
| `GET`  | `/dashboard/top-volunteers`       | Top volunteers by assignments   |
| `GET`  | `/dashboard/recent`               | Activity feed                   |
| `GET`  | `/dashboard/trend`                | Last 7 days daily counts        |

---

### ⚡ Assignment

| Method | Endpoint                          | Description                         |
|--------|-----------------------------------|-------------------------------------|
| `POST` | `/assign`                         | Run auto-assignment algorithm       |
| `POST` | `/assign/manual`                  | Manually assign one report          |
| `GET`  | `/assign/history`                 | All past assignments                |
| `POST` | `/assign/:reportId/complete`      | Mark assigned task as completed     |

**POST /assign/manual — Body:**
```json
{
  "reportId": "uuid-of-report",
  "volunteerId": "uuid-of-volunteer"
}
```

---

## 🧠 Auto-Assignment Algorithm

Located in `utils/assignEngine.js`. Scoring breakdown (0–100 points):

| Factor                        | Points |
|-------------------------------|--------|
| Primary skill matches task    | +40    |
| Additional skills match       | up to +20 |
| Volunteer location proximity  | +20    |
| Emergency-available + urgent  | +10    |
| Fewer prior assignments       | up to +10 |

Volunteers with score > 0 are eligible. Highest score wins. A volunteer is limited to **3 assignments per auto-assign run** to prevent over-loading.

---

## 🔧 Configuration (`.env`)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500
DATA_DIR=./data
```

---

## 💡 Tech Stack

| Layer          | Technology              |
|----------------|-------------------------|
| Runtime        | Node.js 18+             |
| Framework      | Express 4               |
| Database       | JSON flat-file (via fs) |
| Validation     | express-validator        |
| CORS           | cors                    |
| Logging        | morgan                  |
| Dev server     | nodemon                 |

No database installation needed. Data persists in `data/*.json` files.

---

## 🧪 Testing the API with curl

```bash
# Health check
curl http://localhost:5000/health

# Get all reports
curl http://localhost:5000/api/reports

# Submit a report
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{"areaName":"Test Area","problemType":"Food","severity":"High","location":"12.97 N","urgent":true}'

# Run auto-assignment
curl -X POST http://localhost:5000/api/assign

# Get dashboard stats
curl http://localhost:5000/api/dashboard/stats
```

---

## 🚀 Deployment (Production)

```bash
# Set environment
NODE_ENV=production npm start

# With PM2 (process manager)
npm install -g pm2
pm2 start server.js --name smartserve-api
pm2 save
```

For production, consider replacing the JSON flat-file DB with SQLite (`better-sqlite3`) or MongoDB.
