const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api";

// Helper untuk ambil token dari localStorage
function getAuthToken() {
  const authData = JSON.parse(
    localStorage.getItem("sb-wouphrrmwunjmeffyiki-auth-token") || "{}"
  );
  return authData.access_token || null;
}

// 1. Get semua jobs
export async function getJobs() {
  const res = await fetch(`${API_BASE_URL}/jobs`);
  if (!res.ok) throw new Error("Gagal mengambil jobs");
  const data = await res.json();
  return data.jobs || [];
}

// 2. Create job (single) - DIPERBAIKI
export async function createJob(jobData) {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gagal menambah job: ${res.status} ${errText}`);
  }

  return res.json();
}

// 3. Upload CV dan match dengan jobs (butuh login)
export async function uploadCVAndMatch(file) {
  const token = getAuthToken();
  if (!token) throw new Error("Anda belum login");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/cv/match`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Upload gagal: ${res.status} ${errText}`);
  }

  return res.json();
}

// 4. Get user info (butuh login)
export async function getUserInfo() {
  const token = getAuthToken();
  if (!token) throw new Error("Anda belum login");

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal mengambil user info");
  return res.json();
}
