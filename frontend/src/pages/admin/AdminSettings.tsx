import { BadgeCheck, IdCard, ShieldCheck, UserRound } from "lucide-react";
import { getAuthenticatedUserName } from "../../utils/authUser";

type StoredUser = {
  employee_id?: string;
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

function AdminSettings() {
  const user = getStoredUser();

  const fields = [
    { label: "Admin name", value: getAuthenticatedUserName(), icon: UserRound },
    { label: "Employee ID", value: user.employee_id || "Not available", icon: IdCard },
    { label: "Account type", value: "Administrator", icon: BadgeCheck },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      <p className="mt-2 text-slate-500">
        Your administrator profile for the CampusAI prototype.
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
          AI recommendations, priority scores and department routing remain
          advisory and should be reviewed by authorized administrators before
          action is taken.
        </p>
      </div>
    </div>
  );
}

export default AdminSettings;