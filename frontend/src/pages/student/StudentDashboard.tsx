import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, FileText, Plus } from "lucide-react";
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
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    void loadComplaints();
  }, []);

  const stats = useMemo(() => ({
    total: complaints.length,
    inProgress: complaints.filter((complaint) => complaint.status === "In Progress").length,
    resolved: complaints.filter((complaint) => complaint.status === "Resolved").length,
  }), [complaints]);

  function priorityClass(priority?: string | number) {
    return priority === "High" || priority === "Critical" || priority === 90 || priority === 70
      ? "bg-red-50 text-red-600"
      : priority === "Medium" || priority === 50
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";
  }

  function statusClass(status?: string) {
    return status === "Resolved"
      ? "bg-emerald-50 text-emerald-700"
      : status === "In Progress"
        ? "bg-indigo-50 text-indigo-700"
        : "bg-amber-50 text-amber-700";
  }

  const statCards = [{ Icon: FileText, label: "Total Complaints", value: stats.total }, { Icon: Clock3, label: "In Progress", value: stats.inProgress }, { Icon: CheckCircle2, label: "Resolved", value: stats.resolved }];

  const userName = getAuthenticatedUserName();

  return <div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-indigo-600">SRMU Campus Support</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome back, {userName}</h1><p className="mt-2 text-slate-500">Have a campus issue? Report it and track its resolution.</p></div><Link to="/student/report" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={18}/> Report an Issue</Link></div>{error && <div role="alert" className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<div className="mt-8 grid gap-4 sm:grid-cols-3">{statCards.map(({ Icon, label, value })=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon size={19} className="text-slate-400"/></div><p className="mt-3 text-3xl font-bold">{loading ? "..." : value}</p></div>)}</div><div className="mt-8 rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h2 className="font-semibold">Recent Complaints</h2><p className="mt-1 text-sm text-slate-500">Track your latest campus issues.</p></div><Link to="/student/complaints" className="flex items-center gap-1 text-sm font-semibold text-indigo-600">View all <ArrowRight size={16}/></Link></div>{loading ? <div className="p-8 text-center text-sm text-slate-500">Loading complaints...</div> : complaints.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No complaints submitted yet.</div> : <div className="divide-y divide-slate-100">{complaints.slice(0, 3).map((complaint) => <Link to={`/student/complaints/${complaint.complaint_id}`} key={complaint.complaint_id} className="flex flex-col gap-3 px-6 py-5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-medium">{complaint.title}</h3><p className="mt-1 text-sm text-slate-500">{complaint.category ?? "Pending Analysis"} • {complaint.location}</p></div><div className="flex gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(complaint.priority)}`}>{complaint.priority ?? "Pending"}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(complaint.status)}`}>{complaint.status ?? "Under Review"}</span></div></Link>)}</div>}</div></div>;
}

export default StudentDashboard;
