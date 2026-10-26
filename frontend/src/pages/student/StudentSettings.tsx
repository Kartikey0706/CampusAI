import { BadgeCheck, IdCard, ShieldCheck, UserRound } from "lucide-react";
import { getAuthenticatedUserName } from "../../utils/authUser";

type StoredUser = {
    name?: string;
    roll_no?: string;
    role?: string;
};

function getStoredUser(): StoredUser {
    try {
        const raw = localStorage.getItem("campusai_user");
        return raw ? (JSON.parse(raw) as StoredUser) : {};
    } catch {
        return {};
    }  
}

function StudentSettings() {
    const user = getStoredUser();

    const fields = [
        { label: "Full name", value: getAuthenticatedUserName(), icon: UserRound },
        { label: "Roll number", value: user.roll_no || "Not available", icon: IdCard },
        { label: "Account type", value: "Student", icon: BadgeCheck },
    ];

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-slate-500">
                Your student profile, as registered with CampusAI.
            </p>

            <div className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {fields.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-4 px-6 py-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {label}
                            </p>
                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                                {value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-indigo-600" />
                <p>
                    Your complaints are analysed by CampusAI and routed to the right
                    department. Profile details are managed by the university records
                    and cannot be edited here.
                </p>
            </div>
        </div>
    );
}

export default StudentSettings;