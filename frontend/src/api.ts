const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("campusai_token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}


// ============================================================
// AUTH
// ============================================================

export async function login(
  identifier: string,
  password: string,
  role: "student" | "admin" = "student"
) {
  const response = await fetch(
    `${API_BASE}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        role === "admin"
          ? {
              employee_id: identifier,
              password,
            }
          : {
              roll_no: identifier,
              password,
            }
      ),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    );
  }

  if (data.access_token) {
    localStorage.setItem(
      "campusai_token",
      data.access_token
    );
  }

  if (data.user) {
    localStorage.setItem(
      "campusai_user",
      JSON.stringify(data.user)
    );
  }

  return data;
}


export async function register(
  name: string,
  identifier: string,
  password: string,
  role: "student" | "admin" = "student"
) {
  const response = await fetch(
    `${API_BASE}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        role === "admin"
          ? {
              name,
              employee_id: identifier,
              password,
              role: "admin",
            }
          : {
              name,
              roll_no: identifier,
              password,
              role: "student",
            }
      ),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed"
    );
  }

  return data;
}


// ============================================================
// COMPLAINTS
// ============================================================

export async function getMyComplaints() {
  return apiRequest("/api/complaints/my");
}


export async function getComplaint(
  complaintId: string
) {
  return apiRequest(
    `/api/complaints/${complaintId}`
  );
}


export async function createComplaint(
  complaint: {
    title: string;
    description: string;
    location: string;
    custom_location?: string | null;
    evidence?: string | null;
  }
) {
  return apiRequest(
    "/api/complaints",
    {
      method: "POST",
      body: JSON.stringify(complaint),
    }
  );
}


// ============================================================
// ADMIN
// ============================================================

export async function getAllComplaints(filters: {
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
} = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return apiRequest(
    `/api/complaints/admin/all${query ? `?${query}` : ""}`
  );
}


export async function getAdminStats() {
  return apiRequest("/api/complaints/admin/stats");
}


export async function getAdminComplaint(
  complaintId: string
) {
  return apiRequest(
    `/api/complaints/admin/${complaintId}`
  );
}


export async function updateComplaintStatus(
  complaintId: string,
  status: string
) {
  return apiRequest(
    `/api/complaints/${complaintId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
}


// ============================================================
// LOGOUT
// ============================================================

export function logout() {
  localStorage.removeItem(
    "campusai_token"
  );

  localStorage.removeItem(
    "campusai_user"
  );
}