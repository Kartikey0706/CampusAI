import { Sparkles } from "lucide-react";

type AIAnalysisPanelProps = {
  title: string;
  description: string;
  category?: string;
  sentiment?: string;
  urgency?: string;
  department?: string;
  priority?: string | number;
  status?: string;
  reasons?: string[];
};

const signalGroups: Record<string, string[]> = {
  Water: ["water", "pani", "paani", "pyaas", "tap", "nal", "supply"],
  "Wi-Fi": ["wifi", "wi-fi", "internet", "network", "router", "connection"],
  Electricity: ["electricity", "power", "light", "fan", "voltage"],
  Hostel: ["hostel", "room", "warden"],
  Faculty: ["faculty", "teacher", "professor", "lecturer", "attendance"],
  Mess: ["mess", "food", "meal", "canteen"],
  Library: ["library", "book", "reading room"],
};

function getDetectedSignals(category: string | undefined, text: string) {
  if (!category || !signalGroups[category]) return [];
  const normalized = text.toLowerCase();
  return signalGroups[category].filter((signal) => normalized.includes(signal));
}

function AIAnalysisPanel({ title, description, category, sentiment, urgency, department, priority, status, reasons }: AIAnalysisPanelProps) {
  const resolvedCategory = category ?? "Pending Analysis";
  const signals = getDetectedSignals(resolvedCategory, `${title}. ${description}`);
  const fields = [
    ["Category", resolvedCategory],
    ["Sentiment", sentiment ?? "Pending"],
    ["Urgency", urgency ?? "Pending"],
    ["Department", department ?? "Pending"],
    ["Priority", priority ?? "Pending"],
    ["Status", status ?? "Under Review"],
  ];

  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 sm:p-6" aria-labelledby="ai-analysis-heading">
      <div className="flex items-center gap-2">
        <Sparkles size={19} className="text-indigo-600" />
        <div>
          <h2 id="ai-analysis-heading" className="font-semibold text-indigo-900">AI Analysis</h2>
          <p className="text-xs text-indigo-700/70">Analysis returned by CampusAI</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([label, value]) => <div key={label} className="rounded-xl bg-white/75 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>)}
      </div>
      {(reasons?.length || signals.length > 0) && <div className="mt-5 rounded-xl bg-white/60 p-4"><h3 className="text-sm font-semibold text-slate-800">Detected signals</h3>{reasons?.length ? <ul className="mt-3 space-y-1 text-sm text-slate-600">{reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul> : <div className="mt-3 flex flex-wrap gap-2">{signals.map((signal) => <span key={signal} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">{signal}</span>)}</div>}</div>}
    </section>
  );
}

export default AIAnalysisPanel;
