import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";

function Landing() {
  const navigate = useNavigate();

  const handlePageClick = () => {
    navigate("/register");
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-white"
      onClick={handlePageClick}
    >
      {/* ============================================================
          NAVBAR
      ============================================================ */}
      <header
        className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6"
        onClick={(event) => event.stopPropagation()}
      >
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="CampusAI home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} />
          </div>

          <span className="text-xl font-bold tracking-tight">
            Campus<span className="text-indigo-400">AI</span>
          </span>
        </Link>

        <Link
          to="/login"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-white/25 hover:bg-white/10"
        >
          Sign in
        </Link>
      </header>

      <main>
        {/* ============================================================
            HERO
        ============================================================ */}
        <section className="relative overflow-hidden">
          {/* Background glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28">
            {/* Left side */}
            <div>
              <div className="flex w-fit items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold text-indigo-300">
                <BrainCircuit size={15} />
                AI-assisted campus support
              </div>

              <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]">
                Report. Understand.
                <br />
                <span className="text-indigo-400">
                  Prioritize. Resolve.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
                CampusAI helps students report campus issues while giving
                administrators structured insights to understand, prioritize
                and route complaints.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-semibold shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>

                <div className="flex items-center px-1 text-sm text-slate-500">
                  Report issues. Track progress. Stay informed.
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
                <span>AI-assisted analysis</span>
                <span>Real-time tracking</span>
                <span>Secure access</span>
              </div>
            </div>

            {/* Right side — product preview */}
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-indigo-500/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/90 shadow-2xl shadow-black/40">
                {/* Preview header */}
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                      <Sparkles size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">CampusAI</p>
                      <p className="text-xs text-slate-500">
                        Complaint Analysis
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    AI Ready
                  </span>
                </div>

                {/* Complaint */}
                <div className="p-5">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Wifi size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Wi-Fi unavailable
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Hostel Block A · Reported recently
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      “Wi-Fi has not been working in Hostel Block A since
                      yesterday.”
                    </p>
                  </div>

                  {/* AI Analysis */}
                  <div className="mt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <BrainCircuit size={16} className="text-indigo-400" />
                      <span className="text-sm font-semibold">
                        AI Analysis
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["Category", "Wi-Fi"],
                        ["Department", "IT / Network"],
                        ["Sentiment", "Negative"],
                        ["Urgency", "Medium"],
                        ["Priority", "Medium"],
                        ["Status", "Under Review"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-white/10 bg-white/[0.025] p-3"
                        >
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            {label}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-200">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom status */}
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-400/10 bg-indigo-400/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock3 size={15} className="text-indigo-400" />
                      <span className="text-xs text-slate-400">
                        Routed for review
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-indigo-300">
                      IT / Network
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            CAPABILITY STRIP
        ============================================================ */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-6 sm:grid-cols-3">
            {[
              ["AI-assisted analysis", "Understand complaints automatically"],
              ["Smart prioritization", "Surface issues that need attention"],
              ["Complaint tracking", "Follow progress until resolution"],
            ].map(([title, text]) => (
              <div key={title} className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="shrink-0 text-indigo-400"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            FEATURES
        ============================================================ */}
        <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Built for campus operations
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From a complaint to a clear resolution path.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              CampusAI turns unstructured student complaints into actionable
              information for the people responsible for resolving them.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {/* AI Analysis */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-indigo-400/20 hover:bg-white/[0.055]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <BrainCircuit size={22} />
              </div>

              <h3 className="mt-5 font-semibold">AI Analysis</h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Analyze complaint category, sentiment, urgency and other
                signals to structure incoming issues.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Category", "Sentiment", "Urgency"].map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-medium text-slate-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Priority & Routing */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-indigo-400/20 hover:bg-white/[0.055]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock3 size={22} />
              </div>

              <h3 className="mt-5 font-semibold">Priority & Routing</h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Surface important issues and identify the department best
                suited to handle them.
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Recommended department
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-300">
                    IT / Network
                  </span>
                </div>
              </div>
            </div>

            {/* Accountability */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-indigo-400/20 hover:bg-white/[0.055]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <ShieldCheck size={22} />
              </div>

              <h3 className="mt-5 font-semibold">Accountability</h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Track complaint status and keep students informed throughout
                the resolution process.
              </p>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  Under Review
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  In Progress
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  Resolved
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            FINAL CTA
        ============================================================ */}
        <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-400/15 bg-indigo-500/[0.07] px-6 py-12 text-center sm:px-10">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative">
              <Sparkles
                size={22}
                className="mx-auto text-indigo-400"
              />

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Ready to make campus support smarter?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Create your account and start reporting campus issues through
                CampusAI.
              </p>

              <Link
                to="/register"
                onClick={(event) => event.stopPropagation()}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
              >
                Get Started
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-semibold text-slate-300">CampusAI</span>
            <span className="mx-2">•</span>
            AI-powered campus complaint management
          </div>

          <div>© 2026 CampusAI</div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
