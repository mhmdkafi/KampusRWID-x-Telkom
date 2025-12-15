import React, { useState } from 'react';
import './AccuracyDashboard.css';
import { accuracyTester } from '../../services/testing/accuracyTester';

const AccuracyDashboard = () => {
  const [isTestingRunning, setIsTestingRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const runAccuracyTest = async () => {
    setIsTestingRunning(true);
    setTestResults(null);
    
    try {
      console.log('🚀 Starting Accuracy Testing from Dashboard...');
      
      // Dynamic import untuk menghindari circular dependency
      const { cvAnalyzer } = await import('../../services/ml/cvAnalyzer');
      const { matchCalculator } = await import('../../services/ml/matchCalculator');
      
      const results = await accuracyTester.runAccuracyTests(cvAnalyzer, matchCalculator);
      setTestResults(results);
    } catch (error) {
      console.error('❌ Testing Error:', error);
      setTestResults({
        summary: { 
          overallAccuracy: 0, 
          totalTests: 0, 
          passedTests: 0, 
          failedTests: 0 
        },
        error: error.message
      });
    } finally {
      setIsTestingRunning(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return '#4CAF50'; // Green
    if (accuracy >= 60) return '#FF9800'; // Orange  
    return '#F44336'; // Red
  };

  const getAccuracyIcon = (accuracy) => {
    if (accuracy >= 80) return '🟢';
    if (accuracy >= 60) return '🟡';
    return '🔴';
  };

  return (
    <div className="accuracy-dashboard">
      <div className="dashboard-header">
        <h2>🎯 ML Model Accuracy Testing</h2>
        <p className="dashboard-subtitle">
          Test dan evaluasi akurasi sistem job matching dengan dataset yang sudah tervalidasi
        </p>
      </div>

      <div className="testing-controls">
        <button 
          onClick={runAccuracyTest} 
          disabled={isTestingRunning}
          className="test-button"
        >
          {isTestingRunning ? '⏳ Running Tests...' : '🧪 Run Accuracy Test'}
        </button>
        
        {isTestingRunning && (
          <div className="testing-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p>Menjalankan test pada Ground Truth Dataset...</p>
          </div>
        )}
      </div>

      {testResults && !testResults.error && (
        <div className="test-results">
          {/* Overall Summary */}
          <div className="results-summary">
            <div className="summary-card overall">
              <h3>Overall Accuracy</h3>
              <div className="accuracy-score" style={{color: getAccuracyColor(testResults.summary.overallAccuracy)}}>
                {getAccuracyIcon(testResults.summary.overallAccuracy)} {testResults.summary.overallAccuracy}%
              </div>
              <div className="test-count">
                {testResults.summary.passedTests}/{testResults.summary.totalTests} tests passed
              </div>
            </div>

            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Tests</span>
                <span className="stat-value">{testResults.summary.totalTests}</span>
              </div>
              <div className="stat-item success">
                <span className="stat-label">Passed</span>
                <span className="stat-value">{testResults.summary.passedTests}</span>
              </div>
              <div className="stat-item failure">
                <span className="stat-label">Failed</span>
                <span className="stat-value">{testResults.summary.failedTests}</span>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="detailed-metrics">
            <h3>📊 Detailed Performance Metrics</h3>
            <div className="metrics-grid">
              {Object.entries(testResults.detailedMetrics).map(([metric, value]) => {
                const accuracy = parseInt(value.replace('%', ''));
                return (
                  <div key={metric} className="metric-card">
                    <div className="metric-header">
                      <span className="metric-name">{metric}</span>
                      <span 
                        className="metric-value"
                        style={{color: getAccuracyColor(accuracy)}}
                      >
                        {getAccuracyIcon(accuracy)} {value}
                      </span>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{
                          width: `${accuracy}%`,
                          backgroundColor: getAccuracyColor(accuracy)
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations">
            <h3>💡 Improvement Recommendations</h3>
            <div className="recommendations-list">
              {testResults.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  {rec}
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Details */}
          <div className="details-toggle">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="toggle-button"
            >
              {showDetails ? '🔼 Hide Details' : '🔽 Show Detailed Results'}
            </button>
          </div>

          {/* Detailed Test Results */}
          {showDetails && (
            <div className="detailed-results">
              <h3>🔍 Individual Test Results</h3>
              <div className="results-table">
                <div className="table-header">
                  <div>Test ID</div>
                  <div>Status</div>
                  <div>CV Type</div>
                  <div>Job Match</div>
                  <div>Skill Score</div>
                  <div>Experience</div>
                  <div>Overall</div>
                </div>
                {testResults.detailedResults.map((result, index) => (
                  <div key={index} className="table-row">
                    <div className="test-id">{result.testId}</div>
                    <div className={`status ${result.passed ? 'passed' : 'failed'}`}>
                      {result.passed ? '✅ PASS' : '❌ FAIL'}
                    </div>
                    <div>{result.metrics.cvType ? '✅' : '❌'}</div>
                    <div>{result.metrics.jobMatch ? '✅' : '❌'}</div>
                    <div>{result.metrics.skillScore ? '✅' : '❌'}</div>
                    <div>{result.metrics.experience ? '✅' : '❌'}</div>
                    <div className="overall-score">
                      {Math.round(result.overallScore * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Info */}
          <div className="test-info">
            <p><strong>Test Duration:</strong> {testResults.summary.testDuration}</p>
            <p><strong>Timestamp:</strong> {new Date(testResults.summary.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}

      {testResults && testResults.error && (
        <div className="error-result">
          <h3>❌ Testing Error</h3>
          <p>{testResults.error}</p>
        </div>
      )}

      {/* Information Panel untuk Pemula */}
      <div className="info-panel">
        <h3>📚 Penjelasan untuk Pemula</h3>
        <div className="info-content">
          <div className="info-section">
            <h4>🎯 Apa itu Accuracy Testing?</h4>
            <p>
              Accuracy testing adalah cara mengukur seberapa akurat sistem AI/ML kita dalam memberikan prediksi. 
              Seperti ujian untuk robot - kita kasih soal yang sudah tahu jawabannya, lalu lihat berapa yang bisa dijawab benar.
            </p>
          </div>

          <div className="info-section">
            <h4>📊 Metrics yang Diukur:</h4>
            <ul>
              <li><strong>CV Type Detection:</strong> Akurasi mendeteksi jenis profesi (Developer, Sales, Marketing, Finance)</li>
              <li><strong>Job Matching:</strong> Akurasi merekomendasikan job yang tepat</li>
              <li><strong>Skill Score Range:</strong> Akurasi scoring kemampuan dalam range yang wajar</li>
              <li><strong>Experience Level:</strong> Akurasi mendeteksi level pengalaman (Junior, Senior, dll)</li>
            </ul>
          </div>

          <div className="info-section">
            <h4>🚦 Interpretasi Hasil:</h4>
            <ul>
              <li><span style={{color: '#4CAF50'}}>🟢 80%+ = Excellent</span> - Model sangat akurat</li>
              <li><span style={{color: '#FF9800'}}>🟡 60-79% = Good</span> - Model cukup baik, bisa diperbaiki</li>
              <li><span style={{color: '#F44336'}}>🔴 Under 60% = Needs Improvement</span> - Model perlu perbaikan serius</li>
            </ul>
          </div>

          <div className="info-section">
            <h4>⚡ Ground Truth Dataset:</h4>
            <p>
              Dataset berisi CV contoh yang sudah divalidasi manual oleh expert. 
              Seperti kunci jawaban ujian - kita tahu hasil yang benar untuk setiap CV test.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccuracyDashboard;