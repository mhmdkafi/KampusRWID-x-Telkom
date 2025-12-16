import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CVUpload from "../../components/cv/CVUpload";
import CVAnalysis from "../../components/cv/CVAnalysis";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import AuthModal from "../../components/AuthModal/AuthModal";
import { cvAnalyzer } from "../../services/ml/cvAnalyzer";
import { matchCalculator } from "../../services/ml/matchCalculator";
import { getJobs, uploadCVAndMatch } from "../../services/api/matchingAPI"; // UPDATE
import "./JobMatching.css";

const JobMatching = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [cvFile, setCvFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAuthenticated = !!user;

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleCVUpload = async (file) => {
    setIsLoading(true);
    setCvFile(file);

    try {
      // 1. Upload CV ke backend (simpan ke DB + Storage)
      console.log("📤 Uploading CV to server...");
      const uploadResult = await uploadCVAndMatch(file);
      console.log("✅ CV uploaded to server:", uploadResult);

      // 2. Analisis CV di frontend
      console.log("📄 Analyzing CV...");
      const analysis = await cvAnalyzer.analyzeCV(file);
      console.log("✅ CV Analysis Complete:", analysis);

      setAnalysisResults(analysis);
      setCurrentStep(2);
    } catch (error) {
      console.error("❌ CV Upload/Analysis Error:", error);
      alert(`Failed to process CV: ${error.message}`);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = async () => {
    console.log("🎯 Starting Job Matching...");
    setIsLoading(true);

    try {
      // Fetch jobs dari database
      console.log("📡 Fetching jobs from database...");
      const jobsList = await getJobs();
      console.log(`✅ Loaded ${jobsList.length} jobs from database`);

      if (jobsList.length === 0) {
        alert("No jobs available in the database. Please add jobs first.");
        setIsLoading(false);
        return;
      }

      // Calculate matches
      const matches = matchCalculator.calculateMatches(
        analysisResults,
        jobsList
      );
      console.log("✅ Job Matching Complete:", matches);

      setMatchResults(matches);
      setCurrentStep(3);
    } catch (error) {
      console.error("❌ Job Matching Error:", error);
      alert(`Failed to match jobs: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCvFile(null);
    setAnalysisResults(null);
    setMatchResults([]);
  };

  const handleViewAllJobs = () => {
    navigate("/jobs");
  };

  // FIX: View Details button handler
  const handleViewJobDetails = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  const renderStepContent = () => {
    // Step 1: Upload CV
    if (currentStep === 1) {
      return (
        <div className="matching-content">
          <CVUpload onUpload={handleCVUpload} isLoading={isLoading} />
        </div>
      );
    }

    // Step 2: CV Analysis
    if (currentStep === 2 && analysisResults && cvFile) {
      return (
        <div className="matching-content">
          <CVAnalysis
            cvData={{ fileName: cvFile.name, ...analysisResults }}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      );
    }

    // Step 3: Job Matching Results
    if (currentStep === 3 && matchResults.length > 0) {
      return (
        <div className="results-section">
          <div className="results-header text-center mb-4">
            <h3 className="fw-bold" style={{ color: "#22543d" }}>
              🎯 Top Job Matches for You
            </h3>
            <p className="text-muted">
              Based on your CV analysis, here are the best matching jobs
            </p>
          </div>

          {/* CV Summary Card - FIXED */}
          {analysisResults && (
            <div
              className="cv-summary-card mb-4 p-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34, 84, 61, 0.05) 0%, rgba(47, 133, 90, 0.05) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(34, 84, 61, 0.15)",
              }}
            >
              <h6 className="fw-bold mb-3" style={{ color: "#22543d" }}>
                📄 Your CV Summary
              </h6>
              <div className="row g-3">
                {/* HAPUS Type dan Match Score */}
                <div className="col-md-6">
                  <small className="text-muted d-block">Skills Found</small>
                  <span
                    className="fw-bold"
                    style={{ color: "#22543d", fontSize: "1rem" }}
                  >
                    {analysisResults.skillsFound?.length || 0} skills
                  </span>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Experience</small>
                  <span
                    className="fw-bold"
                    style={{ color: "#22543d", fontSize: "1rem" }}
                  >
                    {analysisResults.experienceLevel || "Fresh Graduate"}
                  </span>
                </div>
              </div>

              {/* Skills List */}
              {analysisResults.skillsFound &&
                analysisResults.skillsFound.length > 0 && (
                  <div className="mt-3">
                    <small className="text-muted d-block mb-2">
                      Detected Skills:
                    </small>
                    <div className="d-flex flex-wrap gap-2">
                      {analysisResults.skillsFound.map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge"
                          style={{
                            background: "#e2e8f0",
                            color: "#4a5568",
                            fontSize: "0.75rem",
                            padding: "0.3rem 0.6rem",
                            fontWeight: "500",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Job Matches - PERBAIKI MATCH SCORE SIZE & HAPUS SAVE JOB */}
          <div className="job-matches">
            {matchResults.map((job, index) => (
              <div
                key={index}
                className="job-match-card card mb-3 shadow-sm"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                }}
              >
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    {/* Match Score Circle - PERBESAR 4X */}
                    <div className="col-auto">
                      <div
                        className="score-circle"
                        style={{
                          width: "120px", // 4x dari 70px
                          height: "120px",
                          borderRadius: "50%",
                          background: `conic-gradient(#22543d ${
                            job.matchScore * 3.6
                          }deg, #e2e8f0 0deg)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "100px", // 4x dari 56px
                            height: "100px",
                            borderRadius: "50%",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                          }}
                        >
                          <span
                            className="fw-bold"
                            style={{ color: "#22543d", fontSize: "2.5rem" }} // 4x dari 1.3rem
                          >
                            {job.matchScore}%
                          </span>
                          <small
                            style={{ fontSize: "0.9rem", color: "#64748b" }}
                          >
                            {" "}
                            {/* 4x dari 0.65rem */}
                            match
                          </small>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <span
                          className="badge bg-secondary"
                          style={{ fontSize: "0.8rem" }}
                        >
                          #{index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="col">
                      <h5 className="fw-bold mb-2" style={{ color: "#1a202c" }}>
                        {job.title}
                      </h5>
                      <div className="text-muted small mb-2">
                        <span className="me-3">🏢 {job.company}</span>
                        <span>📍 {job.location}</span>
                      </div>

                      {/* Match Reasons */}
                      <div className="match-reasons">
                        <h6
                          className="small fw-bold mb-2"
                          style={{ color: "#22543d" }}
                        >
                          Why this matches:
                        </h6>
                        <ul className="list-unstyled small mb-0">
                          {job.matchReasons &&
                            job.matchReasons.map((reason, idx) => (
                              <li
                                key={idx}
                                className="mb-1"
                                style={{ color: "#4a5568" }}
                              >
                                <span style={{ color: "#22543d" }}>✓</span>{" "}
                                {reason}
                              </li>
                            ))}
                        </ul>
                      </div>

                      {/* Job Actions - HAPUS SAVE JOB */}
                      <div className="job-actions mt-3">
                        <button
                          onClick={() => handleViewJobDetails(job)} // FIXED
                          className="btn btn-sm"
                          style={{
                            background: "#22543d",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1.5rem",
                            borderRadius: "6px",
                            fontWeight: "600",
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="results-actions text-center mt-4">
            <button
              onClick={handleReset}
              className="btn me-3"
              style={{
                background: "white",
                border: "2px solid #22543d",
                color: "#22543d",
                padding: "0.6rem 1.5rem",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            >
              🔄 Upload New CV
            </button>
            <button
              onClick={handleViewAllJobs}
              className="btn"
              style={{
                background: "#22543d",
                color: "white",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            >
              📋 View All Jobs
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // Loading state untuk auth
  if (authLoading) {
    return (
      <div className="job-matching-page">
        <div className="text-center py-5">
          <LoadingSpinner />
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`job-matching-page ${isAuthenticated ? "authenticated" : ""}`}
    >
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Welcome Message for Authenticated User */}
            {isAuthenticated && user && (
              <div className="welcome-message mb-4">
                <div className="alert alert-success d-flex align-items-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="me-2"
                  >
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <strong>Welcome back, {user.full_name}!</strong>
                    <br />
                    <small>
                      Ready to find your perfect job match with AI-powered
                      analysis
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Authentication Notice for Non-authenticated Users */}
            {!isAuthenticated && (
              <div className="auth-notice mb-4">
                <div className="alert alert-info d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="me-3"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 8V12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="16" r="1" fill="currentColor" />
                    </svg>
                    <div>
                      <h6 className="mb-0">Please login to continue</h6>
                      <small>
                        You need to be logged in to upload CV and get job
                        matches
                      </small>
                    </div>
                  </div>
                  <button
                    onClick={openAuthModal}
                    className="btn btn-sm"
                    style={{
                      background: "#22543d",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Login Now
                  </button>
                </div>
              </div>
            )}

            {/* Steps Indicator */}
            <div className="steps-indicator mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div
                  className={`step ${currentStep >= 1 ? "active" : ""} ${
                    currentStep > 1 ? "completed" : ""
                  }`}
                >
                  <div className="step-number">1</div>
                  <span>Upload CV</span>
                </div>
                <div className="step-connector"></div>
                <div
                  className={`step ${currentStep >= 2 ? "active" : ""} ${
                    currentStep > 2 ? "completed" : ""
                  }`}
                >
                  <div className="step-number">2</div>
                  <span>Analisis CV</span>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
                  <div className="step-number">3</div>
                  <span>Job Matching</span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            {renderStepContent()}
          </div>
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
};

export default JobMatching;
