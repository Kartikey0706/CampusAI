import { Check, Circle } from "lucide-react";

type StatusTimelineProps = {
  status?: string;
};

const stages = ["Submitted", "AI Analysis", "Under Review", "In Progress", "Resolved"];

function StatusTimeline({ status }: StatusTimelineProps) {
  const normalizedStatus = status === "Pending" ? "Under Review" : status || "Under Review";
  const currentIndex = Math.max(2, stages.indexOf(normalizedStatus));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="status-timeline-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="status-timeline-heading" className="font-semibold">Complaint timeline</h2>
          <p className="mt-1 text-sm text-slate-500">Current status: {normalizedStatus}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Live status</span>
      </div>
      <ol className="mt-6 grid gap-4 sm:grid-cols-5 sm:gap-2">
        {stages.map((stage, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          return (
            <li key={stage} className="relative flex items-center gap-3 sm:block sm:text-center">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 sm:mx-auto ${current ? "border-indigo-600 bg-indigo-600 text-white" : completed ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-white text-slate-300"}`}>
                {completed ? <Check size={16} /> : current ? <Circle size={10} fill="currentColor" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </div>
              <span className={`text-sm ${current ? "font-semibold text-indigo-700" : completed ? "font-medium text-slate-700" : "text-slate-400"}`}>{stage}</span>
              {index < stages.length - 1 && <span className={`hidden sm:block absolute left-1/2 top-4 h-0.5 w-full ${index < currentIndex ? "bg-emerald-300" : "bg-slate-200"}`} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default StatusTimeline;
