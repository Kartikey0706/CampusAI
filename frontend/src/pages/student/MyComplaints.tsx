import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { getMyComplaints } from "../../api";
import { formatComplaintDate } from "../../utils/date";
import { LoadingSkeleton } from "../../components/complaint/LoadingSkeleton";

type Complaint = {
	complaint_id: string;
	title: string;
	location: string;
	status: string;
	category?: string;
	priority?: string;
	created_at: string;
};

type ComplaintFilter = "All" | "Under Review" | "In Progress" | "Resolved";

function MyComplaints() {
	const [complaints, setComplaints] = useState<Complaint[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState<ComplaintFilter>("All");

	useEffect(() => {
		async function loadComplaints() {
			try {
				const data = await getMyComplaints();
				setComplaints(data.complaints ?? []);
			} catch (loadError) {
				setError(loadError instanceof Error ? loadError.message : "Unable to load complaints");
			} finally {
				setIsLoading(false);
			}
		}

		void loadComplaints();
	}, []);

	const filteredComplaints = useMemo(() => filter === "All" ? complaints : complaints.filter((complaint) => complaint.status === filter), [complaints, filter]);
	const filters: ComplaintFilter[] = ["All", "Under Review", "In Progress", "Resolved"];

	return <div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold">My Complaints</h1><p className="mt-2 text-slate-500">View and track issues you have reported.</p></div><Link to="/student/report" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Report Issue</Link></div><div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><SlidersHorizontal size={16}/> Filter status</div><div className="flex flex-wrap gap-2" role="group" aria-label="Filter complaints by status">{filters.map((option) => <button key={option} type="button" onClick={() => setFilter(option)} aria-pressed={filter === option} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === option ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}>{option}</button>)}</div></div>{isLoading ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><LoadingSkeleton lines={4}/></div> : error ? <div role="alert" className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">{error}<button type="button" onClick={() => window.location.reload()} className="ml-3 font-semibold underline">Retry</button></div> : filteredComplaints.length === 0 ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-10 text-center"><h2 className="font-semibold">No complaints found</h2><p className="mt-2 text-sm text-slate-500">{filter === "All" ? "Your submitted complaints will appear here." : `No ${filter.toLowerCase()} complaints found.`}</p></div> : <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="divide-y divide-slate-100">{filteredComplaints.map((complaint) => <Link key={complaint.complaint_id} to={`/student/complaints/${complaint.complaint_id}`} className="group flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{complaint.title}</h2><p className="mt-2 text-sm text-slate-500">{complaint.category ?? "Pending Analysis"} <span aria-hidden="true">•</span> {complaint.location}</p><p className="mt-1 text-xs text-slate-400">{formatComplaintDate(complaint.created_at)}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{complaint.priority ?? "Pending"}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{complaint.status}</span><span className="sr-only">View details</span><ChevronRight size={18} className="ml-1 text-slate-400 transition group-hover:translate-x-0.5"/></div></Link>)}</div></div>}</div>;
}

export default MyComplaints;
