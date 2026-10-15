import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./landing.css";

// Same categories the backend classifier knows about.
const CATEGORIES = [
  "Wi-Fi",
  "Water",
  "Electricity",
  "Hostel",
  "Mess",
  "Classroom",
  "Lab",
  "Library",
  "Transport",
  "Fees",
  "Faculty",
  "Timetable",
];

// Same stages the complaint timeline uses in the app.
const STAGES = ["Submitted", "AI Analysis", "Under Review", "In Progress", "Resolved"];
const STAGES_REACHED = 3;

type Row = {
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Under Review" | "In Progress" | "Resolved";
};

// Made-up entries, labelled as such on the page.
const SAMPLE_ROWS: Row[] = [
  { title: "Wi-Fi dropping in Hostel B", category: "Wi-Fi", priority: "High", status: "In Progress" },
  { title: "Classroom projector not working", category: "Classroom", priority: "Medium", status: "Under Review" },
  { title: "Water supply interruption", category: "Water", priority: "High", status: "Under Review" },
  { title: "Library AC not cooling", category: "Library", priority: "Low", status: "Resolved" },
];

function statusClass(status: Row["status"]) {
  if (status === "In Progress") return "lp-st lp-st-progress";
  if (status === "Resolved") return "lp-st lp-st-done";
  return "lp-st";
}

function Landing() {
  return (
    <div className="lp">
      <div className="lp-wrap">
        {/* nav */}
        <header className="lp-nav">
          <Link to="/" className="lp-logo">
            <b>C</b>CampusAI
          </Link>
          <nav className="lp-nav-links" aria-label="Sections">
            <a href="#what">What it does</a>
            <a href="#admin">For admins</a>
            <a href="#about">About</a>
          </nav>
          <div className="lp-nav-end">
            <Link to="/login" className="lp-login">
              Log in
            </Link>
            <Link to="/register" className="lp-btn lp-btn-sm">
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        {/* hero */}
        <div className="lp-hero">
          <div>
            <p className="lp-eyebrow">For students of SRMU</p>
            <h1>Report a campus problem once. It goes to the right department.</h1>
            <p className="lp-lead">
              Write what happened in your own words. CampusAI suggests the
              category, urgency and department, and you can follow the status
              until it is resolved.
            </p>
            <div className="lp-actions">
              <Link to="/register" className="lp-btn">
                Report an issue <ArrowRight size={16} />
              </Link>
              <a className="lp-tlink" href="#what">
                See what it does
              </a>
            </div>
            <p className="lp-hero-note">
              Made for students of Shri Ramswaroop Memorial University. This is
              an academic prototype, not an official university system.
            </p>
          </div>

          <aside className="lp-card" aria-label="Example complaint">
            <p className="lp-tag">Example complaint</p>
            <h3>Water supply interruption</h3>
            <p className="lp-loc">Hostel Block A, ground floor</p>
            <dl className="lp-grid">
              <div>
                <dt>Category</dt>
                <dd>Water</dd>
              </div>
              <div>
                <dt>Sentiment</dt>
                <dd>Negative</dd>
              </div>
              <div>
                <dt>Urgency</dt>
                <dd className="lp-hot">High</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd className="lp-hot">High</dd>
              </div>
              <div className="lp-w">
                <dt>Department</dt>
                <dd>Maintenance Department</dd>
              </div>
            </dl>
            <ol className="lp-stages" aria-label="Status">
              {STAGES.map((s, i) => (
                <li key={s} className={i < STAGES_REACHED ? "lp-on" : ""}>
                  {s}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>

      {/* what it does */}
      <section id="what">
        <div className="lp-wrap lp-two">
          <div>
            <p className="lp-eyebrow">What it does</p>
            <h2 className="lp-h2">What happens after you submit a complaint.</h2>
            <p className="lp-sub">
              Three things, in this order. Nothing for you to fill in beyond
              the description.
            </p>
          </div>
          <ol className="lp-rows">
            <li>
              <span className="lp-n">01</span>
              <div>
                <h3>You describe it</h3>
                <p>
                  A title, a few lines and the location. There is no category
                  dropdown to guess at.
                </p>
              </div>
            </li>
            <li>
              <span className="lp-n">02</span>
              <div>
                <h3>It is analysed</h3>
                <p>
                  Category, sentiment, urgency, priority and department are
                  suggested from your text. This runs on Python and NLP code
                  inside the project and needs no external LLM API. If it
                  fails, the complaint is still saved with its values marked
                  pending.
                </p>
              </div>
            </li>
            <li>
              <span className="lp-n">03</span>
              <div>
                <h3>You follow it</h3>
                <p>
                  Open your complaint to see its status move from Under Review
                  to In Progress to Resolved, with similar complaints shown
                  next to it.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* admin */}
      <section className="lp-dark" id="admin">
        <div className="lp-wrap lp-two lp-admin-cols">
          <div>
            <p className="lp-eyebrow">For admins</p>
            <h2 className="lp-h2">Every complaint in one list, already sorted.</h2>
            <p className="lp-sub">
              Admins do not start from a blank inbox. Each complaint arrives
              with its analysis attached.
            </p>
            <ul className="lp-checks">
              <li>Search, and filter by status, category and priority</li>
              <li>Open any complaint with its AI analysis and similar complaints</li>
              <li>Update the status as work progresses</li>
              <li>Dashboard and analytics for the whole campus</li>
            </ul>
          </div>

          <div className="lp-panel" aria-label="Sample admin complaint list">
            <div className="lp-panel-head">
              <strong>Complaints</strong>
              <span>Sample data</span>
            </div>
            <div className="lp-filters">
              <span className="lp-on">All</span>
              <span>Under Review</span>
              <span>In Progress</span>
              <span>Resolved</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ROWS.map((r) => (
                  <tr key={r.title}>
                    <td>{r.title}</td>
                    <td>{r.category}</td>
                    <td className={r.priority === "High" ? "lp-hot" : ""}>{r.priority}</td>
                    <td>
                      <span className={statusClass(r.status)}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="lp-panel-foot">Illustration with made-up entries.</div>
          </div>
        </div>
      </section>

      {/* categories */}
      <section className="lp-cats">
        <div className="lp-wrap">
          <p className="lp-eyebrow">What you can report</p>
          <p className="lp-catline">
            {CATEGORIES.map((c) => (
              <span key={c}>{c}</span>
            ))}
            .
          </p>
          <p className="lp-muted">
            Anything else goes to General Administration, so nothing is dropped.
          </p>
        </div>
      </section>

      {/* about + cta */}
      <section className="lp-about" id="about">
        <div className="lp-wrap">
          <div className="lp-two lp-about-cols">
            <div>
              <p className="lp-eyebrow">About</p>
              <h2 className="lp-h2">Built by a student, for SRMU.</h2>
            </div>
            <p className="lp-sub lp-about-text">
              CampusAI is an academic project. Students sign in with their roll
              number, and complaints are stored in MongoDB Atlas. It is not an
              official university system.
            </p>
          </div>

          <div className="lp-cta">
            <div>
              <h2>Got something to report?</h2>
              <p>Create an account with your roll number and submit your first complaint.</p>
            </div>
            <div className="lp-actions">
              <Link to="/register" className="lp-btn">
                Create an account <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="lp-tlink">
                I already have one
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <Link to="/" className="lp-logo">
            <b>C</b>CampusAI
          </Link>
          <span>Academic prototype for SRMU, 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
