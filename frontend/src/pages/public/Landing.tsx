import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CalendarDays,
  MessageCircle,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";

function Landing() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("campusai-theme") === "dark";
  });

  const [showCampusVideo, setShowCampusVideo] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("campusai-dark", darkMode);

    localStorage.setItem(
      "campusai-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="landing-page">

      {/* ================= NAVBAR ================= */}
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-mark">C</span>

          <span>
            Campus<span>AI</span>
          </span>
        </Link>

        <nav className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="landing-nav-actions">

          {/* ================= THEME BUTTON ================= */}
          <button
            type="button"
            className="landing-theme-btn"
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            onClick={toggleTheme}
          >
            {darkMode ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </button>

          <Link to="/login" className="landing-login">
            Login
          </Link>

          <Link to="/register" className="landing-nav-cta">
            Get Started
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>

        <section className="landing-hero" id="home">

          <div className="landing-hero-content">

            <div className="landing-badge">
              <span className="landing-badge-dot" />
              <span>Built for SRMU</span>
            </div>

            <h1>
              Smarter Campus.
              <br />
              <span>Better Experience.</span>
            </h1>

            <p>
              CampusAI makes campus life simpler by helping students report
              problems, get assistance, and stay connected with everything
              happening around their university.
            </p>

            <div className="landing-hero-buttons">

              <Link
                to="/register"
                className="landing-primary-btn"
              >
                Get Started
                <ArrowRight size={17} />
              </Link>

              
              <button
                type="button"
                className="landing-secondary-btn"
                onClick={() => setShowCampusVideo(true)}
              >
                <span className="landing-play-icon">▶</span>
                Explore SRMU
              </button>

            </div>

            <div className="landing-trust">

              <div className="landing-avatars">
                <span>KS</span>
                <span>AS</span>
                <span>RK</span>
                <span>+</span>
              </div>

              <div>
                <strong>+1.2k</strong>
                <span>Trusted by SRMU Students</span>
              </div>

            </div>

          </div>

          {/* ================= HERO VIDEO BACKGROUND ================= */}
          <video
            className="landing-hero-bg-video"
            src="/srmu-drone.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />

        </section>

        {/* ================= FEATURES ================= */}
        <section
          className="landing-features"
          id="features"
        >

          <div className="landing-section-heading">

            <div className="landing-small-label">
              <span />
              Everything you need
            </div>

            <h2>
              Everything You Need,
              <br />
              <span>All in One Place.</span>
            </h2>

            <p>
              One simple platform for a smarter, more connected campus
              experience.
            </p>

          </div>

          <div className="landing-feature-grid">

            {/* Feature 1 */}
            <div className="landing-feature-card">

              <div className="landing-feature-icon">
                <BrainCircuit size={21} />
              </div>

              <h3>AI Complaint Analysis</h3>

              <p>
                CampusAI understands your complaint and automatically helps
                identify its category, urgency, sentiment and department.
              </p>

              <span className="landing-feature-link">
                AI-powered
                <ArrowRight size={14} />
              </span>

            </div>

            {/* Feature 2 */}
            <div className="landing-feature-card">

              <div className="landing-feature-icon">
                <MessageCircle size={21} />
              </div>

              <h3>AI Assistant</h3>

              <p>
                Get quick guidance while reporting problems and make the
                complaint process easier and more intuitive.
              </p>

              <span className="landing-feature-link">
                Always available
                <ArrowRight size={14} />
              </span>

            </div>

            {/* Feature 3 */}
            <div className="landing-feature-card">

              <div className="landing-feature-icon">
                <Building2 size={21} />
              </div>

              <h3>Notices & Updates</h3>

              <p>
                Stay informed about important campus announcements and
                updates from one organized place.
              </p>

              <span className="landing-feature-link">
                Stay updated
                <ArrowRight size={14} />
              </span>

            </div>

            {/* Feature 4 */}
            <div className="landing-feature-card">

              <div className="landing-feature-icon">
                <CalendarDays size={21} />
              </div>

              <h3>Timetable & Academics</h3>

              <p>
                Keep your academic information accessible so you can spend
                less time searching and more time learning.
              </p>

              <span className="landing-feature-link">
                Stay organized
                <ArrowRight size={14} />
              </span>

            </div>

          </div>

        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section
          className="landing-how"
          id="how-it-works"
        >

          <div className="landing-how-content">

            <div className="landing-small-label landing-light-label">
              <span />
              Simple by design
            </div>

            <h2>
              From problem
              <br />
              <span>to solution.</span>
            </h2>

            <p>
              CampusAI removes the unnecessary complexity from campus support.
              Just tell us what happened and let AI help with the rest.
            </p>

            <div className="landing-steps">

              <div className="landing-step">

                <span>01</span>

                <div>
                  <h3>Report</h3>

                  <p>
                    Tell us what happened in a simple complaint form.
                  </p>
                </div>

              </div>

              <div className="landing-step">

                <span>02</span>

                <div>
                  <h3>AI Understands</h3>

                  <p>
                    AI analyses category, urgency, sentiment and routing.
                  </p>
                </div>

              </div>

              <div className="landing-step">

                <span>03</span>

                <div>
                  <h3>Track</h3>

                  <p>
                    Follow your complaint until the issue reaches resolution.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* ================= DASHBOARD CARD ================= */}
          <div className="landing-how-card">

            <div className="landing-dashboard-top">

              <div>
                <span>Campus overview</span>
                <strong>Good morning 👋</strong>
              </div>

              <div className="landing-dashboard-avatar">
                K
              </div>

            </div>

            <div className="landing-dashboard-stat">

              <div>
                <span>Active complaints</span>
                <strong>24</strong>
              </div>

              <div className="landing-stat-progress">
                <span />
              </div>

            </div>

            <div className="landing-dashboard-row">

              <div>
                <span className="landing-status-dot green" />
                Resolved
              </div>

              <strong>18</strong>

            </div>

            <div className="landing-dashboard-row">

              <div>
                <span className="landing-status-dot orange" />
                In progress
              </div>

              <strong>4</strong>

            </div>

            <div className="landing-dashboard-row">

              <div>
                <span className="landing-status-dot gray" />
                Pending
              </div>

              <strong>2</strong>

            </div>

            <div className="landing-ai-note">
              <Sparkles size={15} />
              <span>AI insights updated just now</span>
            </div>

          </div>

        </section>

        {/* ================= ABOUT ================= */}
        <section
          className="landing-about"
          id="about"
        >

          <div>

            <div className="landing-small-label">
              <span />
              Why CampusAI
            </div>

            <h2>
              A better way to
              <br />
              <span>experience campus.</span>
            </h2>

          </div>

          <p>
            CampusAI brings students, campus information and intelligent
            support together in one clean platform — designed specifically
            around the everyday needs of university life.
          </p>

        </section>

        {/* ================= CTA ================= */}
        <section
          className="landing-cta"
          id="contact"
        >

          <div className="landing-cta-inner">

            <div>

              <span>READY TO GET STARTED?</span>

              <h2>
                Make campus support
                <br />
                feel effortless.
              </h2>

              <p>
                Join CampusAI and experience a smarter way to connect with
                your campus.
              </p>

            </div>

            <Link
              to="/register"
              className="landing-cta-button"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="landing-footer">

        <Link
          to="/"
          className="landing-footer-brand"
        >
          <span className="landing-brand-mark">
            C
          </span>

          Campus<span>AI</span>
        </Link>

        <span>
          © 2026 CampusAI
        </span>

        <span>
          Smarter campus. Better experience.
        </span>

      </footer>

      {showCampusVideo && (
  <div
    className="campus-video-overlay"
    onClick={() => setShowCampusVideo(false)}
  >
    <div
      className="campus-video-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="campus-video-close"
        onClick={() => setShowCampusVideo(false)}
        aria-label="Close campus video"
      >
        ×
      </button>

      <video
        className="campus-video-player"
        src="/srmu-drone.mp4"
        controls
        autoPlay
        playsInline
      />

      <div className="campus-video-caption">
        <strong>Explore Shri Ramswaroop Memorial University</strong>
        <span>A glimpse of the campus behind CampusAI.</span>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Landing;
