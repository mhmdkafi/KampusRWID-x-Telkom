import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import CVUpload from '../../components/cv/CVUpload';
import CVAnalysis from '../../components/cv/CVAnalysis';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import AuthModal from '../../components/AuthModal/AuthModal';
import { jobsData } from '../../data/jobData';
import './JobMatching.css';

const JobMatching = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cvData, setCvData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Authentication states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const openAuthModal = (message = '') => {
    setAuthMessage(message);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthMessage('');
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    closeAuthModal();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleCVUpload = async (file) => {
    if (!isAuthenticated) {
      openAuthModal('Silakan login terlebih dahulu untuk mengupload CV');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate CV processing
      setTimeout(() => {
        setCvData({
          fileName: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          type: file.type,
          uploadedBy: user?.email || 'user'
        });
        setCurrentStep(2);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error uploading CV:', error);
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    
    // Simulate job matching calculation
    const matches = jobsData.slice(0, 5).map((job, index) => ({
      ...job,
      matchScore: Math.floor(Math.random() * 30) + 70, // Random score 70-100
      matchReasons: [
        'Skills match detected',
        'Experience level aligned',
        'Location preference'
      ]
    })).sort((a, b) => b.matchScore - a.matchScore);
    
    setMatchResults(matches);
    setCurrentStep(3);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCvData(null);
    setAnalysisResults(null);
    setMatchResults([]);
  };

  const handleViewJobDetails = (job) => {
    console.log('View job details:', job);
    navigate(`/job-detail/${job.id}`);
  };

  const handleSaveJob = (job) => {
    if (!isAuthenticated) {
      openAuthModal('Silakan login untuk menyimpan pekerjaan ke wishlist');
      return;
    }

    // Save to wishlist logic
    const savedJobs = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isAlreadySaved = savedJobs.some(savedJob => savedJob.id === job.id);
    
    if (!isAlreadySaved) {
      savedJobs.push(job);
      localStorage.setItem('wishlist', JSON.stringify(savedJobs));
      alert('Pekerjaan berhasil disimpan ke wishlist!');
    } else {
      alert('Pekerjaan sudah ada di wishlist Anda');
    }
  };

  const handleViewAllJobs = () => {
    navigate('/job-list');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CVUpload onUpload={handleCVUpload} isLoading={isLoading} />;
      case 2:
        return (
          <CVAnalysis 
            cvData={cvData} 
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
      case 3:
        return (
          <div className="results-section">
            <div className="results-header">
              <h3>🎯 Job Matching Results</h3>
              <p>Kami menemukan {matchResults.length} pekerjaan yang cocok dengan profil Anda</p>
              {analysisResults && (
                <div className="analysis-summary">
                  <span className="summary-item">📊 Skill Score: {analysisResults.skillScore || 85}</span>
                  <span className="summary-item">💼 Experience: {analysisResults.experience || '3+ years'}</span>
                  {user && <span className="summary-item">👤 User: {user.name}</span>}
                </div>
              )}
            </div>
            
            <div className="job-matches">
              {matchResults.map((job, index) => (
                <div key={index} className="job-match-card">
                  <div className="match-score">
                    <div className="score-circle">
                      <span>{job.matchScore}%</span>
                    </div>
                    <small>Match Score</small>
                  </div>
                  
                  <div className="job-info">
                    <h4>{job.title}</h4>
                    <p className="company">{job.company}</p>
                    <p className="location">📍 {job.location}</p>
                    <p className="salary">💰 {job.salary}</p>
                    
                    <div className="match-reasons">
                      <h6>Why this matches:</h6>
                      <ul>
                        {job.matchReasons.map((reason, idx) => (
                          <li key={idx}>✓ {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="job-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewJobDetails(job)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleSaveJob(job)}
                    >
                      💾 Save Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="results-actions">
              <button className="btn btn-outline-primary" onClick={handleReset}>
                🔄 Analyze Another CV
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleViewAllJobs}
              >
                📋 View All Job Listings
              </button>
            </div>
          </div>
        );
      default:
        return <CVUpload onUpload={handleCVUpload} isLoading={isLoading} />;
    }
  };

  return (
    <div className="job-matching-page">
      <Header 
        onAuthClick={() => openAuthModal()} 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Welcome Message for Authenticated User */}
            {isAuthenticated && user && (
              <div className="welcome-message mb-4">
                <div className="alert alert-success d-flex align-items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="me-2">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <strong>Welcome back, {user.name}!</strong><br />
                    <small>Ready to find your perfect job match with AI-powered analysis</small>
                  </div>
                </div>
              </div>
            )}

            {/* Authentication Notice for Non-authenticated Users */}
            {!isAuthenticated && (
              <div className="auth-notice mb-4">
                <div className="alert alert-warning d-flex align-items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="me-2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <div>
                    <strong>Login Required</strong><br />
                    <small>Silakan login untuk menggunakan fitur Job Matching</small>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm ms-auto"
                    onClick={() => openAuthModal()}
                  >
                    Login
                  </button>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className="steps-indicator mb-5">
              <div className="d-flex justify-content-between align-items-center">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="step-number">
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  <span>Upload CV</span>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="step-number">
                    {currentStep > 2 ? '✓' : '2'}
                  </div>
                  <span>Analisis CV</span>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <span>Job Matching</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="matching-content">
              {isLoading ? (
                <div className="text-center py-5">
                  <LoadingSpinner />
                  <p className="mt-3">Memproses CV Anda...</p>
                </div>
              ) : (
                renderStepContent()
              )}
            </div>
          </div>
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal}
        message={authMessage}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default JobMatching;