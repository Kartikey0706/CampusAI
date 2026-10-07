import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { FormEvent } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./index.css";
import { register } from "./api";
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import LoginPage from "./pages/public/Login";
import PublicLanding from "./pages/public/Landing";
import AdminComplaintDetail from "./pages/admin/AdminComplaintDetail";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import Analytics from "./pages/admin/Analytics";
import Departments from "./pages/admin/Departments";
import ComplaintDetail from "./pages/student/ComplaintDetail";
import MyComplaints from "./pages/student/MyComplaints";
import ReportIssue from "./pages/student/ReportIssue";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSettings from "./pages/student/StudentSettings";

type User = { role?: string };

function useAuth() {
  const raw = localStorage.getItem("campusai_user");
  return raw ? (JSON.parse(raw) as User) : null;
}

function PublicNav() {
  return <nav className="nav"><Link to="/" className="brand"><span className="brand-mark">C</span>CampusAI</Link><div className="nav-links"><Link to="/login">Login</Link><Link className="btn small" to="/register">Get Started</Link></div></nav>;
}

function AuthLayout() {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, identifier, password, "student");
      navigate("/login");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return <><PublicNav/><main className="auth"><div className="auth-box"><button type="button" onClick={() => navigate("/")} aria-label="Back to home" className="mb-8 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><ArrowLeft size={16}/></button><h1>Create student account</h1><p className="mt-2 text-slate-500">Create an account to report and track campus issues.</p><form onSubmit={submit} className="login-form mt-7"><label>Name<input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Your full name"/></label><label>Roll Number<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required placeholder="Your university roll number"/></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} placeholder="Create a password"/></label>{error && <div className="error">{error}</div>}<button className="btn full" disabled={loading}>{loading ? "Please wait..." : "Create account"}</button></form><p className="switch">Already have an account? <Link to="/login">Sign in</Link></p></div></main></>;
}

function StudentRoute() {
  return useAuth() ? <StudentLayout/> : <Navigate to="/login" replace/>;
}

function AdminRoute() {
  const user = useAuth();
  if (!user) return <Navigate to="/login" replace/>;
  return user.role === "admin" ? <AdminLayout/> : <Navigate to="/student" replace/>;
}

function App() {
  return <BrowserRouter><Routes><Route path="/" element={<PublicLanding/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<AuthLayout/>}/><Route path="/student" element={<StudentRoute/>}><Route index element={<StudentDashboard/>}/><Route path="complaints" element={<MyComplaints/>}/><Route path="complaints/:id" element={<ComplaintDetail/>}/><Route path="report" element={<ReportIssue/>}/><Route path="settings" element={<StudentSettings/>}/></Route><Route path="/admin" element={<AdminRoute/>}><Route index element={<AdminDashboard/>}/><Route path="complaints" element={<AdminComplaints/>}/><Route path="complaints/:id" element={<AdminComplaintDetail/>}/><Route path="departments" element={<Departments/>}/><Route path="analytics" element={<Analytics/>}/><Route path="settings" element={<AdminSettings/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter>;
}

export default App;
