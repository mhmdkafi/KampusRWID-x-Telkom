import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../../services/api/matchingAPI";
import "./JobSlider.css";

const JobSlider = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load jobs from database
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsFromDB = await getJobs();
        setJobs(jobsFromDB);
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (isPaused || jobs.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === jobs.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, jobs.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? jobs.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === jobs.length - 1 ? 0 : currentIndex + 1);
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    if (typeof salary === "string" && salary.includes("Rp")) return salary;
    const num = Number(salary);
    if (!isNaN(num)) {
      return `Rp ${num.toLocaleString("id-ID")}`;
    }
    return salary;
  };

  if (isLoading) {
    return (
      <div className="job-slider-container">
        <div className="slider-loading">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="job-slider-container">
        <div className="slider-empty">
          <p>No jobs available at the moment.</p>
        </div>
      </div>
    );
  }

  const currentJob = jobs[currentIndex];
  const skills = Array.isArray(currentJob.skills) ? currentJob.skills : [];
  const visibleSkills = skills.slice(0, 3);

  return (
    <div className="job-slider-container">
      {/* Header */}
      <div className="slider-header">
        <h3 className="slider-title">Featured Jobs</h3>
      </div>

      {/* Main Slider */}
      <div className="slider-main-container">
        {/* Left Navigation */}
        <button
          onClick={goToPrevious}
          className="nav-button nav-left"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-label="Previous job"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Job Card Display - Single Card */}
        <div className="job-card-container">
          <div
            className="job-card-single"
            onClick={() => handleViewJob(currentJob.id)}
          >
            {/* Company Logo */}
            <div className="job-card-header">
              <div className="company-logo-section">
                {currentJob.image_url ? (
                  <img
                    src={currentJob.image_url}
                    alt={currentJob.company}
                    className="company-logo"
                  />
                ) : (
                  <div className="company-logo-fallback">
                    {currentJob.company.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="job-type-badge">
                {currentJob.job_type || "Full-time"}
              </div>
            </div>

            {/* Job Info */}
            <div className="job-card-body">
              <h4 className="job-title">{currentJob.title}</h4>
              <p className="job-company">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {currentJob.company}
              </p>

              {currentJob.location && (
                <p className="job-location">
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
                  {currentJob.location}
                </p>
              )}

              {currentJob.salary && (
                <div className="job-salary">
                  <span className="salary-icon">💰</span>
                  <span className="salary-text">
                    {formatSalary(currentJob.salary)}
                  </span>
                </div>
              )}

              {/* Skills */}
              {visibleSkills.length > 0 && (
                <div className="job-skills">
                  {visibleSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="skill-tag more">+{skills.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="job-card-footer">
              <button className="btn-view-details">
                View Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Navigation */}
        <button
          onClick={goToNext}
          className="nav-button nav-right"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-label="Next job"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default JobSlider;
