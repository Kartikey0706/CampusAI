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

Use the appropriate deployed backend URL for a deployed environment. Do not put database credentials or JWT secrets in frontend environment variables.

## Complaint Statuses

- **Under Review:** Received and waiting for review.
- **In Progress:** Being handled by the responsible administrator or department.
- **Resolved:** Marked as resolved by an administrator.

## License

No license is specified in this repository snapshot. Contact the project owner before reusing or redistributing the code.
