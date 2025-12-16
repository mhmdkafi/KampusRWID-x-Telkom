// matchingAPI.js - PERBAIKAN getAuthToken()

import { supabase } from "../../config/supabase";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api";

// PERBAIKAN: Helper untuk ambil token dari Supabase menggunakan getSession()
async function getAuthToken() {
  try {
    console.log("🔍 Attempting to get session...");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log("📋 Session data:", {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      error: error?.message,
    });

    if (error) {
      console.error("❌ Error getting session:", error);
      return null;
    }

    if (!session || !session.access_token) {
      console.warn("⚠️ No active session or access token");
      console.log("💡 Please login first!");
      return null;
    }

    console.log("✅ Token retrieved successfully");
    return session.access_token;
  } catch (err) {
    console.error("❌ Error getting auth token:", err);
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
  const token = await getAuthToken(); // TAMBAH AWAIT

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
  const token = await getAuthToken(); // TAMBAH AWAIT

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
  const token = await getAuthToken(); // TAMBAH AWAIT

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
  console.log("💾 Attempting to save job:", jobId);

  const token = await getAuthToken();
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

  const result = await res.json();
  console.log("✅ Job saved successfully:", result);
  return result;
}

export async function unsaveJob(jobId) {
  console.log("🗑️ Attempting to unsave job:", jobId);

  const token = await getAuthToken();

  if (!token) {
    console.error("❌ No auth token found");
    throw new Error("Anda belum login");
  }

  console.log(
    "✅ Token retrieved, sending DELETE request to:",
    `${API_BASE_URL}/jobs/save/${jobId}`
  );

  const res = await fetch(`${API_BASE_URL}/jobs/save/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      // HAPUS Content-Type karena DELETE tidak punya body
    },
  });

  console.log("📡 Unsave response status:", res.status);

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("❌ Unsave failed:", res.status, errText);
    throw new Error(`Gagal unsave job: ${res.status} ${errText}`);
  }

  const result = await res.json();
  console.log("✅ Job unsaved successfully:", result);
  return result;
}

export async function getSavedJobs() {
  const token = await getAuthToken(); // TAMBAH AWAIT
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

// CV Upload API - PERBAIKAN
export async function uploadCVAndMatch(file) {
  console.log("🔐 Getting authentication token...");
  const token = await getAuthToken(); // TAMBAH AWAIT

  if (!token) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  console.log("📤 Uploading CV with valid token...");
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
    console.error("❌ Upload failed:", res.status, errText);
    throw new Error(`Upload gagal: ${res.status} ${errText}`);
  }

  const result = await res.json();
  console.log("✅ CV uploaded successfully");
  return result;
}

export async function getUserInfo() {
  const token = await getAuthToken(); // TAMBAH AWAIT
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
