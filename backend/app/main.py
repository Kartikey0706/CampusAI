from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.complaints import router as complaints_router
from app.routes.protected import router as protected_router

app = FastAPI(
    title="CampusAI API",
    description="AI-assisted campus complaint management system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://campus-ai-gamma-liard.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(protected_router)

@app.get("/")
def root():
    return {"message": "CampusAI Backend is running!", "status": "success"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "CampusAI API"}
