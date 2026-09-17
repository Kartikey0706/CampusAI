type StoredUser = {
  name?: unknown;
};

export function getAuthenticatedUserName() {
  const raw = localStorage.getItem("campusai_user");

  if (!raw) return "Campus User";

  try {
    const user = JSON.parse(raw) as StoredUser;
    return typeof user.name === "string" && user.name.trim() ? user.name.trim() : "Campus User";
  } catch {
    return "Campus User";
  }
}
