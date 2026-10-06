import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Menu,
  MessageSquareText,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  X,
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

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-mark">C</span>

          <span className="landing-brand-text">
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
              <Sun size={18} />
            ) : (
              <Moon size={18} />
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


      <main>

        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="landing-hero" id="home">

          {/* Background Video */}
          <video
            className="landing-hero-bg-video"
            src="/srmu-drone.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />

          {/* Video Overlay */}
          <div
            className="landing-hero-video-overlay"
            aria-hidden="true"
          />

          {/* Extra gradient for text readability */}
          <div
            className="landing-hero-gradient"
            aria-hidden="true"
          />

          {/* Hero Content */}
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
              CampusAI makes campus life simpler by helping students
              report problems, get assistance, and stay connected
              with everything happening around their university.
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
                <span className="landing-play-icon">
                  ▶
                </span>

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

              <div className="landing-trust-text">
                <strong>+1.2k</strong>
                <span>Trusted by SRMU Students</span>
              </div>

            </div>

          </div>


        </section>


        {/* =========================================================
            FEATURES
        ========================================================= */}
        <section
          className="landing-section landing-features"
          id="features"
        >

          <div className="landing-section-heading">

            <span className="landing-section-label">
              WHY CAMPUSAI
            </span>

            <h2>
              Everything your campus
              <br />
              <span>needs in one place.</span>
            </h2>

            <p>
              A smarter way for students to connect with their
              university and solve everyday campus problems.
            </p>

          </div>


          <div className="landing-feature-grid">

            <article className="landing-feature-card">

              <div className="landing-feature-icon">
                <BrainCircuit size={23} />
              </div>

              <h3>AI-Powered Assistance</h3>

              <p>
                Get intelligent assistance for campus queries,
                complaints, and everyday student needs.
              </p>

            </article>


            <article className="landing-feature-card">

              <div className="landing-feature-icon">
                <ClipboardCheck size={23} />
              </div>

              <h3>Smart Complaints</h3>

              <p>
                Submit campus issues easily and let AI classify,
                prioritize, and route them to the right department.
              </p>

            </article>


            <article className="landing-feature-card">

              <div className="landing-feature-icon">
                <MessageCircle size={23} />
              </div>

              <h3>Student Support</h3>

              <p>
                One simple platform to get help, information,
                and important campus updates.
              </p>

            </article>


            <article className="landing-feature-card">

              <div className="landing-feature-icon">
                <Zap size={23} />
              </div>

              <h3>Faster Resolution</h3>

              <p>
                Reduce repetitive complaints and help campus
                departments respond to important issues faster.
              </p>

            </article>

          </div>

        </section>


        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}
        <section className="landing-section landing-how">

          <div className="landing-section-heading">

            <span className="landing-section-label">
              HOW IT WORKS
            </span>

            <h2>
              Campus problems,
              <br />
              <span>made simple.</span>
            </h2>

          </div>


          <div className="landing-steps">

            <div className="landing-step">

              <div className="landing-step-number">
                01
              </div>

              <div>
                <h3>Tell us what happened</h3>

                <p>
                  Submit your campus issue or ask a question
                  through CampusAI.
                </p>
              </div>

            </div>


            <div className="landing-step">

              <div className="landing-step-number">
                02
              </div>

              <div>
                <h3>AI understands it</h3>

                <p>
                  CampusAI analyzes the request and identifies
                  the right category and priority.
                </p>
              </div>

            </div>


            <div className="landing-step">

              <div className="landing-step-number">
                03
              </div>

              <div>
                <h3>Right department gets it</h3>

                <p>
                  The issue is routed to the appropriate campus
                  department for action.
                </p>
              </div>

            </div>


            <div className="landing-step">

              <div className="landing-step-number">
                04
              </div>

              <div>
                <h3>Track the progress</h3>

                <p>
                  Stay updated and know what is happening with
                  your complaint.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* =========================================================
            ABOUT
        ========================================================= */}
        <section
          className="landing-section landing-about"
          id="about"
        >

          <div className="landing-about-content">

            <span className="landing-section-label">
              ABOUT CAMPUSAI
            </span>

            <h2>
              Built around the
              <br />
              <span>student experience.</span>
            </h2>

            <p>
              CampusAI is designed specifically for modern
              university campuses. Instead of students searching
              through different departments and channels, everything
              starts from one simple platform.
            </p>

            <p>
              From reporting Wi-Fi, electricity, classroom,
              hostel, transport, or other campus issues to getting
              useful assistance, CampusAI brings it together.
            </p>

            <Link
              to="/register"
              className="landing-outline-btn"
            >
              Join CampusAI
              <ArrowRight size={17} />
            </Link>

          </div>


          <div className="landing-about-stats">

            <div className="landing-stat-card">
              <Users size={22} />
              <strong>1.2k+</strong>
              <span>Student users</span>
            </div>

            <div className="landing-stat-card">
              <Building2 size={22} />
              <strong>13+</strong>
              <span>Issue categories</span>
            </div>

            <div className="landing-stat-card">
              <BrainCircuit size={22} />
              <strong>AI</strong>
              <span>Smart classification</span>
            </div>

            <div className="landing-stat-card">
              <CheckCircle2 size={22} />
              <strong>24/7</strong>
              <span>Accessible platform</span>
            </div>

          </div>

        </section>


        {/* =========================================================
            CTA
        ========================================================= */}
        <section
          className="landing-cta"
          id="contact"
        >

          <div className="landing-cta-content">

            <span className="landing-section-label">
              READY TO GET STARTED?
            </span>

            <h2>
              Your campus.
              <br />
              <span>One smarter platform.</span>
            </h2>

            <p>
              Join CampusAI and experience a simpler way to
              connect with your university.
            </p>

            <Link
              to="/register"
              className="landing-primary-btn landing-cta-btn"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>

          </div>

        </section>

      </main>


      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="landing-footer">

        <div className="landing-footer-brand">

          <Link to="/" className="landing-brand">
            <span className="landing-brand-mark">
              C
            </span>

            <span className="landing-brand-text">
              Campus<span>AI</span>
            </span>
          </Link>

          <p>
            Smarter campus. Better experience.
          </p>

        </div>


        <div className="landing-footer-links">

          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login">Login</Link>

        </div>


        <div className="landing-footer-copy">
          © {new Date().getFullYear()} CampusAI. Built for SRMU.
        </div>

      </footer>


      {/* =========================================================
          CAMPUS VIDEO MODAL
      ========================================================= */}
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

              <strong>
                Explore Shri Ramswaroop Memorial University
              </strong>

              <span>
                A glimpse of the campus behind CampusAI.
              </span>

            </div>

          </div>

        </div>

      )}

      

    </div>
  );
}

export default Landing;
