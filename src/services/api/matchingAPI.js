const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api";

// Helper untuk ambil token dari Supabase localStorage
function getAuthToken() {
  // Cari key yang match dengan pattern Supabase auth token
  const keys = Object.keys(localStorage);
  const authKey = keys.find((key) => key.includes("auth-token"));

  if (!authKey) {
    console.warn("No Supabase auth token found in localStorage");
    return null;
  }

  try {
    const authData = JSON.parse(localStorage.getItem(authKey) || "{}");
    return authData.access_token || null;
  } catch (err) {
    console.error("Error parsing auth token:", err);
    return null;
  }
}

// Jobs API
export async function getJobs(userId = null) {
  const url = userId
    ? `${API_BASE_URL}/jobs?user_id=${userId}`
    : `${API_BASE_URL}/jobs`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil jobs");
  const data = await res.json();
  return data.jobs || [];
}

export async function getJobById(id) {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil job detail");
  const data = await res.json();
  return data.job;
}

export async function createJob(jobData) {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(jobData),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gagal menambah job: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function updateJob(id, jobData) {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(jobData),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gagal update job: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function deleteJob(id) {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gagal hapus job: ${res.status} ${errText}`);
  }

  return res.json();
}

// Saved Jobs API
export async function saveJob(jobId) {
  const token = getAuthToken();
  if (!token) throw new Error("Anda belum login");

  const res = await fetch(`${API_BASE_URL}/jobs/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ job_id: jobId }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gagal save job: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function unsaveJob(jobId) {
  const token = getAuthToken();
  if (!token) throw new Error("Anda belum login");

  const res = await fetch(`${API_BASE_URL}/jobs/save/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gagal unsave job: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function getSavedJobs() {
  const token = getAuthToken();
  if (!token) throw new Error("Anda belum login");

  const res = await fetch(`${API_BASE_URL}/jobs/saved/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gagal ambil saved jobs: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.jobs || [];
}

// CV Upload API
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

export async function getUserInfo() {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    console.error("getUserInfo failed:", res.status, errorText);

    if (res.status === 401) {
      throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
    }

    throw new Error(`Gagal mengambil user info: ${res.status}`);
  }

  return res.json();
}
