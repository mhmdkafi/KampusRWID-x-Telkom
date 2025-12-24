import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import Notification from "../../components/Notification/Notification";
import { useNotification } from "../../hooks/useNotification";
import "./ManageCVs.css";

const STORAGE_BUCKET = "cv-files"; // Sesuai dengan bucket di Supabase Storage

const ManageCVs = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { notification, showNotification, hideNotification } =
    useNotification();

  const fetchCVs = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showNotification("You must be logged in", "error");
        navigate("/");
        return;
      }

      // Call RPC function untuk get CVs dengan user info
      const { data: cvsData, error } = await supabase.rpc(
        "get_cvs_with_user_info"
      );

      if (error) {
        console.error("Error fetching CVs:", error);
        throw error;
      }

      // Format data untuk display
      const formattedCVs = (cvsData || []).map((cv) => ({
        ...cv,
        fullName: cv.user_full_name || "Unknown User",
        userEmail: cv.user_email || "unknown@email.com",
        uploadedAt: new Date(cv.created_at).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }));

      setCvs(formattedCVs);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      showNotification("Failed to fetch CVs: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [navigate, showNotification]);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  const handleDownloadCV = async (cv) => {
    try {
      if (!cv.storage_path) {
        showNotification("CV file not found", "error");
        return;
      }

      console.log("Downloading CV from storage_path:", cv.storage_path);
      console.log("Using bucket:", STORAGE_BUCKET);

      // Untuk private bucket, HARUS pakai signed URL atau download langsung
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(cv.storage_path);

      if (error) {
        console.error("Storage download error:", error);
        throw new Error(error.message || "Failed to download from storage");
      }

      if (!data) {
        throw new Error("No data received from storage");
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = cv.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification("CV downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading CV:", error);
      showNotification("Failed to download CV: " + error.message, "error");
    }
  };

  const handleViewCV = async (cv) => {
    try {
      if (!cv.storage_path) {
        showNotification("CV file not found", "error");
        return;
      }

      console.log("Viewing CV from storage_path:", cv.storage_path);
      console.log("Using bucket:", STORAGE_BUCKET);

      // Untuk private bucket, WAJIB pakai signed URL
      const { data: signedData, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(cv.storage_path, 3600); // 1 hour

      if (error) {
        console.error("Error creating signed URL:", error);
        throw new Error(error.message || "Failed to create view URL");
      }

      if (signedData?.signedUrl) {
        window.open(signedData.signedUrl, "_blank");
      } else {
        throw new Error("Could not generate signed URL for viewing");
      }
    } catch (error) {
      console.error("Error viewing CV:", error);
      showNotification("Failed to view CV: " + error.message, "error");
    }
  };

  const filteredCVs = cvs.filter(
    (cv) =>
      cv.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-cvs">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-cvs">
      <div className="container py-5">
        {/* Header */}
        <div className="page-header">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="back-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1>Manage CVs</h1>
            <p className="text-muted">View and download uploaded CVs</p>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by filename or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="cvs-stats mb-4">
          <div className="stat-item">
            <strong>{cvs.length}</strong> Total CVs
          </div>
          <div className="stat-item">
            <strong>{filteredCVs.length}</strong> Filtered Results
          </div>
        </div>

        {/* CVs Table */}
        <div className="cvs-table-wrapper">
          <table className="cvs-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>User</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCVs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    {searchTerm
                      ? "No CVs found matching your search"
                      : "No CVs uploaded yet"}
                  </td>
                </tr>
              ) : (
                filteredCVs.map((cv) => (
                  <tr key={cv.id}>
                    <td>
                      <div className="filename-cell">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {cv.filename}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{cv.fullName}</div>
                        <small style={{ color: "#718096" }}>
                          {cv.userEmail}
                        </small>
                      </div>
                    </td>
                    <td>{cv.uploadedAt}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewCV(cv)}
                          className="btn-action btn-view"
                          title="View CV"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadCV(cv)}
                          className="btn-action btn-download"
                          title="Download CV"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default ManageCVs;
