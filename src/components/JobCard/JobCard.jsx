import React from 'react';
import './JobCard.css';

const JobCard = ({ job, isActive = false }) => {
  const getMatchColor = (score) => {
    if (score >= 90) return '#22543d';
    if (score >= 80) return '#2f855a';
    if (score >= 70) return '#38a169';
    return '#718096';
  };

  const getMatchWidth = (score) => `${score}%`;

  if (!job) {
    return (
      <div className="job-card-placeholder">
        <p>No job data available</p>
      </div>
    );
  }

  return (
    <div className={`job-card ${isActive ? 'active' : ''}`}>
      <div className="job-card-content">
        {/* Header dengan Icon Dynamic */}
        <div className="job-card-header">
          {/* Job Icon */}
          <div className="job-icon-section">
            <div className="job-icon-large">{job.icon}</div>
            <div className="job-type-info">
              <div className="job-type-badge">{job.type}</div>
              <div className="job-experience-badge">{job.experience}</div>
            </div>
          </div>
          
          {/* Match Score Badge */}
          <div className="match-score-badge">
            <div 
              className="match-circle"
              style={{ borderColor: getMatchColor(job.matchScore) }}
            >
              <span style={{ color: getMatchColor(job.matchScore) }}>
                {job.matchScore}%
              </span>
            </div>
            <small>Match</small>
          </div>
        </div>
        
        {/* Job Content */}
        <div className="job-details">
          {/* Job Title */}
          <h4 className="job-title">{job.title}</h4>
          
          {/* Company */}
          <div className="job-company">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{job.company}</span>
          </div>
          
          {/* Location */}
          <div className="job-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.58 6.58 2 12 2S21 5.58 21 10Z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{job.location}</span>
          </div>

          {/* Salary */}
          <div className="job-salary">
            <span className="salary-icon">💰</span>
            <span className="salary-text">{job.salary}</span>
          </div>

          {/* Skills Tags */}
          <div className="job-skills">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="job-actions">
          <button className="btn-apply">
            Apply Now
          </button>
          <button className="btn-save">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        
        {/* Match percentage */}
        <div className="job-match-bar">
          <div className="match-info">
            <small>Match Score</small>
            <div className="match-progress">
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{
                    width: getMatchWidth(job.matchScore), 
                    background: `linear-gradient(135deg, ${getMatchColor(job.matchScore)} 0%, ${getMatchColor(job.matchScore)}aa 100%)`
                  }}
                ></div>
              </div>
              <span 
                className="match-percentage"
                style={{color: getMatchColor(job.matchScore)}}
              >
                {job.matchScore}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;