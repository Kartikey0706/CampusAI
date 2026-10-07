import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  FileText,
  ArrowRight,
} from "lucide-react";
import { getAllComplaints } from "../../api";
import { getAuthenticatedUserName } from "../../utils/authUser";
import { CardLoadingSkeleton, LoadingSkeleton } from "../../components/complaint/LoadingSkeleton";
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
    if (priority === "High" || priority === "Critical" || priority === 90 || priority === 70) {
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

    const inProgress = complaints.filter((complaint) => complaint.status === "In Progress").length;
    const resolved = complaints.filter(
      (complaint) =>
        complaint.status === "Resolved"
    ).length;

    return {
      total,
      pendingReview,
      inProgress,
      resolved,
    };
  }, [complaints]);

  const distributions = useMemo(() => {
    function countBy(getValue: (complaint: Complaint) => string | undefined) {
      return Object.entries(complaints.reduce<Record<string, number>>((counts, complaint) => {
        const value = getValue(complaint) || "Pending";
        counts[value] = (counts[value] || 0) + 1;
        return counts;
      }, {})).sort(([, a], [, b]) => b - a);
    }
    return {
      categories: countBy((complaint) => complaint.category),
      departments: countBy((complaint) => complaint.department),
      priorities: countBy((complaint) => String(complaint.priority || "Pending")),
    };
  }, [complaints]);

  const recentComplaints = complaints.slice(0, 5);

  const userName = getAuthenticatedUserName();

  function priorityClass(priority?: string | number) {
    if (priorityRank(priority) >= 3) {
      return "bg-red-50 text-red-600";
    }

    if (priorityRank(priority) === 2) {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          CampusAI Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Welcome back, {userName}
        </h1>

        <p className="mt-2 text-slate-500">
          Review AI-assisted insights and keep campus
          issues moving.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      {loading ? <div className="mt-8"><CardLoadingSkeleton /></div> : <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            FileText,
            "Total",
            stats.total,
          ],
          [
            Clock3,
            "Under Review",
            stats.pendingReview,
          ],
          [
            Clock3,
            "In Progress",
            stats.inProgress,
          ],
          [
            CheckCircle2,
            "Resolved",
            stats.resolved,
          ],
        ].map(([Icon, label, value]) => {
          const IconComponent =
            Icon as typeof FileText;

          return (
            <div
              key={label as string}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex justify-between">
                <p className="text-sm text-slate-500">
                  {label as string}
                </p>

                <IconComponent
                  size={19}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-3 text-3xl font-bold">
                {value as number}
              </p>
            </div>
          );
        })}
      </div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {[['Complaint Categories', distributions.categories], ['Department Distribution', distributions.departments], ['Priority Distribution', distributions.priorities]].map(([title, entries]) => <section key={title as string} className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">{title as string}</h2>{loading ? <div className="mt-4"><LoadingSkeleton lines={3}/></div> : entries.length === 0 ? <p className="mt-4 text-sm text-slate-500">No data available.</p> : <div className="mt-4 space-y-3">{(entries as [string, number][]).slice(0, 6).map(([label, count]) => <div key={label}><div className="flex justify-between gap-3 text-sm"><span className="truncate text-slate-600">{label}</span><span className="font-semibold text-slate-900">{count}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.max(8, (count / Math.max(1, complaints.length)) * 100)}%` }} /></div></div>)}</div>}</section>)}
      </div>

      {/* Recent complaints */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-semibold">
              Recent Complaints
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest issues received by CampusAI.
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading && (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading complaints...
          </div>
        )}

        {!loading &&
          !error &&
          recentComplaints.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              No complaints available yet.
            </div>
          )}

        {!loading &&
          recentComplaints.length > 0 && (
            <div className="divide-y divide-slate-100">
              {recentComplaints.map((complaint) => (
                <Link
                  to={`/admin/complaints/${complaint.complaint_id}`}
                  key={complaint.complaint_id}
                  className="flex flex-col gap-3 px-6 py-5 hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium">
                      {complaint.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {complaint.category ||
                        "Other"}{" "}
                      • {complaint.location}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {complaint.department ||
                        "General Administration"} <span aria-hidden="true">•</span> {formatComplaintDate(complaint.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                        complaint.priority
                      )}`}
                    >
                      Priority{" "}
                      {complaint.priority ?? "Pending"}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {complaint.status ||
                        "Pending"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

export default AdminDashboard;