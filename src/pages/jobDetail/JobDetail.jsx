import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getJobById,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from "../../services/api/matchingAPI";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import AuthModal from "../../components/AuthModal/AuthModal";
import "./JobDetail.css";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // ADD: Loading state

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      setIsLoading(true);
      const jobData = await getJobById(id);
      setJob(jobData);

      // Check if job is saved (only if user is logged in)
      if (user) {
        const savedStatus = await checkIfJobIsSaved(id);
        setIsSaved(savedStatus);
      } else {
        setIsSaved(false);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to check saved status when user changes
  useEffect(() => {
    if (user && job) {
      checkIfJobIsSaved(id).then(setIsSaved);
    } else {
      setIsSaved(false);
    }
  }, [user, id, job]);

  const checkIfJobIsSaved = async (jobId) => {
    if (!user) return false;

    try {
      const savedJobs = await getSavedJobs();
      return savedJobs.some((j) => j.id === parseInt(jobId));
    } catch (error) {
      console.error("Error checking saved status:", error);
      return false;
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Prevent double click
    if (isSaving) {
      console.log("⏳ Already processing save/unsave request");
      return;
    }

    setIsSaving(true);

    try {
      if (isSaved) {
        console.log("🗑️ Unsaving job:", job.id);
        await unsaveJob(job.id);
        setIsSaved(false);
        console.log("✅ Job unsaved successfully");
      } else {
        console.log("💾 Saving job:", job.id);
        await saveJob(job.id);
        setIsSaved(true);
        console.log("✅ Job saved successfully");
      }
    } catch (error) {
      console.error("❌ Error toggling save:", error);
      alert(`Failed to ${isSaved ? "unsave" : "save"} job: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    alert(`Apply to ${job.title} at ${job.company}`);
  };

  if (isLoading) {
    return (
      <div className="job-detail-loading">
        <LoadingSpinner />
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-error">
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist.</p>
        <Link to="/jobs" className="btn-back-to-jobs">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const skills = Array.isArray(job.skills) ? job.skills : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const responsibilities = Array.isArray(job.responsibilities)
    ? job.responsibilities
    : [];

  const formatSalary = (salary) => {
    if (!salary) return null;
    // Jika sudah ada format "Rp", return as is
    if (typeof salary === "string" && salary.includes("Rp")) return salary;
    // Jika angka, format dengan thousand separator
    const num = Number(salary);
    if (!isNaN(num)) {
      return `Rp ${num.toLocaleString("id-ID")}`;
    }
    return salary;
  };

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">›</span>
          <Link to="/jobs">Jobs</Link>
          <span className="separator">›</span>
          <span className="current">{job.title}</span>
        </nav>

        {/* Job Header */}
        <div className="job-detail-header">
          <div className="header-left">
            <div className="company-logo-large">
              {job.image_url ? (
                <img src={job.image_url} alt={job.company} />
              ) : (
                <div className="logo-placeholder">
                  {job.company.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="header-info">
              <h1 className="job-title-large">{job.title}</h1>
              <div className="company-info">
                <h3 className="company-name">{job.company}</h3>
                <div className="job-meta">
                  {job.location && (
                    <span className="meta-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.58 6.58 2 12 2S21 5.58 21 10Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="10"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {job.location}
                    </span>
                  )}
                  {job.job_type && (
                    <span className="meta-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="3"
                          y1="10"
                          x2="21"
                          y2="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {job.job_type}
                    </span>
                  )}
                  {/* ADD: Salary di meta */}
                  {job.salary && (
                    <span className="meta-item salary-meta">
                      <span style={{ fontSize: "1.2rem" }}>💵</span>
                      <strong>{formatSalary(job.salary)}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button
              className={`btn-save-large ${isSaved ? "saved" : ""} ${
                isSaving ? "loading" : ""
              }`}
              onClick={handleSaveJob}
              disabled={isSaving}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 21L12 16L5 21V5C5 3.89 5.89 3 7 3H17C18.11 3 19 3.89 19 5V21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill={isSaved ? "currentColor" : "none"}
                />
              </svg>
              {isSaving ? "..." : isSaved ? "Saved" : "Save Job"}
            </button>
            <button className="btn-apply-large" onClick={handleApply}>
              Apply Now
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="job-detail-content">
          <div className="content-main">

            {/* Description */}
            {job.description && (
              <section className="detail-section">
                <h2>About the Role</h2>
                <p>{job.description}</p>
              </section>
            )}

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <section className="detail-section">
                <h2>Responsibilities</h2>
                <ul className="styled-list">
                  {responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <section className="detail-section">
                <h2>Requirements</h2>
                <ul className="styled-list">
                  {requirements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section className="detail-section">
                <h2>Required Skills</h2>
                <div className="skills-grid">
                  {skills.map((skill, index) => (
                    <span key={index} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="content-sidebar">
            <div className="sidebar-card">
              <h3>Company Information</h3>
              <div className="company-detail-item">
                <span className="label">Company</span>
                <span className="value">{job.company}</span>
              </div>
              {job.location && (
                <div className="company-detail-item">
                  <span className="label">Location</span>
                  <span className="value">{job.location}</span>
                </div>
              )}
              {job.job_type && (
                <div className="company-detail-item">
                  <span className="label">Employment Type</span>
                  <span className="value">{job.job_type}</span>
                </div>
              )}
              {job.created_at && (
                <div className="company-detail-item">
                  <span className="label">Posted</span>
                  <span className="value">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
};

export default JobDetail;
