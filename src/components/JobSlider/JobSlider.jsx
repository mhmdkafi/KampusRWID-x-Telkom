import React, { useState, useEffect } from "react";
import JobCard from "../JobCard/JobCard";
import { getJobs } from "../../services/api/matchingAPI";
import "./JobSlider.css";

const JobSlider = () => {
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

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? jobs.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === jobs.length - 1 ? 0 : currentIndex + 1);
  };

  if (isLoading) {
    return (
      <div className="job-slider-container">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading jobs...</span>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="job-slider-container">
        <div className="text-center py-5">
          <p className="text-muted">No jobs available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-slider-container">
      {/* Header */}
      <div className="slider-header">
        <h3 className="slider-title">Rekomendasi Pekerjaan Untuk Anda</h3>
        <p className="slider-subtitle">
          <span className="job-count">{jobs.length}</span> peluang karir menanti
        </p>
      </div>

      {/* Main Slider Content */}
      <div className="slider-main-container">
        {/* Left Navigation */}
        <button
          onClick={goToPrevious}
          className="slider-nav-btn slider-nav-left"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <span>‹</span>
        </button>

        {/* Job Card Display */}
        <div className="slider-content">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {jobs.map((job, index) => (
              <div key={job.id || index} className="slider-item">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Navigation */}
        <button
          onClick={goToNext}
          className="slider-nav-btn slider-nav-right"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <span>›</span>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="slider-dots">
        {jobs.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`slider-dot ${index === currentIndex ? "active" : ""}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default JobSlider;
