import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import CVUpload from '../../components/cv/CVUpload';
import CVAnalysis from '../../components/cv/CVAnalysis';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { jobsData } from '../../data/jobData';
import './JobMatching.css';

const JobMatching = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cvData, setCvData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCVUpload = async (file) => {
    setIsLoading(true);
    try {
      // Simulate CV processing
      setTimeout(() => {
        setCvData({
          fileName: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          type: file.type
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
                    <button className="btn btn-primary btn-sm">
                      View Details
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      Save Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="results-actions">
              <button className="btn btn-outline-primary" onClick={handleReset}>
                🔄 Analyze Another CV
              </button>
              <button className="btn btn-primary">
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
      <Header />
      
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
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
    </div>
  );
};

export default JobMatching;