import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import Notification from "../../components/Notification/Notification";
import { useNotification } from "../../hooks/useNotification";
import "./ManageJobs.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { notification, showNotification, hideNotification } = useNotification();

  const fetchJobs = useCallback(async () => {
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

      const response = await fetch(`${API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch jobs");
      }

      setJobs(result.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showNotification("Failed to fetch jobs: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [navigate, showNotification]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update job status");
      }

      showNotification(`Job status updated to ${newStatus}`, "success");
      await fetchJobs();
    } catch (error) {
      console.error("Error updating job status:", error);
      showNotification("Failed to update job status: " + error.message, "error");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete job");
      }

      showNotification("Job deleted successfully", "success");
      await fetchJobs();
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting job:", error);
      showNotification("Failed to delete job: " + error.message, "error");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || job.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="manage-jobs">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-jobs">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      <div className="container-fluid px-3 px-lg-4">
        {/* Page Header */}
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
            <h1>Manage Jobs</h1>
            <p className="text-muted">View and manage job postings</p>
          </div>
          <button
            onClick={() => navigate("/admin/jobs/add")}
            className="btn-primary"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Job</span>
          </button>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-bar">
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
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              All Jobs
            </button>
            <button
              className={`filter-btn ${
                filterStatus === "active" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("active")}
            >
              Active
            </button>
            <button
              className={`filter-btn ${
                filterStatus === "inactive" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("inactive")}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="jobs-stats">
          <div className="stat-item">
            <strong>{jobs.length}</strong>
            <span>Total Jobs</span>
          </div>
          <div className="stat-item">
            <strong>{filteredJobs.length}</strong>
            <span>Filtered Results</span>
          </div>
          <div className="stat-item">
            <strong>
              {jobs.filter((j) => j.status === "active").length}
            </strong>
            <span>Active Jobs</span>
          </div>
        </div>

        {/* Table for Desktop, Cards for Mobile */}
        <div className="jobs-table-wrapper d-none d-md-block">
          <div className="table-responsive">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
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
                        <p className="mt-3 mb-0">No jobs found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className="job-title-cell">
                          <strong>{job.title}</strong>
                        </div>
                      </td>
                      <td>{job.company}</td>
                      <td>{job.location}</td>
                      <td>
                        <span className="badge-type">{job.type}</span>
                      </td>
                      <td>
                        <span
                          className={`badge-status ${
                            job.status === "active"
                              ? "badge-active"
                              : "badge-inactive"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td>
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() =>
                              navigate(`/admin/jobs/edit/${job.id}`)
                            }
                            className="btn-action btn-edit"
                            title="Edit Job"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(job.id, job.status)
                            }
                            className="btn-action btn-toggle"
                            title={`Toggle Status (Currently ${job.status})`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="1"
                                y="5"
                                width="22"
                                height="14"
                                rx="7"
                                ry="7"
                              />
                              <circle cx="16" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(job)}
                            className="btn-action btn-delete"
                            title="Delete Job"
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
        <div className="jobs-cards d-md-none">
          {filteredJobs.length === 0 ? (
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
              <p className="mt-3 mb-0 text-muted">No jobs found</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <div className="job-card-title">
                    <h3>{job.title}</h3>
                    <span
                      className={`badge-status ${
                        job.status === "active"
                          ? "badge-active"
                          : "badge-inactive"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>

                <div className="job-card-body">
                  <div className="job-card-info">
                    <div className="info-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <span>{job.company}</span>
                    </div>

                    <div className="info-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{job.location}</span>
                    </div>

                    <div className="info-item">
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
                      <span>
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="job-card-type">
                    <span className="badge-type">{job.type}</span>
                  </div>
                </div>

                <div className="job-card-actions">
                  <button
                    onClick={() => navigate(`/admin/jobs/edit/${job.id}`)}
                    className="btn-card-action btn-card-edit"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job.id, job.status)}
                    className="btn-card-action btn-card-toggle"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
                      <circle cx="16" cy="12" r="3" />
                    </svg>
                    Toggle
                  </button>
                  <button
                    onClick={() => setConfirmDelete(job)}
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete the job:{" "}
              <strong>{confirmDelete.title}</strong>?
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
                onClick={() => handleDeleteJob(confirmDelete.id)}
                className="btn-danger"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;