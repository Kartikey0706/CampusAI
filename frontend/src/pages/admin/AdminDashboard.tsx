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
      return "bg-red-50 text-red-700 border-red-100";
    }

    if (priorityRank(priority) === 2) {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }

    return "bg-stone-100 text-stone-600 border-stone-200";
  }

  function statusClass(status?: string) {
    if (status === "Resolved") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (status === "In Progress") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }

    if (status === "Under Review") {
      return "bg-stone-100 text-stone-700 border-stone-200";
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
            <Activity size={14} />
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

        <div className="flex items-center gap-3 self-start rounded-full border border-stone-200 bg-white px-4 py-2.5 shadow-sm sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-stone-700">
            Admin Console
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ERROR                                                     */}
      {/* ========================================================= */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

            <span className="text-xs text-stone-400">
              Current campus activity
            </span>
          </div>

          <div className="grid overflow-hidden rounded-2xl border border-stone-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: FileText,
                label: "Total complaints",
                value: stats.total,
                note: "All reported issues",
              },
              {
                icon: Clock3,
                label: "Under review",
                value: stats.pendingReview,
                note: "Awaiting attention",
              },
              {
                icon: Activity,
                label: "In progress",
                value: stats.inProgress,
                note: "Currently active",
              },
              {
                icon: CheckCircle2,
                label: "Resolved",
                value: stats.resolved,
                note: "Completed issues",
              },
            ].map(({ icon: Icon, label, value, note }, index) => (
              <div
                key={label}
                className={`group px-5 py-5 transition hover:bg-stone-50 ${
                  index !== 3 ? "border-b sm:border-r sm:border-b-0 xl:border-b-0" : ""
                } ${
                  index === 1 ? "xl:border-r" : ""
                } ${
                  index === 2 ? "sm:border-r-0 xl:border-r" : ""
                } border-stone-200`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    {label}
                  </span>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-500 transition group-hover:bg-stone-200">
                    <Icon size={16} />
                  </div>
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <span className="text-3xl font-semibold tracking-tight text-stone-900">
                    {value}
                  </span>

                  <span className="mb-1 text-xs text-stone-400">
                    {note}
                  </span>
                </div>
              </div>
            ))}
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
          {/* Categories */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Tags size={17} className="text-stone-500" />
                  <h2 className="font-semibold text-stone-900">
                    Complaint Categories
                  </h2>
                </div>

                <p className="mt-1 text-xs text-stone-400">
                  Issues grouped by category
                </p>
              </div>

              <span className="text-xs font-medium text-stone-400">
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
                  .map(([label, count]) => {
                    const percentage =
                      complaints.length > 0
                        ? Math.round((count / complaints.length) * 100)
                        : 0;

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
                              className="h-full rounded-full bg-stone-700 transition-all"
                              style={{
                                width: `${Math.max(8, percentage)}%`,
                              }}
                            />
                          </div>

                          <span className="w-8 text-right text-[11px] text-stone-400">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Departments */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 size={17} className="text-stone-500" />
                  <h2 className="font-semibold text-stone-900">
                    Department Distribution
                  </h2>
                </div>

                <p className="mt-1 text-xs text-stone-400">
                  Issues routed across departments
                </p>
              </div>

              <span className="text-xs font-medium text-stone-400">
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
                  .map(([label, count]) => {
                    const percentage =
                      complaints.length > 0
                        ? Math.round((count / complaints.length) * 100)
                        : 0;

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
                              className="h-full rounded-full bg-stone-500 transition-all"
                              style={{
                                width: `${Math.max(8, percentage)}%`,
                              }}
                            />
                          </div>

                          <span className="w-8 text-right text-[11px] text-stone-400">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Priorities */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={17} className="text-stone-500" />
                  <h2 className="font-semibold text-stone-900">
                    Priority Distribution
                  </h2>
                </div>

                <p className="mt-1 text-xs text-stone-400">
                  Current issue priority levels
                </p>
              </div>

              <span className="text-xs font-medium text-stone-400">
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

                    const dotClass =
                      rank >= 3
                        ? "bg-red-500"
                        : rank === 2
                          ? "bg-amber-500"
                          : "bg-stone-400";

                    return (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
                          />

                          <span className="text-sm text-stone-600">
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

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={17} className="text-stone-500" />

              <h2 className="font-semibold text-stone-900">
                Recent Complaints
              </h2>
            </div>

            <p className="mt-1 text-sm text-stone-400">
              Latest issues received by CampusAI.
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 transition hover:text-stone-950"
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

        {!loading &&
          !error &&
          recentComplaints.length === 0 && (
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
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 transition group-hover:bg-stone-200">
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

                  <div className="flex shrink-0 flex-wrap gap-2 pl-11 lg:pl-0">
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