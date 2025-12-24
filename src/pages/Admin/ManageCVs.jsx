import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import Notification from "../../components/Notification/Notification";
import { useNotification } from "../../hooks/useNotification";
import "./ManageCVs.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api";

const ManageCVs = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCV, setSelectedCV] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { notification, showNotification, hideNotification } = useNotification();

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

      const { data, error } = await supabase
        .from("cvs")
        .select(`
          *,
          users:user_id (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCvs(data || []);
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

  const handleDeleteCV = async (cvId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/cv/${cvId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete CV");
      }

      showNotification("CV deleted successfully", "success");
      await fetchCVs();
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting CV:", error);
      showNotification("Failed to delete CV: " + error.message, "error");
    }
  };

  const handleDownloadCV = async (cv) => {
    try {
      if (!cv.storage_path) {
        showNotification("CV file not found", "error");
        return;
      }

      const { data, error } = await supabase.storage
        .from("cvs")
        .download(cv.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = cv.filename || "cv.pdf";
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

  const filteredCVs = cvs.filter((cv) => {
    const userName = cv.users?.full_name || cv.users?.email || "";
    const fileName = cv.filename || "";
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="manage-cvs">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading CVs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-cvs">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      <div className="container-fluid px-3 px-lg-4">
        {/* Header */}
        <div className="page-header">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="back-btn mb-2"
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
            <p className="text-muted">View and manage uploaded CVs</p>
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
            placeholder="Search by user name or file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="cvs-stats mb-4">
          <div className="stat-item">
            <strong>{cvs.length}</strong>
            <span>Total CVs</span>
          </div>
          <div className="stat-item">
            <strong>{filteredCVs.length}</strong>
            <span>Filtered Results</span>
          </div>
        </div>

        {/* Table for Desktop */}
        <div className="cvs-table-wrapper d-none d-md-block">
          <div className="table-responsive">
            <table className="cvs-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>File Name</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCVs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="py-4">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          style={{ margin: "0 auto", opacity: 0.3 }}
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                        <p className="mt-3 mb-0">No CVs found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCVs.map((cv) => (
                    <tr key={cv.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {(
                              cv.users?.full_name ||
                              cv.users?.email ||
                              "U"
                            ).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name">
                              {cv.users?.full_name || "Unknown"}
                            </div>
                            <div className="user-email">{cv.users?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="filename-cell">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          {cv.filename || "N/A"}
                        </div>
                      </td>
                      <td>
                        {cv.created_at
                          ? new Date(cv.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => setSelectedCV(cv)}
                            className="btn-action btn-view"
                            title="View Details"
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
                          <button
                            onClick={() => setConfirmDelete(cv)}
                            className="btn-action btn-delete"
                            title="Delete CV"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

        {/* Card Layout for Mobile */}
        <div className="cvs-cards d-md-none">
          {filteredCVs.length === 0 ? (
            <div className="text-center py-5">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ margin: "0 auto", opacity: 0.3 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p className="mt-3 mb-0 text-muted">No CVs found</p>
            </div>
          ) : (
            filteredCVs.map((cv) => (
              <div key={cv.id} className="cv-card">
                <div className="cv-card-header">
                  <div className="user-card-avatar">
                    {(
                      cv.users?.full_name ||
                      cv.users?.email ||
                      "U"
                    ).charAt(0).toUpperCase()}
                  </div>
                  <div className="cv-card-user-info">
                    <h3>{cv.users?.full_name || "Unknown"}</h3>
                    <p className="user-email">{cv.users?.email}</p>
                  </div>
                </div>

                <div className="cv-card-body">
                  <div className="cv-card-details">
                    <div className="detail-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="filename-text">{cv.filename || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="text-muted">
                        {cv.created_at
                          ? new Date(cv.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="cv-card-actions">
                  <button
                    onClick={() => setSelectedCV(cv)}
                    className="btn-card-action btn-card-view"
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
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadCV(cv)}
                    className="btn-card-action btn-card-download"
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
                    Download
                  </button>
                  <button
                    onClick={() => setConfirmDelete(cv)}
                    className="btn-card-action btn-card-delete"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CV Details Modal */}
      {selectedCV && (
        <div className="modal-overlay" onClick={() => setSelectedCV(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>CV Details</h3>
            <div className="cv-details">
              <div className="detail-section">
                <h4>User Information</h4>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedCV.users?.full_name || "Unknown"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedCV.users?.email || "N/A"}
                </p>
              </div>

              <div className="detail-section">
                <h4>CV Information</h4>
                <p>
                  <strong>File Name:</strong> {selectedCV.filename || "N/A"}
                </p>
                <p>
                  <strong>Storage Path:</strong> {selectedCV.storage_path || "N/A"}
                </p>
                <p>
                  <strong>Uploaded:</strong>{" "}
                  {selectedCV.created_at
                    ? new Date(selectedCV.created_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedCV(null)} className="btn-cancel">
                Close
              </button>
              <button
                onClick={() => handleDownloadCV(selectedCV)}
                className="btn-primary"
              >
                Download CV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete CV:{" "}
              <strong>{confirmDelete.filename}</strong>?
            </p>
            <p className="text-danger">⚠️ This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCV(confirmDelete.id)}
                className="btn-danger"
              >
                Delete CV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCVs;
