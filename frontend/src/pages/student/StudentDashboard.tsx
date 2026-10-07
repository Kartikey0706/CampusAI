import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Sparkles,
  AlertCircle,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMyComplaints } from "../../api";
import { getAuthenticatedUserName } from "../../utils/authUser";

type Complaint = {
  complaint_id: string;
  title: string;
  location: string;
  priority?: string | number;
  status?: string;
  category?: string;
};

function StudentDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComplaints() {
      try {
        const data = await getMyComplaints();
        setComplaints(data.complaints ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadComplaints();
  }, []);

  const stats = useMemo(
    () => ({
      total: complaints.length,
      inProgress: complaints.filter(
        (complaint) => complaint.status === "In Progress"
      ).length,
      resolved: complaints.filter(
        (complaint) => complaint.status === "Resolved"
      ).length,
      underReview: complaints.filter(
        (complaint) =>
          complaint.status === "Under Review" ||
          complaint.status === "Pending"
      ).length,
    }),
    [complaints]
  );

  function priorityClass(priority?: string | number) {
    if (
      priority === "High" ||
      priority === "Critical" ||
      priority === 90 ||
      priority === 70
    ) {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }

    if (priority === "Medium" || priority === 50) {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-stone-200 bg-stone-100 text-stone-600";
  }

  function statusClass(status?: string) {
    if (status === "Resolved") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "In Progress") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-sky-200 bg-stone-50 text-sky-700";
  }

  const userName = getAuthenticatedUserName();

  const statCards = [
    {
      Icon: FileText,
      label: "Total Complaints",
      value: stats.total,
      note: "All your reports",
      iconBg: "bg-stone-100",
      iconText: "text-stone-600",
      border: "border-stone-200",
      number: "text-stone-900",
    },
    {
      Icon: Clock3,
      label: "Under Review",
      value: stats.underReview,
      note: "Awaiting attention",
      iconBg: "bg-stone-100",
      iconText: "text-stone-600",
      border: "border-stone-200",
      number: "text-stone-900",
    },
    {
      Icon: Clock3,
      label: "In Progress",
      value: stats.inProgress,
      note: "Being handled",
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
      border: "border-amber-100",
      number: "text-amber-950",
    },
    {
      Icon: CheckCircle2,
      label: "Resolved",
      value: stats.resolved,
      note: "Successfully closed",
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      border: "border-emerald-100",
      number: "text-emerald-950",
    },
  ];

  const recentComplaints = complaints.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl pb-10">
      {/* ========================================================= */}
      {/* WELCOME HEADER                                            */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="relative p-6 sm:p-8 lg:p-9">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <Sparkles size={14} />
              SRMU Campus Support
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Welcome back, {userName}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
              Report campus issues, follow their progress, and stay updated
              until they are resolved.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/student/report"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-stone-800"
              >
                <Plus size={18} />
                Report an Issue
              </Link>

              <Link
                to="/student/complaints"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                View My Complaints
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Decorative dashboard indicator */}
          <div className="absolute -right-16 -top-16 hidden h-52 w-52 rounded-full border-[28px] border-emerald-50 lg:block" />
          <div className="absolute right-10 top-10 hidden h-24 w-24 rounded-full border-[12px] border-amber-50 lg:block" />
        </div>
      </section>

      {/* ========================================================= */}
      {/* ERROR                                                     */}
      {/* ========================================================= */}

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* STATS                                                      */}
      {/* ========================================================= */}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
            Your Activity
          </p>

          <span className="text-xs text-stone-400">
            Complaint overview
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(
            ({
              Icon,
              label,
              value,
              note,
              iconBg,
              iconText,
              border,
              number,
            }) => (
              <div
                key={label}
                className={`group rounded-2xl border ${border} bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    {label}
                  </span>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconText} transition group-hover:scale-105`}
                  >
                    <Icon size={17} />
                  </div>
                </div>

                <div className="mt-5 flex items-end gap-3">
                  <span
                    className={`text-3xl font-semibold tracking-tight ${number}`}
                  >
                    {loading ? "..." : value}
                  </span>

                  <span className="mb-1 text-xs text-stone-400">
                    {note}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* QUICK ACTION + CAMPUS AI                                  */}
      {/* ========================================================= */}

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Report CTA */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 p-6 text-white shadow-sm sm:p-7">
          <div className="relative z-10 max-w-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
              <Plus size={20} />
            </div>

            <h2 className="text-xl font-semibold">
              Have an issue on campus?
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-stone-300">
              Tell CampusAI what happened. Your complaint will be analyzed
              and routed to the appropriate department.
            </p>

            <Link
              to="/student/report"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold !text-stone-950 transition hover:bg-stone-100"
            >
              Report a new issue
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="absolute -right-12 -bottom-24 h-56 w-56 rounded-full border-[34px] border-white/5" />
          <div className="absolute right-16 top-8 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl" />
        </div>

        {/* AI insight */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                CampusAI
              </p>

              <h2 className="font-semibold text-emerald-950">
                Smart campus support
              </h2>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-emerald-900/70">
            Your complaint is analyzed for category, urgency, and department
            routing so it reaches the right team faster.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={15} />
            AI-assisted routing enabled
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RECENT COMPLAINTS                                         */}
      {/* ========================================================= */}

      <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                <FileText size={16} />
              </div>

              <h2 className="font-semibold text-stone-900">
                Recent Complaints
              </h2>
            </div>

            <p className="mt-2 text-sm text-stone-400">
              Track the latest campus issues you have reported.
            </p>
          </div>

          <Link
            to="/student/complaints"
            className="group inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-950 sm:self-auto"
          >
            View all
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-stone-400">
            Loading your complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={23} />
            </div>

            <h3 className="mt-4 font-semibold text-stone-900">
              You're all clear!
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">
              No campus issues have been reported yet. If you notice
              something, you can report it here.
            </p>

            <Link
              to="/student/report"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              <Plus size={16} />
              Report your first issue
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentComplaints.map((complaint) => (
              <Link
                to={`/student/complaints/${complaint.complaint_id}`}
                key={complaint.complaint_id}
                className="group block px-5 py-5 transition hover:bg-stone-50 sm:px-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                        <FileText size={16} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-stone-900">
                          {complaint.title}
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-500">
                          <span>
                            {complaint.category ?? "Pending Analysis"}
                          </span>

                          <span className="text-stone-300">•</span>

                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} />
                            {complaint.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 pl-13 lg:justify-end lg:pl-0">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${priorityClass(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority ?? "Pending"}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status ?? "Under Review"}
                      </span>
                    </div>

                    <ChevronRight
                      size={17}
                      className="text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-stone-600"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;

