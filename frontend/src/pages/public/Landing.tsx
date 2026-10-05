import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ================= NAVBAR ================= */}
      <header className="nav">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          <span>
            Campus<span style={{ color: "#7b8f83" }}>AI</span>
          </span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/login">Login</Link>
          <Link to="/register" className="btn small">
            Get Started
          </Link>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={14} />
              AI-powered campus support
            </div>

            <h1>
              Smarter campus.
              <br />
              <span>Better experience.</span>
            </h1>

            <p>
              CampusAI makes it easier for students to report campus issues
              and helps administrators understand, prioritize and resolve them
              faster.
            </p>

            <div className="actions">
              <Link to="/register" className="btn">
                Get Started
                <ArrowRight size={17} />
              </Link>

              <Link to="/login" className="btn ghost">
                Sign in
              </Link>
            </div>

            <div className="trust">
              <CheckCircle2 size={15} />
              Built for a smoother campus experience
            </div>
          </div>

          {/* ================= HERO DASHBOARD ================= */}
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-head">
                <span>Campus support</span>

                <span
                  className="pill"
                  style={{
                    background: "#ecfdf3",
                    color: "#027a48",
                  }}
                >
                  Live
                </span>
              </div>

              <h3>Wi-Fi connectivity issue</h3>

              <p>
                Students in the academic block are experiencing unstable
                connectivity during peak hours.
              </p>

              <div className="ai-grid">
                <div>
                  <small>Category</small>
                  <b>Infrastructure</b>
                </div>

                <div>
                  <small>Department</small>
                  <b>IT Support</b>
                </div>

                <div>
                  <small>Urgency</small>
                  <b>High</b>
                </div>

                <div>
                  <small>Sentiment</small>
                  <b>Concerned</b>
                </div>
              </div>

              <div className="priority">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={16} />
                  <span>AI analysis complete</span>
                </div>

                <strong>92%</strong>
              </div>
            </div>

            {/* Floating assistant card */}
            <div
              style={{
                position: "absolute",
                right: "-24px",
                bottom: "-22px",
                width: "190px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "15px",
                boxShadow: "0 18px 45px rgba(16,24,40,.12)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "9px",
                    background: "#edf7f1",
                    display: "grid",
                    placeItems: "center",
                    color: "#527064",
                  }}
                >
                  <MessageCircle size={15} />
                </div>

                <div>
                  <strong style={{ fontSize: "12px" }}>
                    AI Assistant
                  </strong>
                  <div style={{ fontSize: "10px", color: "#98a2b3" }}>
                    Ready to help
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: "11px",
                  lineHeight: "1.5",
                  color: "#667085",
                  margin: "12px 0 0",
                }}
              >
                Need help reporting an issue?
              </p>
            </div>
          </div>
        </section>

        {/* ================= FEATURE INTRO ================= */}
        <section className="section" id="features">
          <div className="section-title">
            <div className="eyebrow">Everything in one place</div>

            <h2>
              A better way to manage
              <br />
              campus issues.
            </h2>
          </div>

          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            }}
          >
            {/* Feature 1 */}
            <div className="step">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "11px",
                  background: "#edf7f1",
                  display: "grid",
                  placeItems: "center",
                  color: "#527064",
                }}
              >
                <BrainCircuit size={19} />
              </div>

              <h3>AI Complaint Analysis</h3>

              <p>
                Automatically understand complaint category, sentiment,
                urgency and the most suitable department.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="step">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "11px",
                  background: "#edf7f1",
                  display: "grid",
                  placeItems: "center",
                  color: "#527064",
                }}
              >
                <MessageCircle size={19} />
              </div>

              <h3>AI Assistant</h3>

              <p>
                Get simple guidance while reporting an issue and make the
                complaint process easier for students.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="step">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "11px",
                  background: "#edf7f1",
                  display: "grid",
                  placeItems: "center",
                  color: "#527064",
                }}
              >
                <TrendingUp size={19} />
              </div>

              <h3>Priority & Insights</h3>

              <p>
                Help administrators identify important issues and understand
                recurring campus problems through structured insights.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="step">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "11px",
                  background: "#edf7f1",
                  display: "grid",
                  placeItems: "center",
                  color: "#527064",
                }}
              >
                <ShieldCheck size={19} />
              </div>

              <h3>Transparent Tracking</h3>

              <p>
                Students can track complaint status and stay informed from
                submission to resolution.
              </p>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section
          className="section"
          id="how-it-works"
          style={{ background: "#f7f9f7" }}
        >
          <div className="section-title">
            <div className="eyebrow">Simple by design</div>

            <h2>
              From problem to solution
              <br />
              in three simple steps.
            </h2>
          </div>

          <div className="steps">
            <div className="step">
              <span>01</span>

              <div
                style={{
                  marginTop: "22px",
                  color: "#527064",
                }}
              >
                <MessageCircle size={21} />
              </div>

              <h3>Report an issue</h3>

              <p>
                Tell CampusAI what happened using a simple complaint form.
                Students don't need to figure out the right department first.
              </p>
            </div>

            <div className="step">
              <span>02</span>

              <div
                style={{
                  marginTop: "22px",
                  color: "#527064",
                }}
              >
                <BrainCircuit size={21} />
              </div>

              <h3>AI understands it</h3>

              <p>
                CampusAI analyses the complaint and provides category,
                sentiment, urgency and routing assistance.
              </p>
            </div>

            <div className="step">
              <span>03</span>

              <div
                style={{
                  marginTop: "22px",
                  color: "#527064",
                }}
              >
                <CheckCircle2 size={21} />
              </div>

              <h3>Track the resolution</h3>

              <p>
                The issue reaches the appropriate department and students can
                follow its progress until it is resolved.
              </p>
            </div>
          </div>
        </section>

        {/* ================= STATS / TRUST ================= */}
        <section className="section">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "18px",
            }}
          >
            <div className="panel">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span className="muted">For students</span>
              </div>

              <h3 style={{ margin: "14px 0 7px" }}>
                One simple place to speak up.
              </h3>

              <p
                style={{
                  color: "#667085",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Report problems without worrying about where they should go.
              </p>
            </div>

            <div className="panel">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                <span className="muted">For administrators</span>
              </div>

              <h3 style={{ margin: "14px 0 7px" }}>
                Clearer campus insights.
              </h3>

              <p
                style={{
                  color: "#667085",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Turn scattered complaints into structured, actionable data.
              </p>
            </div>

            <div className="panel">
              <div className="flex items-center gap-2">
                <Clock3 size={18} />
                <span className="muted">For everyone</span>
              </div>

              <h3 style={{ margin: "14px 0 7px" }}>
                Less friction. Faster action.
              </h3>

              <p
                style={{
                  color: "#667085",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                A more transparent and organized campus support experience.
              </p>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section
          style={{
            padding: "35px 8vw 80px",
          }}
        >
          <div
            style={{
              background: "#17211c",
              color: "#fff",
              borderRadius: "22px",
              padding: "55px 50px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "30px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#b9d5c7",
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                }}
              >
                CampusAI
              </div>

              <h2
                style={{
                  fontSize: "34px",
                  letterSpacing: "-.03em",
                  margin: "10px 0",
                }}
              >
                Make campus support
                <br />
                feel effortless.
              </h2>

              <p
                style={{
                  color: "#aebbb4",
                  maxWidth: "520px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Give students a better way to raise concerns and give
                administrators better tools to act on them.
              </p>
            </div>

            <Link
              to="/register"
              className="btn"
              style={{
                background: "#dceee4",
                color: "#17211c",
                whiteSpace: "nowrap",
              }}
            >
              Get Started
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer
        style={{
          borderTop: "1px solid #e8ebef",
          padding: "25px 8vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#98a2b3",
          fontSize: "12px",
        }}
      >
        <span>© 2026 CampusAI</span>

        <span>Smarter campus. Better experience.</span>
      </footer>
    </div>
  );
}

export default Landing;
