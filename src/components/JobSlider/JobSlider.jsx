import React, { useState, useEffect } from 'react';
import JobCard from '../JobCard/JobCard';
import { jobsData } from '../../data/jobData';
import './JobSlider.css';

const JobSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === jobsData.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? jobsData.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === jobsData.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="job-slider-container">
      {/* Header */}
      <div className="slider-header">
        <h3 className="slider-title">
          Rekomendasi Pekerjaan Untuk Anda
        </h3>
        <p className="slider-subtitle">
          <span className="job-count">{jobsData.length}</span> peluang karir menanti
        </p>
      </div>

      {/* Main Slider Content */}
      <div className="slider-main-container">
        {/* Left Navigation */}
        <button 
          className="nav-button nav-left"
          onClick={goToPrevious}
          title="Previous Job"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Job Card Slider */}
        <div 
          className="job-card-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="job-card-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {jobsData.map((job, index) => (
              <div key={job.id} className="job-card-slide">
                <JobCard 
                  job={job} 
                  isActive={index === currentIndex}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Navigation */}
        <button 
          className="nav-button nav-right"
          onClick={goToNext}
          title="Next Job"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="slider-bottom-controls">
        {/* Dots Indicator */}
        <div className="slider-indicators">
          {jobsData.map((_, index) => (
            <button
              key={index}
              className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to job ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress & Counter */}
        <div className="progress-container">
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{
                width: `${((currentIndex + 1) / jobsData.length) * 100}%`
              }}
            />
          </div>
          <span className="progress-text">
            {currentIndex + 1} / {jobsData.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobSlider;