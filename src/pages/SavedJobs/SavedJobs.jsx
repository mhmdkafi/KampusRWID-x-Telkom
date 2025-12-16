import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getSavedJobs, unsaveJob } from "../../services/api/matchingAPI";
import JobCard from "../../components/JobCard/JobCard";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import AuthModal from "../../components/AuthModal/AuthModal";
import "./SavedJobs.css";

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAuthModalOpen(true);
      setIsLoading(false);
      return;
    }

    loadSavedJobs();
  }, [user]);

  const loadSavedJobs = async () => {
    try {
      setIsLoading(true);
      const jobs = await getSavedJobs();
      setSavedJobs(jobs);
    } catch (error) {
      console.error("Error loading saved jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await unsaveJob(jobId);
      // Refresh list setelah unsave
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error unsaving job:", error);
    }
  };

  const handleViewDetails = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  const handleApply = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <>
        <div className="saved-jobs-page">
          <div className="saved-jobs-container">
            <div className="empty-state">
              <div className="empty-icon">🔒</div>
              <h2>Login Required</h2>
              <p>Please login to view your saved jobs</p>
              <button
                className="btn-login"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Login
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="saved-jobs-page">
      <div className="saved-jobs-container">
        {/* Header */}
        <div className="saved-jobs-header">
          <div className="header-content">
            <h1>
              <span className="bookmark-icon">🔖</span>
              Saved Jobs
            </h1>
            <p className="subtitle">
              {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {/* Jobs Grid */}
        {savedJobs.length > 0 ? (
          <div className="saved-jobs-grid">
            {savedJobs.map((job) => (
              <div key={job.id} className="saved-job-item">
                <div onClick={() => handleViewDetails(job)}>
                  <JobCard job={job} onApply={handleApply} />
                </div>
                <button
                  className="btn-unsave"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsave(job.id);
                  }}
                  title="Remove from saved"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  Unsave
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Saved Jobs</h2>
            <p>Start saving jobs to see them here!</p>
            <button className="btn-browse" onClick={() => navigate("/jobs")}>
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;