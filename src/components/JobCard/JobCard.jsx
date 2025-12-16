import React, { useState } from "react";
import "./JobCard.css";

const JobCard = ({ job, isActive = false, onSave, onApply }) => {
  const [imageError, setImageError] = useState(false);

  const getCompanyInitial = (company) => {
    return company ? company.trim().charAt(0).toUpperCase() : "J";
  };

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

  if (!job) {
    return (
      <div className="job-card-placeholder">
        <p>No job data available</p>
      </div>
    );
  }

  const skills = Array.isArray(job.skills) ? job.skills : [];
  const visibleSkills = skills.slice(0, 5);
  const extraSkills = skills.length - visibleSkills.length;

  return (
    <div className={`job-card ${isActive ? "active" : ""}`}>
      <div className="job-card-content">
        {/* Header dengan Logo */}
        <div className="job-card-header">
          <div className="job-icon-section">
            {job.image_url && !imageError ? (
              <img
                src={job.image_url}
                alt={job.company}
                className="company-logo"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="logo-fallback show">
                {getCompanyInitial(job.company)}
              </div>
            )}
          </div>

          {/* Badge Info */}
          <div className="job-meta-badges">
            <span className="job-type-badge">
              {job.job_type || "Full-time"}
            </span>
            {job.experience_required && (
              <span className="job-experience-badge">
                {job.experience_required}
              </span>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="job-details">
          <h4 className="job-title">{job.title}</h4>

          <div className="job-company">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>{job.company}</span>
          </div>

          {job.location && (
            <div className="job-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
              <span>{job.location}</span>
            </div>
          )}

          {job.salary && (
            <div className="job-salary">
              <span className="salary-icon">💰</span>
              <span className="salary-text">{formatSalary(job.salary)}</span>
            </div>
          )}

          {skills.length > 0 && (
            <div className="job-skills">
              {visibleSkills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="skill-tag more">+{extraSkills}</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="job-actions">
          <button
            className="btn-apply"
            onClick={(e) => {
              e.stopPropagation();
              if (onApply) onApply(job);
            }}
          >
            Apply Now
          </button>
          <button
            className="btn-save"
            onClick={(e) => {
              e.stopPropagation();
              if (onSave) onSave(job);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 21L12 16L5 21V5C5 3.89 5.89 3 7 3H17C18.11 3 19 3.89 19 5V21Z"
                stroke="currentColor"
                strokeWidth="2"
                fill={job.is_saved ? "currentColor" : "none"}
              />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
