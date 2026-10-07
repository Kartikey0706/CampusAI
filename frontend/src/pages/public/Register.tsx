import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api";

function Register() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [rollNumber, setRollNumber] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setLoading(true);

		try {
			await register(name, rollNumber, password, "student");
			navigate("/login");
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : "Registration failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="auth">
			<div className="auth-box">
				<button type="button" onClick={() => navigate("/")} aria-label="Back to home" className="mb-8 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
					<ArrowLeft size={16} />
				</button>
				<h1>Create student account</h1>
				<p className="mt-2 text-slate-500">Create an account to report and track campus issues.</p>
				<form onSubmit={handleSubmit} className="login-form mt-7">
					<label>Name<input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Your full name" /></label>
					<label>Roll Number<input value={rollNumber} onChange={(event) => setRollNumber(event.target.value)} required placeholder="Your university roll number" /></label>
					<label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} placeholder="Create a password" /></label>
					{error && <div className="error">{error}</div>}
					<button className="btn full" disabled={loading}>{loading ? "Please wait..." : "Create account"}</button>
				</form>
				<p className="switch">Already have an account? <Link to="/login">Sign in</Link></p>
			</div>
		</main>
	);
}

export default Register;
