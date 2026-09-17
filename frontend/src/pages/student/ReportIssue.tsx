import { useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, FileUp, Send, Sparkles, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createComplaint } from "../../api";

function ReportIssue() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [location, setLocation] = useState("");
	const [customLocation, setCustomLocation] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const ref = useRef<HTMLInputElement>(null);
	const nav = useNavigate();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (location === "Other" && !customLocation.trim()) {
			setError("Please enter a custom location when selecting Other.");
			return;
		}

		setIsSubmitting(true);

		try {
			const complaint = await createComplaint({
				title,
				description,
				location: location === "Other" ? "Other" : location,
				custom_location: location === "Other" ? customLocation.trim() : undefined,
			});
			setSubmittedComplaintId(complaint.complaint_id);
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : "Complaint submission failed");
		} finally {
			setIsSubmitting(false);
		}
	}

	if (submittedComplaintId) {
		return <div className="mx-auto max-w-2xl py-10"><div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={28}/></div><h1 className="mt-5 text-2xl font-bold">Complaint submitted</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Your complaint has been recorded. CampusAI will prepare an analysis for administrative review.</p><button onClick={() => nav(`/student/complaints/${submittedComplaintId}`)} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">View complaint</button></div></div>;
	}

	return <div className="mx-auto max-w-4xl"><Link to="/student" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={17}/> Back to Dashboard</Link><h1 className="text-3xl font-bold">Report an Issue</h1><p className="mt-2 text-slate-500">Tell us about the campus issue you are facing.</p><form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="space-y-6"><label className="block text-sm font-semibold">Complaint Title<input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g. Wi-Fi not working in Hostel Block A" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/></label><label className="block text-sm font-semibold">Describe the Issue<textarea value={description} onChange={e=>setDescription(e.target.value)} required rows={6} placeholder="Explain what happened, how long you have faced the issue, and how it is affecting you..." className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/><span className="mt-2 block text-xs font-normal text-slate-400">CampusAI will analyze the description after submission.</span></label><label className="block text-sm font-semibold">Location<select value={location} onChange={e=>setLocation(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"><option value="">Select location</option>{["Hostel Block A","Hostel Block B","Academic Block","Library","Canteen / Mess","Computer Lab","Transport Area","Sports Area","Other"].map(x=><option key={x}>{x}</option>)}</select></label>{location === "Other" && <label className="block text-sm font-semibold">Custom location<input value={customLocation} onChange={e=>setCustomLocation(e.target.value)} required placeholder="Near Block C staircase" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>}<div><p className="text-sm font-semibold">Evidence <span className="font-normal text-slate-400">(Optional)</span></p><input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={e=>setFile(e.target.files?.[0]??null)}/>{file?<div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileUp size={20} className="text-indigo-600"/><span className="text-sm font-medium">{file.name}</span></div><button type="button" onClick={()=>setFile(null)} className="text-slate-400 hover:text-red-500"><X size={18}/></button></div>:<button type="button" onClick={()=>ref.current?.click()} className="mt-2 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 hover:border-indigo-300 hover:bg-indigo-50/30"><FileUp size={24} className="text-slate-400"/><span className="mt-3 text-sm font-medium">Upload a photo or screenshot</span><span className="mt-1 text-xs text-slate-400">Optional evidence for issue verification.</span></button>}</div>{error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}<div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4"><div className="flex gap-3"><Sparkles size={20} className="mt-0.5 shrink-0 text-indigo-600"/><div><p className="text-sm font-semibold text-indigo-900">CampusAI Analysis</p><p className="mt-1 text-sm leading-6 text-indigo-700">AI will assist with category, urgency, sentiment, emotion, similar complaints and department recommendation. An administrator remains the final decision-maker.</p></div></div></div><div className="flex justify-end"><button disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"><Send size={17}/> {isSubmitting ? "Submitting..." : "Submit Complaint"}</button></div></div></form></div>;
}

export default ReportIssue;
