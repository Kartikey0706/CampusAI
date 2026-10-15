# CampusAI

**CampusAI** is an AI-assisted campus complaint management system designed around the needs of SRMU students. It provides a central place to report campus issues and helps administrators review, prioritize, and track complaints.

> **Project status:** Academic prototype in active development. CampusAI is an independent student project, not an official SRMU system.

## Live Preview

- **Frontend:** https://campus-ai-sepia.vercel.app/
- **Backend:** Hosted on Render as `campusai-backend`. The exact service URL and environment variables are managed in the Render dashboard.
- **API documentation (when the backend is running):** `/docs`
- **Health check (when the backend is running):** `/health`

The frontend is deployed on Vercel and the backend is hosted separately. If a recent GitHub change does not appear on the live site, check the deployment status in Vercel or Render and trigger a manual deploy if required.

## What CampusAI Does

### Student features
- Register and log in.
- Submit a complaint with a title, description, and location.
- View submitted complaints and open individual complaint details.
- Review complaint category, sentiment, urgency, suggested department, and priority.
- See complaint status and similar complaints where available.

### Admin features
- View and search complaints.
- Filter complaints by status, category, and priority.
- Open complaint details and review the AI-assisted analysis.
- Update complaint status.
- View dashboard statistics, category distribution, and analytics.

### AI-assisted complaint analysis
CampusAI uses local Python services to help analyse complaints. Depending on the complaint and available services, the analysis can provide:
- **Category** such as Wi-Fi, water, hostel, fees, or library.
- **Sentiment**: positive, neutral, or negative.
- **Urgency**: low, medium, or high.
- **Suggested department and priority.**
- **Similar-complaint matching** to help identify repeated issues.

The system is designed to work without an external LLM API. AI output is advisory; administrators remain responsible for reviewing complaints and making final decisions. If analysis is unavailable, complaint handling should not be treated as a substitute for administrative review.

## How It Works

```text
Student / Admin
      |
React + TypeScript frontend
      |
FastAPI backend
      |
Authentication, complaint routes and AI services
      |
MongoDB Atlas
```

1. A student submits a complaint through the frontend.
2. The FastAPI backend validates the request and checks authentication where required.
3. The complaint is stored in MongoDB Atlas and analysed by the backend services.
4. Students can track their complaints, while administrators can review and update them.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Database | MongoDB Atlas, PyMongo |
| Authentication | JWT (`python-jose`), password hashing (`passlib`, `bcrypt`) |
| AI / analysis | scikit-learn, joblib, local category and analysis services |
| Deployment | Vercel (frontend), Render (backend) |

Semantic similarity can use `sentence-transformers` when available, with a local token-based fallback.

## Repository Structure

```text
CampusAI/
├── ai/
│   ├── datasets/             # Complaint category training data
│   ├── models/               # Saved local model files
│   └── training/             # Model training scripts
├── backend/
│   ├── app/
│   │   ├── auth/             # JWT and password helpers
│   │   ├── database/         # MongoDB connection
│   │   ├── models/           # Data and request models
│   │   ├── routes/           # Authentication and complaint APIs
│   │   └── services/         # Category, urgency, priority, sentiment and similarity
│   ├── tests/                # Backend regression and service tests
│   ├── requirements.txt
│   └── seed_demo_students.py
├── frontend/
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/             # Public, student and admin screens
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── vercel.json
├── .gitignore
└── README.md
```

## Run Locally

### Requirements
- Python 3.10+ recommended.
- Node.js and npm.
- A MongoDB Atlas connection string or another compatible MongoDB deployment.

### 1. Start the backend

In PowerShell, from the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` with your own values:

```dotenv
MONGODB_URL=your-mongodb-atlas-connection-string
DATABASE_NAME=campusai
JWT_SECRET=replace-with-a-long-random-secret
```

Keep real credentials private. Do not commit your `.env` file.

Start the API:

```powershell
python -m uvicorn app.main:app --reload
```

The backend normally runs at `http://127.0.0.1:8000`.

- API docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 2. Start the frontend

Open a second PowerShell window from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The frontend uses `http://127.0.0.1:8000` as the default backend base URL. If you need to point it to another backend, create `frontend/.env` with:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Use the appropriate deployed backend URL for a deployed environment. Do not put database credentials or JWT secrets in frontend environment variables.

## Useful Checks

Run these from the relevant folder.

### Frontend type check

```powershell
cd frontend
npx tsc -b --pretty false
```

### Frontend production build

```powershell
cd frontend
npm run build
```

### Backend tests

```powershell
cd backend
python -m pytest
```

If `pytest` is not installed in the active environment, install it before running the test suite. Test coverage currently includes category/service behaviour, similarity behaviour, and timestamp serialization. Test results should be checked locally before treating a change as verified.

## Complaint Statuses

- **Under Review:** Received and waiting for review.
- **In Progress:** Being handled by the responsible administrator or department.
- **Resolved:** Marked as resolved by an administrator.

## API Overview

The backend exposes authentication and complaint endpoints. Core routes include:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/complaints` | Submit a complaint |
| `GET` | `/api/complaints/my` | List the logged-in student's complaints |
| `GET` | `/api/complaints/{id}` | Retrieve a complaint detail |
| `GET` | `/api/complaints/admin/all` | List complaints for administrators |
| `GET` | `/api/complaints/admin/stats` | Retrieve dashboard statistics |
| `PATCH` | `/api/complaints/{id}/status` | Update a complaint status |

Protected routes require a bearer JWT token. See the running API documentation at `/docs` for the current request and response schemas.

## Current Development Notes

- The landing page and public login/register screens are part of the React frontend.
- Student complaint workflows and admin review/analytics screens are present in the repository.
- The backend contains local category and complaint-analysis services plus automated service tests.
- Frontend and backend deploy independently. A successful GitHub push does not guarantee that both hosted services have deployed the latest commit.
- The local regression-test file `backend/tests/test_category_context_regressions.py` is not present in this repository snapshot; category-related regression coverage also exists in `backend/tests/test_category_service.py`. Preserve any additional uncommitted test cases before deleting an old local project copy.

## Security and Data Notes

- Never commit `.env` files, database connection strings, JWT secrets, passwords, or real student data.
- Use placeholder values in documentation and examples.
- Do not reset or delete the MongoDB database during routine testing.
- Treat AI-generated category, urgency, sentiment, and priority as recommendations, not final decisions.
- This project is a prototype and should not be presented as an official university service.

## License

No license is specified in this repository snapshot. Contact the project owner before reusing or redistributing the code.
