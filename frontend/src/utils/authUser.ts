type StoredUser = {
  name?: unknown;
};

export function formatDisplayName(raw: string) {
  let name = raw.trim().replace(/\s+/g, " ");

  if (name.includes(",")) {
    const [last, ...rest] = name
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const first = rest.join(" ");
    name = first ? `${first} ${last}` : last;
  }

  // If the whole name is in capitals, convert to Title Case
  if (name === name.toUpperCase()) {
    name = name
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return name;
}

export function getAuthenticatedUserName() {
  const raw = localStorage.getItem("campusai_user");

  if (!raw) return "Campus User";

  try {
    const user = JSON.parse(raw) as StoredUser;
    return typeof user.name === "string" && user.name.trim()
      ? formatDisplayName(user.name)
      : "Campus User";
  } catch {
    return "Campus User";
  }
}