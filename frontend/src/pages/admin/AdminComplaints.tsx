import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { getAllComplaints } from "../../api";
import { formatComplaintDate } from "../../utils/date";
import { LoadingSkeleton } from "../../components/complaint/LoadingSkeleton";

type Complaint = {
  complaint_id: string;
  title: string;
  description: string;
  location: string;
  category?: string;
  department?: string;
  student_roll_no?: string;
  priority?: string | number;
  status?: string;
  created_at?: string;
};

function priorityRank(priority?: string | number) {
  if (priority === "High" || priority === "Critical" || priority === 90 || priority === 70) return 3;
  if (priority === "Medium" || priority === 50) return 2;
  return 1;
}

function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComplaints() {
      try {
        const data = await getAllComplaints();
        setComplaints(data.complaints ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load complaints");
      } finally {
        setLoading(false);
      }
    }

    void loadComplaints();
  }, []);

  const categories = useMemo(() => [...new Set(complaints.map((complaint) => complaint.category).filter(Boolean))], [complaints]);
  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      const searchable = [complaint.complaint_id, complaint.title, complaint.description, complaint.location, complaint.student_roll_no, complaint.category, complaint.department, complaint.status].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus = !status || complaint.status === status;
      const matchesCategory = !category || complaint.category === category;
      const matchesDepartment = !department || complaint.department === department;
      const matchesPriority = !priority || (priority === "High" ? priorityRank(complaint.priority) === 3 : priority === "Medium" ? priorityRank(complaint.priority) === 2 : priorityRank(complaint.priority) === 1);
      return matchesSearch && matchesStatus && matchesCategory && matchesDepartment && matchesPriority;
    });
  }, [complaints, search, status, category, department, priority]);

  const departments = useMemo(() => [...new Set(complaints.map((complaint) => complaint.department).filter(Boolean))], [complaints]);
  function clearFilters() {
    setSearch("");
    setStatus("");
    setCategory("");
    setDepartment("");
    setPriority("");
  }

  function priorityClass(value?: string | number) {
    return priorityRank(value) === 3 ? "bg-red-50 text-red-600" : priorityRank(value) === 2 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  }

  function statusClass(value?: string) {
    return value === "Resolved" ? "bg-emerald-50 text-emerald-600" : value === "In Progress" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-700";
  }

  return <div className="mx-auto max-w-7xl"><div><h1 className="text-3xl font-bold">Complaints</h1><p className="mt-2 text-slate-500">Review, assign and update campus complaints.</p></div><div className="mt-7 flex flex-col gap-3"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4"><Search size={18} className="text-slate-400"/><input aria-label="Search complaints" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, ID, roll number, category..." className="w-full py-3 text-sm outline-none"/></div><div className="flex flex-wrap items-center gap-2"><SlidersHorizontal size={17} className="text-slate-400"/><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All statuses</option><option>Under Review</option><option>In Progress</option><option>Resolved</option></select><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by department" value={department} onChange={(event) => setDepartment(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><button type="button" onClick={clearFilters} className="rounded-xl px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Clear filters</button></div></div>{error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button type="button" onClick={() => window.location.reload()} className="ml-3 font-semibold underline">Retry</button></div>}{loading ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><LoadingSkeleton lines={5}/></div> : !error && filteredComplaints.length === 0 ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-semibold">No complaints found</h2><p className="mt-1 text-sm text-slate-500">Try changing the search or filters.</p></div> : <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="divide-y divide-slate-100">{filteredComplaints.map((complaint) => <Link to={`/admin/complaints/${complaint.complaint_id}`} key={complaint.complaint_id} className="block p-5 hover:bg-slate-50"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><p className="text-xs font-semibold text-indigo-600">#{complaint.complaint_id.slice(0, 8)}</p><h2 className="mt-1 font-semibold">{complaint.title}</h2><p className="mt-1 line-clamp-2 text-sm text-slate-500">{complaint.description}</p><p className="mt-2 text-xs text-slate-400">{complaint.category ?? "Pending Analysis"} • {complaint.location} • {complaint.department ?? "Pending"} • {formatComplaintDate(complaint.created_at)}</p></div><div className="flex shrink-0 flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(complaint.priority)}`}>Priority {complaint.priority ?? "Pending"}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(complaint.status)}`}>{complaint.status ?? "Under Review"}</span></div></div></Link>)}</div></div>}</div>;
}

export default AdminComplaints;
