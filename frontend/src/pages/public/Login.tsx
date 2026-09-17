import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { login } from "../../api";

function Login() {
  const navigate = useNavigate();

  const [loginRole, setLoginRole] = useState<"student" | "admin">("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await login(identifier, password, loginRole);

      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const identifierLabel = loginRole === "student" ? "Roll Number" : "Employee ID";
  const identifierPlaceholder = loginRole === "student" ? "202410101360241" : "EMP-001";

  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          CampusAI
        </Link>

        <div className="nav-links">
          {loginRole === "admin" ? (
            <button type="button" className="btn small" disabled>
              Create Account
            </button>
          ) : (
            <Link to="/register" className="btn small">
              Create Account
            </Link>
          )}
        </div>
      </nav>

      <main className="auth">
        <div className="auth-box">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Back to home"
            className="mb-8 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowLeft size={16} />
          </button>

          <h1>Welcome back</h1>

          <p className="mt-2 text-slate-500">Sign in to track and manage your campus issues.</p>

          {error && <div className="error">{error}</div>}

          <div className="mt-7 flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {[
              { value: "student", label: "Student Login" },
              { value: "admin", label: "Admin Login" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLoginRole(option.value as "student" | "admin")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${
                  loginRole === option.value
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="login-form mt-6">
            <label>
              {identifierLabel}
              <input
                required
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={identifierPlaceholder}
              />
            </label>

            <label>
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </label>

            <button type="submit" className="btn full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="switch">
            {loginRole === "admin" ? (
              "Admin account creation is currently disabled."
            ) : (
              <>
                New to CampusAI? <Link to="/register">Create an account</Link>
              </>
            )}
          </p>
        </div>
      </main>
    </>
  );
}

export default Login;