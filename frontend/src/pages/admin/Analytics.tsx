import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, FileText, TrendingUp } from "lucide-react";
import { getAdminStats } from "../../api";

type Stats = {
  total: number;
  under_review: number;
  in_progress: number;
  resolved: number;
  high_priority: number;
  category_distribution: Record<string, number>;
};

function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setStats(await getAdminStats());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load analytics");
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  const categories = Object.entries(stats?.category_distribution ?? {});
  const maxCategoryCount = Math.max(...categories.map(([, count]) => count), 1);
  const cards = [[FileText, "Total complaints", stats?.total ?? 0], [Clock3, "Under Review", stats?.under_review ?? 0], [TrendingUp, "In Progress", stats?.in_progress ?? 0], [CheckCircle2, "Resolved", stats?.resolved ?? 0], [BarChart3, "High Priority", stats?.high_priority ?? 0]] as const;

  return <div className="mx-auto max-w-7xl"><div><h1 className="text-3xl font-bold">Analytics</h1><p className="mt-2 text-slate-500">Understand recurring campus issues and workload.</p></div>{error && <div role="alert" className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([Icon, label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon size={19} className="text-slate-400"/></div><p className="mt-3 text-3xl font-bold">{loading ? "..." : value}</p></div>)}</div><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-2"><BarChart3 size={19} className="text-indigo-600"/><h2 className="font-semibold">Complaints by category</h2></div>{!loading && categories.length === 0 ? <p className="mt-6 text-sm text-slate-500">No complaint data available yet.</p> : <div className="mt-6 space-y-5">{categories.map(([name, count]) => <div key={name}><div className="mb-2 flex justify-between text-sm"><span>{name}</span><span className="font-semibold">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${(count / maxCategoryCount) * 100}%` }}/></div></div>)}</div>}</div></div>;
}

export default Analytics;
