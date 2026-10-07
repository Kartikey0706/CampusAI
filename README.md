# CampusAI

## What is CampusAI?

CampusAI is an AI-powered campus complaint management system.
Students can report problems such as Wi-Fi, water, hostel or classroom issues.
Local AI/NLP services analyze each complaint and suggest useful information.
The complaint is stored safely in MongoDB Atlas.
Administrators can view, filter and update complaint status.

CampusAI is an SRMU-focused academic prototype, not an official university system.

## Main Features

### Student

- Login using roll number and password
- Submit a complaint with title, description and location
- View submitted complaints
- Open a complaint detail page
- See category, sentiment, urgency, department and priority
- See complaint status and similar complaints

### AI Analysis

For each new complaint, CampusAI provides:

- Category, such as Wi-Fi, Water, Hostel, Fees or Library
- Sentiment: Positive, Neutral or Negative
- Urgency: Low, Medium or High
- Department recommendation
- Priority recommendation
- Similar complaint detection

The analysis uses the local Python services in `backend/app/services/`.
It does not require an external LLM API. If analysis fails, the complaint is still saved with safe pending values.

### Admin

- View all complaints
- Search complaints
- Filter by status, category and priority
- View complaint details
- View AI analysis and similar complaints
- Update complaint status
- View dashboard statistics
- View category distribution and analytics

## How the System Works

```text
Student
   |
React Frontend
   |
FastAPI Backend
   |
AI/NLP Analysis
   |
MongoDB Atlas
   |
Admin Dashboard
```

1. The student logs in and submits a complaint from the React frontend.
2. FastAPI checks the request and the student's JWT token.
3. The backend saves the complaint in MongoDB and runs the local analysis services.
4. The admin can review the complaint, see the recommendations and update its status.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React icons

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

### Database

- MongoDB Atlas
- PyMongo

### Authentication

- JWT using `python-jose`
- Password hashing using `passlib` and `bcrypt`

### AI/NLP

- `scikit-learn` and `joblib` for local model support
- `sentence-transformers` for semantic similarity when available
- A local token-based similarity fallback when the embedding model is unavailable

## Project Structure

```text
CampusAI_FINAL_FIXED/
├── frontend/
│   ├── src/
│   │   ├── layouts/       # Student and admin layouts
│   │   ├── pages/         # Public, student and admin pages
│   │   ├── services/      # Supporting frontend services
│   │   ├── components/    # Shared frontend components
│   │   ├── api.ts         # Active frontend API helper
│   │   └── App.tsx        # Frontend routes and access guards
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── auth/          # JWT and password helpers
│   │   ├── database/      # MongoDB connection
│   │   ├── models/        # Request and data models
│   │   ├── routes/        # Auth, complaint and protected routes
│   │   └── services/      # Analysis and similarity services
│   ├── requirements.txt
│   └── .env               # Local secrets; do not commit this file
│
├── ai/
│   ├── models/            # Local trained model files
│   └── datasets/          # Training data
│
└── README.md
```

## Complaint Status Flow

```text
Under Review
      |
In Progress
      |
Resolved
```

- **Under Review:** The complaint has been received and is waiting for review.
- **In Progress:** An administrator or department is working on the issue.
- **Resolved:** The issue has been marked as solved.

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Login with roll number and password. |
| POST | `/api/complaints` | Create a complaint for the logged-in student. |
| GET | `/api/complaints/my` | Get complaints belonging to the logged-in student. |
| GET | `/api/complaints/{id}` | View one complaint as a student. |
| GET | `/api/complaints/admin/all` | Get all complaints for an admin. |
| GET | `/api/complaints/admin/stats` | Get admin dashboard statistics. |
| PATCH | `/api/complaints/{id}/status` | Update a complaint status as an admin. |

Protected endpoints require a bearer JWT token.

## Local Setup

### Backend

Open PowerShell in the project folder:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create or update `backend/.env` with your own values:

```text
MONGODB_URL=your-mongodb-atlas-connection-string
DATABASE_NAME=campusai
JWT_SECRET=your-long-random-secret
```

Do not commit real MongoDB passwords or JWT secrets.

Start the backend:

```powershell
python -m uvicorn app.main:app --reload
```

The backend normally runs at `http://127.0.0.1:8000`.
API documentation is available at `http://127.0.0.1:8000/docs`.

### Frontend

Open another PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend uses `http://127.0.0.1:8000` by default for the backend. To use another backend URL, create `frontend/.env` and add:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Useful Checks

Frontend type check:

```powershell
npx tsc -b --pretty false
```

Frontend production build:

```powershell
npm run build
```

Backend health check:

```text
http://127.0.0.1:8000/health
```

## Safety Notes

- Do not commit `backend/.env` or `frontend/.env`.
- Do not expose MongoDB credentials, JWT secrets or passwords.
- Do not reset the MongoDB database during testing.
- Admin users remain responsible for the final complaint decision.
