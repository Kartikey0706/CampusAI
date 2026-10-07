import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  FileText,
  ArrowRight,
  AlertCircle,
  Building2,
  Tags,
  Activity,
  TrendingUp,
} from "lucide-react";
import { getAllComplaints } from "../../api";
import { getAuthenticatedUserName } from "../../utils/authUser";
import {
  CardLoadingSkeleton,
  LoadingSkeleton,
} from "../../components/complaint/LoadingSkeleton";
import { formatComplaintDate } from "../../utils/date";

type Complaint = {
  complaint_id: string;
  title: string;
  description: string;
  location: string;
  category?: string;
  department?: string;
  urgency?: string;
  priority?: string | number;
  status?: string;
  created_at?: string;
};

function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComplaints() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllComplaints();
        setComplaints(data.complaints || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  function priorityRank(priority?: string | number) {
    if (
      priority === "High" ||
      priority === "Critical" ||
      priority === 90 ||
      priority === 70
    ) {
      return 3;
    }

    if (priority === "Medium" || priority === 50) {
      return 2;
    }

    return 1;
  }

  const stats = useMemo(() => {
    const total = complaints.length;

    const pendingReview = complaints.filter(
      (complaint) =>
        complaint.status === "Pending" ||
        complaint.status === "Under Review"
    ).length;

    const inProgress = complaints.filter(
      (complaint) => complaint.status === "In Progress"
    ).length;

    const resolved = complaints.filter(
      (complaint) => complaint.status === "Resolved"
    ).length;

    return {
      total,
      pendingReview,
      inProgress,
      resolved,
    };
  }, [complaints]);

  const distributions = useMemo(() => {
    function countBy(
      getValue: (complaint: Complaint) => string | undefined
    ) {
      return Object.entries(
        complaints.reduce<Record<string, number>>((counts, complaint) => {
          const value = getValue(complaint) || "Pending";
          counts[value] = (counts[value] || 0) + 1;
          return counts;
        }, {})
      ).sort(([, a], [, b]) => b - a);
    }

    return {
      categories: countBy((complaint) => complaint.category),
      departments: countBy((complaint) => complaint.department),
      priorities: countBy((complaint) =>
        String(complaint.priority || "Pending")
      ),
    };
  }, [complaints]);

  const recentComplaints = complaints.slice(0, 5);
  const userName = getAuthenticatedUserName();

  function priorityClass(priority?: string | number) {
    if (priorityRank(priority) >= 3) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }

    if (priorityRank(priority) === 2) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-stone-100 text-stone-600 border-stone-200";
  }

  function statusClass(status?: string) {
    if (status === "Resolved") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "In Progress") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (status === "Under Review") {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }

    return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }

  return (
    <div className="mx-auto max-w-7xl pb-10">
      {/* ========================================================= */}
      {/* PAGE HEADER                                               */}
      {/* ========================================================= */}

      <div className="mb-8 flex flex-col gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
            <Activity size={14} className="text-emerald-600" />
            <span>Campus Operations</span>
            <span className="text-stone-300">/</span>
            <span>Dashboard</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Welcome back, {userName}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Review AI-assisted insights and keep campus issues moving.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start rounded-full border border-emerald-100 bg-emerald-50/70 px-4 py-2.5 shadow-sm sm:self-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>

          <span className="text-sm font-medium text-emerald-800">
            Admin Console
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ERROR                                                     */}
      {/* ========================================================= */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* OVERVIEW STATS                                            */}
      {/* ========================================================= */}

      {loading ? (
        <div className="mb-8">
          <CardLoadingSkeleton />
        </div>
      ) : (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
              Overview
            </p>

            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <TrendingUp size={13} />
              <span>Current campus activity</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: FileText,
                label: "Total complaints",
                value: stats.total,
                note: "All reported issues",
                iconBg: "bg-stone-100",
                iconText: "text-stone-600",
                border: "border-stone-200",
                number: "text-stone-900",
              },
              {
                icon: Clock3,
                label: "Under review",
                value: stats.pendingReview,
                note: "Awaiting attention",
                iconBg: "bg-sky-50",
                iconText: "text-sky-600",
                border: "border-sky-100",
                number: "text-sky-950",
              },
              {
                icon: Activity,
                label: "In progress",
                value: stats.inProgress,
                note: "Currently active",
                iconBg: "bg-amber-50",
                iconText: "text-amber-600",
                border: "border-amber-100",
                number: "text-amber-950",
              },
              {
                icon: CheckCircle2,
                label: "Resolved",
                value: stats.resolved,
                note: "Completed issues",
                iconBg: "bg-emerald-50",
                iconText: "text-emerald-600",
                border: "border-emerald-100",
                number: "text-emerald-950",
              },
            ].map(
              ({
                icon: Icon,
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
                      {value}
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
      )}

      {/* ========================================================= */}
      {/* DISTRIBUTIONS                                             */}
      {/* ========================================================= */}

      <section className="mb-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
            Issue breakdown
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* ===================================================== */}
          {/* CATEGORIES                                             */}
          {/* ===================================================== */}

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-stone-300 hover:shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Tags size={16} />
                  </div>

                  <h2 className="font-semibold text-stone-900">
                    Complaint Categories
                  </h2>
                </div>

                <p className="mt-2 text-xs text-stone-400">
                  Issues grouped by category
                </p>
              </div>

              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500">
                {distributions.categories.length}
              </span>
            </div>

            {loading ? (
              <div className="mt-5">
                <LoadingSkeleton lines={3} />
              </div>
            ) : distributions.categories.length === 0 ? (
              <p className="mt-6 text-sm text-stone-400">
                No data available.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {(distributions.categories as [string, number][])
                  .slice(0, 6)
                  .map(([label, count], index) => {
                    const percentage =
                      complaints.length > 0
                        ? Math.round((count / complaints.length) * 100)
                        : 0;

                    const categoryBarClasses = [
                      "bg-violet-500",
                      "bg-fuchsia-500",
                      "bg-indigo-500",
                      "bg-cyan-500",
                      "bg-emerald-500",
                      "bg-amber-500",
                    ];

                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm text-stone-600">
                            {label}
                          </span>

                          <span className="shrink-0 text-sm font-semibold text-stone-900">
                            {count}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                            <div
                              className={`h-full rounded-full transition-all ${
                                categoryBarClasses[index] ||
                                "bg-stone-500"
                              }`}
                              style={{
                                width: `${Math.max(8, percentage)}%`,
                              }}
                            />
                          </div>

                          <span className="w-8 text-right text-[11px] font-medium text-stone-400">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* ===================================================== */}
          {/* DEPARTMENTS                                            */}
          {/* ===================================================== */}

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-stone-300 hover:shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Building2 size={16} />
                  </div>

                  <h2 className="font-semibold text-stone-900">
                    Department Distribution
                  </h2>
                </div>

                <p className="mt-2 text-xs text-stone-400">
                  Issues routed across departments
                </p>
              </div>

              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500">
                {distributions.departments.length}
              </span>
            </div>

            {loading ? (
              <div className="mt-5">
                <LoadingSkeleton lines={3} />
              </div>
            ) : distributions.departments.length === 0 ? (
              <p className="mt-6 text-sm text-stone-400">
                No data available.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {(distributions.departments as [string, number][])
                  .slice(0, 6)
                  .map(([label, count], index) => {
                    const percentage =
                      complaints.length > 0
                        ? Math.round((count / complaints.length) * 100)
                        : 0;

                    const departmentBarClasses = [
                      "bg-amber-500",
                      "bg-orange-500",
                      "bg-emerald-500",
                      "bg-cyan-500",
                      "bg-rose-500",
                      "bg-stone-500",
                    ];

                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm text-stone-600">
                            {label}
                          </span>

                          <span className="shrink-0 text-sm font-semibold text-stone-900">
                            {count}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                            <div
                              className={`h-full rounded-full transition-all ${
                                departmentBarClasses[index] ||
                                "bg-stone-500"
                              }`}
                              style={{
                                width: `${Math.max(8, percentage)}%`,
                              }}
                            />
                          </div>

                          <span className="w-8 text-right text-[11px] font-medium text-stone-400">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* ===================================================== */}
          {/* PRIORITIES                                             */}
          {/* ===================================================== */}

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-stone-300 hover:shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <AlertCircle size={16} />
                  </div>

                  <h2 className="font-semibold text-stone-900">
                    Priority Distribution
                  </h2>
                </div>

                <p className="mt-2 text-xs text-stone-400">
                  Current issue priority levels
                </p>
              </div>

              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500">
                {distributions.priorities.length}
              </span>
            </div>

            {loading ? (
              <div className="mt-5">
                <LoadingSkeleton lines={3} />
              </div>
            ) : distributions.priorities.length === 0 ? (
              <p className="mt-6 text-sm text-stone-400">
                No data available.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {(distributions.priorities as [string, number][])
                  .slice(0, 6)
                  .map(([label, count]) => {
                    const rank = priorityRank(label);

                    const priorityStyles =
                      rank >= 3
                        ? {
                            dot: "bg-rose-500",
                            bg: "bg-rose-50/70",
                            border: "border-rose-100",
                            text: "text-rose-700",
                          }
                        : rank === 2
                          ? {
                              dot: "bg-amber-500",
                              bg: "bg-amber-50/70",
                              border: "border-amber-100",
                              text: "text-amber-700",
                            }
                          : {
                              dot: "bg-stone-400",
                              bg: "bg-stone-50",
                              border: "border-stone-100",
                              text: "text-stone-600",
                            };

                    return (
                      <div
                        key={label}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-3 ${priorityStyles.bg} ${priorityStyles.border}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${priorityStyles.dot}`}
                          />

                          <span
                            className={`text-sm font-medium ${priorityStyles.text}`}
                          >
                            {label}
                          </span>
                        </div>

                        <span className="text-sm font-semibold text-stone-900">
                          {count}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RECENT COMPLAINTS                                         */}
      {/* ========================================================= */}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Activity size={16} />
              </div>

              <h2 className="font-semibold text-stone-900">
                Recent Complaints
              </h2>
            </div>

            <p className="mt-2 text-sm text-stone-400">
              Latest issues received by CampusAI.
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="group inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-950 sm:self-auto"
          >
            View all
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {loading && (
          <div className="p-8 text-center text-sm text-stone-400">
            Loading complaints...
          </div>
        )}

        {!loading && !error && recentComplaints.length === 0 && (
          <div className="p-10 text-center">
            <FileText
              size={24}
              className="mx-auto text-stone-300"
            />

            <p className="mt-3 text-sm text-stone-500">
              No complaints available yet.
            </p>
          </div>
        )}

        {!loading && recentComplaints.length > 0 && (
          <div className="divide-y divide-stone-100">
            {recentComplaints.map((complaint) => (
              <Link
                to={`/admin/complaints/${complaint.complaint_id}`}
                key={complaint.complaint_id}
                className="group block px-5 py-5 transition hover:bg-stone-50 sm:px-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                        <FileText size={15} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-stone-900">
                          {complaint.title}
                        </h3>

                        <p className="mt-1 text-sm text-stone-500">
                          {complaint.category || "Other"}
                          {" • "}
                          {complaint.location}
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          {complaint.department ||
                            "General Administration"}
                          {" • "}
                          {formatComplaintDate(
                            complaint.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 pl-12 lg:pl-0">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${priorityClass(
                        complaint.priority
                      )}`}
                    >
                      Priority {complaint.priority ?? "Pending"}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass(
                        complaint.status
                      )}`}
                    >
                      {complaint.status || "Pending"}
                    </span>
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

export default AdminDashboard;