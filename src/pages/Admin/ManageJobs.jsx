import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, deleteJob } from "../../services/api/matchingAPI";
import "./ManageJobs.css";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobsList = await getJobs();
      setJobs(jobsList);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      alert("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      alert("Job deleted successfully");
      fetchJobs(); // Refresh list
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job: " + error.message);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-jobs">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-jobs">
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
            <h1>Manage Jobs</h1>
            <p className="text-muted">Add, edit, or delete job listings</p>
          </div>
          <button
            onClick={() => navigate("/admin/add-job")}
            className="add-btn"
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
            Add New Job
          </button>
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
            placeholder="Search by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="jobs-stats mb-4">
          <div className="stat-item">
            <strong>{jobs.length}</strong> Total Jobs
          </div>
          <div className="stat-item">
            <strong>{filteredJobs.length}</strong> Filtered Results
          </div>
        </div>

        {/* Jobs Table */}
        <div className="jobs-table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Skills</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className="job-title-cell">
                        {job.image_url && (
                          <img
                            src={job.image_url}
                            alt={job.company}
                            className="company-logo-small"
                          />
                        )}
                        <strong>{job.title}</strong>
                      </div>
                    </td>
                    <td>{job.company}</td>
                    <td>{job.location || "-"}</td>
                    <td>
                      <span className="badge badge-type">{job.job_type}</span>
                    </td>
                    <td>
                      <div className="skills-cell">
                        {job.skills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="skill-badge">
                            {skill}
                          </span>
                        ))}
                        {job.skills?.length > 3 && (
                          <span className="skill-more">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="btn-action btn-view"
                          title="View"
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
                          onClick={() =>
                            navigate(`/admin/edit-job/${job.id}`)
                          }
                          className="btn-action btn-edit"
                          title="Edit"
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
                          onClick={() => setDeleteConfirm(job)}
                          className="btn-action btn-delete"
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong> at{" "}
              <strong>{deleteConfirm.company}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="btn-confirm-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;