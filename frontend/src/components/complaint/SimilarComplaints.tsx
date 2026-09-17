import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

type SimilarComplaint = {
  complaint_id: string;
  title: string;
  category?: string;
  department?: string;
  status?: string;
  similarity_percentage?: number;
};

type SimilarComplaintsProps = {
  complaints?: SimilarComplaint[];
  basePath: string;
};

function SimilarComplaints({ complaints, basePath }: SimilarComplaintsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="similar-complaints-heading">
      <div className="flex items-center justify-between gap-3">
        <div><h2 id="similar-complaints-heading" className="font-semibold">Similar complaints</h2><p className="mt-1 text-sm text-slate-500">Related issues found in existing reports.</p></div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{complaints?.length ?? 0}</span>
      </div>
      {complaints?.length ? <div className="mt-4 space-y-3">{complaints.map((similar) => <Link key={similar.complaint_id} to={`${basePath}/${similar.complaint_id}`} className="block rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-800">{similar.title}</p><ArrowUpRight size={16} className="shrink-0 text-slate-400" /></div><p className="mt-2 text-xs text-slate-500">{similar.category ?? "Pending Analysis"} <span aria-hidden="true">•</span> {similar.department ?? "Pending"}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{similar.status ?? "Under Review"}</span><span className="text-xs font-semibold text-indigo-700">{similar.similarity_percentage ?? 0}% similar</span></div></Link>)}</div> : <p className="mt-4 text-sm leading-6 text-slate-500">No similar complaints found.</p>}
    </section>
  );
}

export default SimilarComplaints;
