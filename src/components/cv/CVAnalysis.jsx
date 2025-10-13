import React, { useState, useEffect } from 'react';
import './CVAnalysis.css';

const CVAnalysis = ({ cvData, onAnalysisComplete }) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    // Simulate analysis process
    const steps = [
      'Membaca file CV...',
      'Mengekstrak text...',
      'Menganalisis skills...',
      'Mendeteksi pengalaman...',
      'Menganalisis pendidikan...',
      'Menghitung skor...',
      'Menyelesaikan analisis...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStep(steps[stepIndex]);
        setAnalysisProgress(((stepIndex + 1) / steps.length) * 100);
        stepIndex++;
      } else {
        clearInterval(interval);
        setAnalysisComplete(true);
        setTimeout(() => {
          const mockResults = {
            skillScore: 85,
            experience: '3+ years',
            skills: ['JavaScript', 'React', 'Node.js', 'Python'],
            education: 'Bachelor Degree',
            matchedJobs: 5
          };
          onAnalysisComplete(mockResults);
        }, 1000);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [onAnalysisComplete]);

  return (
    <div className="cv-analysis-container">
      <div className="analysis-header">
        <h3>🔍 Menganalisis CV Anda</h3>
        <p>File: <strong>{cvData?.fileName}</strong></p>
      </div>

      <div className="analysis-content">
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {Math.round(analysisProgress)}% selesai
          </div>
        </div>

        <div className="current-step">
          {analysisComplete ? (
            <div className="analysis-done">
              <div className="success-icon">✅</div>
              <h4>Analisis Selesai!</h4>
              <p>CV Anda telah berhasil dianalisis dan siap untuk job matching</p>
            </div>
          ) : (
            <div className="step-info">
              <div className="step-icon">⚙️</div>
              <p>{currentStep}</p>
            </div>
          )}
        </div>

        <div className="analysis-preview">
          <h5>Preview Hasil Analisis:</h5>
          <div className="preview-items">
            <div className={`preview-item ${analysisProgress > 40 ? 'completed' : ''}`}>
              <span className="item-icon">💻</span>
              <span>Skills Detection</span>
            </div>
            <div className={`preview-item ${analysisProgress > 60 ? 'completed' : ''}`}>
              <span className="item-icon">💼</span>
              <span>Experience Analysis</span>
            </div>
            <div className={`preview-item ${analysisProgress > 80 ? 'completed' : ''}`}>
              <span className="item-icon">🎓</span>
              <span>Education Verification</span>
            </div>
            <div className={`preview-item ${analysisProgress > 95 ? 'completed' : ''}`}>
              <span className="item-icon">📊</span>
              <span>Score Calculation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVAnalysis;