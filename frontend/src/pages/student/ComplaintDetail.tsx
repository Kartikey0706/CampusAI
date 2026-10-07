import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getComplaint } from "../../api";
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
  created_at?: string;
  similar_complaints?: SimilarComplaint[];
  reasons?: string[];
};

function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComplaint() {
      if (!id) {
        setError("Complaint ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const data = await getComplaint(id);
        setComplaint(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load complaint");
      } finally {
        setLoading(false);
      }
    }

    void loadComplaint();
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6"><LoadingSkeleton lines={4} /></div>;
  }

  if (error || !complaint) {
    return <div className="mx-auto max-w-6xl"><Link to="/student/complaints" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/> Back to complaints</Link><div role="alert" className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error || "Complaint not found"}</div></div>;
  }

  return <div className="mx-auto max-w-6xl"><Link to="/student/complaints" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/> Back to complaints</Link><div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Complaint #{complaint.complaint_id.slice(0, 8)}</p><h1 className="mt-2 text-3xl font-bold">{complaint.title}</h1><p className="mt-2 text-sm text-slate-500">Submitted {formatComplaintDate(complaint.created_at)} • {complaint.location}</p></div><span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">{complaint.status ?? "Under Review"}</span></div><div className="mt-8 space-y-6"><StatusTimeline status={complaint.status}/><div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Issue description</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{complaint.description}</p><p className="mt-5 text-sm text-slate-500">Location: <span className="font-semibold text-slate-700">{complaint.location}</span></p></section><AIAnalysisPanel title={complaint.title} description={complaint.description} category={complaint.category} sentiment={complaint.sentiment} urgency={complaint.urgency} department={complaint.department} priority={complaint.priority} status={complaint.status} reasons={complaint.reasons}/></div><aside className="h-fit"><SimilarComplaints complaints={complaint.similar_complaints} basePath="/student/complaints"/></aside></div></div></div>;
}

export default ComplaintDetail;
