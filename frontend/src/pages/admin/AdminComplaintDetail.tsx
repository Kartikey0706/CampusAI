import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getAdminComplaint, updateComplaintStatus } from "../../api";
import { formatComplaintDate } from "../../utils/date";
import AIAnalysisPanel from "../../components/complaint/AIAnalysisPanel";
import SimilarComplaints from "../../components/complaint/SimilarComplaints";
import StatusTimeline from "../../components/complaint/StatusTimeline";
import { LoadingSkeleton } from "../../components/complaint/LoadingSkeleton";

type SimilarComplaint = {
  complaint_id: string;
  title: string;
  category?: string;
  department?: string;
  status?: string;
  similarity_percentage?: number;
};

type Complaint = {
  complaint_id: string;
  title: string;
  description: string;
  location: string;
  category?: string;
  sentiment?: string;
  urgency?: string;
  department?: string;
  priority?: string | number;
  status?: string;
  student_roll_no?: string;
  created_at?: string;
  updated_at?: string;
  similar_complaints?: SimilarComplaint[];
  reasons?: string[];
};

function AdminComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState("Under Review");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadComplaint() {
      if (!id) {
        setError("Complaint ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const data = await getAdminComplaint(id);
        setComplaint(data);
        setStatus(data.status === "Resolved" || data.status === "In Progress" ? data.status : "Under Review");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load complaint");
      } finally {
        setLoading(false);
      }
    }

    void loadComplaint();
  }, [id]);

  async function saveStatus() {
    if (!id) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const updated = await updateComplaintStatus(id, status);
      setComplaint(updated);
      setSuccess("Complaint status updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update complaint");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-6"><LoadingSkeleton lines={4} /></div>;
  if (error && !complaint) return <div className="mx-auto max-w-7xl"><Link to="/admin/complaints" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/> Back to complaints</Link><div role="alert" className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div></div>;
  if (!complaint) return null;

  return <div className="mx-auto max-w-7xl"><Link to="/admin/complaints" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/> Back to complaints</Link><div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold text-indigo-600">Complaint #{complaint.complaint_id.slice(0, 8)}</p><h1 className="mt-2 text-3xl font-bold">{complaint.title}</h1><p className="mt-2 text-sm text-slate-500">{complaint.student_roll_no ? `Student ${complaint.student_roll_no} • ` : "Student • "}{complaint.location} • {formatComplaintDate(complaint.created_at)}</p></div><span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">{complaint.status ?? "Under Review"}</span></div>{error && <div role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{success && <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}<div className="mt-8 space-y-6"><StatusTimeline status={complaint.status}/><div className="grid gap-6 lg:grid-cols-3"><section className="space-y-6 lg:col-span-2"><div className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Complaint</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{complaint.description}</p><p className="mt-5 text-sm text-slate-500">Location: <span className="font-semibold text-slate-700">{complaint.location}</span></p></div><AIAnalysisPanel title={complaint.title} description={complaint.description} category={complaint.category} sentiment={complaint.sentiment} urgency={complaint.urgency} department={complaint.department} priority={complaint.priority} status={complaint.status} reasons={complaint.reasons}/></section><aside className="h-fit space-y-6"><div className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Administrative action</h2><label className="mt-5 block text-sm font-medium">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"><option>Under Review</option><option>In Progress</option><option>Resolved</option></select></label><button type="button" onClick={() => void saveStatus()} disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"><Save size={17}/>{saving ? "Saving..." : "Save status"}</button></div><SimilarComplaints complaints={complaint.similar_complaints} basePath="/admin/complaints"/></aside></div></div></div>;
}

export default AdminComplaintDetail;
