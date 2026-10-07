import { UserRound } from "lucide-react";
import { getAuthenticatedUserName } from "../../utils/authUser";

type AuthenticatedUser = {
  name?: unknown;
  role?: unknown;
};

function getAuthenticatedUser(): AuthenticatedUser | null {
  const raw = localStorage.getItem("campusai_user");

  if (!raw) {
    return null;
  }

  try {
    const user = JSON.parse(raw) as AuthenticatedUser;
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
}

function getRoleLabel(role: unknown) {
  return role === "admin" ? "Administrator" : "Student";
}

function AccountProfile() {
  const user = getAuthenticatedUser();
  const name = getAuthenticatedUserName();
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
        {initial || <UserRound size={16} />}
      </div>
      <div className="hidden min-w-0 sm:block">
        <p className="max-w-56 truncate text-sm font-semibold text-slate-900" title={name}>
          {name}
        </p>
        <p className="text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
      </div>
    </div>
  );
}

export default AccountProfile;