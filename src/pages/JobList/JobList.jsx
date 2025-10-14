import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import AuthModal from '../../components/AuthModal/AuthModal';
import { jobsData } from '../../data/jobData';
import './JobList.css';

const JobList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(9);
  const [showDetail, setShowDetail] = useState(false);

  // Authentication states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState('');

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

  // Load jobs data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const jobsWithScores = jobsData.map(job => ({
        ...job,
        matchScore: isAuthenticated ? Math.floor(Math.random() * 30) + 70 : null
      }));
      setJobs(jobsWithScores);
      setFilteredJobs(jobsWithScores);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated]);

  const handleViewJobDetails = useCallback((job) => {
    setIsLoadingDetail(true);
    
    // Simulate loading detail
    setTimeout(() => {
      // Enhanced job data with more details
      const enhancedJob = {
        ...job,
        description: `Kami sedang mencari ${job.title} yang berpengalaman untuk bergabung dengan tim ${job.company}. Posisi ini memerlukan kemampuan teknis yang kuat dan passion untuk berkembang bersama perusahaan.`,
        requirements: [
          'Minimum 2-3 tahun pengalaman di bidang terkait',
          'Menguasai teknologi dan tools yang relevan',
          'Kemampuan komunikasi yang baik',
          'Mampu bekerja dalam tim',
          'Bersedia bekerja dengan target dan deadline'
        ],
        responsibilities: [
          'Mengembangkan dan memelihara sistem/produk perusahaan',
          'Berkolaborasi dengan tim untuk mencapai target',
          'Melakukan analisis dan troubleshooting',
          'Berkontribusi dalam pengembangan strategi tim',
          'Menjaga kualitas dan standar kerja yang tinggi'
        ],
        benefits: [
          'Gaji kompetitif sesuai pengalaman',
          'Asuransi kesehatan',
          'Tunjangan transport dan makan',
          'Pelatihan dan pengembangan karir',
          'Lingkungan kerja yang supportif'
        ],
        companyInfo: {
          about: `${job.company} adalah perusahaan yang bergerak di bidang teknologi dan inovasi. Kami berkomitmen untuk memberikan solusi terbaik bagi klien dan menciptakan lingkungan kerja yang inspiratif.`,
          size: '100-500 karyawan',
          industry: 'Technology',
          website: 'https://company.com'
        },
        applicationUrl: 'https://www.jobstreet.co.id/job/12345',
        matchAnalysis: isAuthenticated ? {
          skillsMatch: Math.floor(Math.random() * 20) + 80,
          experienceMatch: Math.floor(Math.random() * 25) + 75,
          locationMatch: 90,
          salaryMatch: Math.floor(Math.random() * 15) + 85,
          matchingSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          missingSkills: ['Docker', 'Kubernetes'],
          recommendations: [
            'Anda memiliki skill yang sangat sesuai dengan posisi ini',
            'Pengalaman Anda relevan dengan requirements',
            'Lokasi sesuai dengan preferensi Anda'
          ]
        } : null
      };
      
      setSelectedJob(enhancedJob);
      setShowDetail(true);
      setIsLoadingDetail(false);
      
      // Update URL without page reload
      window.history.pushState({}, '', `/job-list/${job.id}`);
    }, 800);
  }, [isAuthenticated]);

  // Check if there's a job ID in URL params
  useEffect(() => {
    if (id && jobs.length > 0) {
      const job = jobs.find(job => job.id === parseInt(id));
      if (job) {
        handleViewJobDetails(job);
      }
    }
  }, [id, jobs, handleViewJobDetails]);

  // Filter and search jobs
  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCompany = !companyFilter || job.company.toLowerCase().includes(companyFilter.toLowerCase());
      
      return matchesSearch && matchesLocation && matchesCompany;
    });

    // Sort jobs
    switch (sortBy) {
      case 'matchScore':
        filtered = filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'company':
        filtered = filtered.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case 'location':
        filtered = filtered.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case 'title':
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobs, searchTerm, locationFilter, companyFilter, sortBy]);

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

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedJob(null);
    window.history.pushState({}, '', '/job-list');
  };

  const handleSaveJob = (job) => {
    if (!isAuthenticated) {
      openAuthModal('Silakan login untuk menyimpan pekerjaan ke wishlist');
      return;
    }

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

  const handleApplyJob = (job) => {
    if (!isAuthenticated) {
      openAuthModal('Silakan login terlebih dahulu sebelum melamar pekerjaan');
      return;
    }

    if (job.applicationUrl) {
      window.open(job.applicationUrl, '_blank');
    } else {
      alert('Link aplikasi tidak tersedia');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCompanyFilter('');
    setSortBy('relevance');
  };

  // Get unique locations and companies for filters
  const uniqueLocations = [...new Set(jobs.map(job => job.location))];
  const uniqueCompanies = [...new Set(jobs.map(job => job.company))];

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="job-list-page">
      <Header 
        onAuthClick={() => openAuthModal()} 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="job-list-container">
        <div className="job-list-layout">
          {/* Job List Section */}
          <div className={`job-list-section ${showDetail ? 'with-detail' : ''}`}>
            {/* Page Header */}
            <div className="page-header">
              <h1>🔍 Cari Pekerjaan</h1>
              <p>Temukan pekerjaan impian Anda dari ribuan lowongan yang tersedia</p>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
              <div className="filters-row">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari pekerjaan, perusahaan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">Semua Lokasi</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="">Semua Perusahaan</option>
                  {uniqueCompanies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
                <button className="reset-btn" onClick={clearFilters}>
                  Reset
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="results-summary">
              Menampilkan {currentJobs.length} dari {filteredJobs.length} pekerjaan
              {!isAuthenticated && (
                <div className="login-notice">
                  💡 Login untuk melihat skor kecocokan dengan profil Anda
                </div>
              )}
            </div>

            {/* Job List */}
            {isLoading ? (
              <div className="loading-container">
                <LoadingSpinner />
                <p>Memuat daftar pekerjaan...</p>
              </div>
            ) : (
              <>
                <div className="job-cards-container">
                  {currentJobs.length > 0 ? (
                    currentJobs.map(job => (
                      <div key={job.id} className="job-card" onClick={() => handleViewJobDetails(job)}>
                        <div className="job-card-header">
                          <div className="company-logo">
                            <span className="logo-text">
                              {job.company.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="job-info">
                            <h3 className="job-title">{job.title}</h3>
                            <p className="company-name">{job.company} ✓</p>
                          </div>
                          <button 
                            className="save-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveJob(job);
                            }}
                          >
                            ♡
                          </button>
                        </div>
                        
                        <div className="job-details">
                          <div className="detail-item">
                            <span className="icon">👤</span>
                            <span>Penuh waktu</span>
                          </div>
                          <div className="detail-item">
                            <span className="icon">📍</span>
                            <span>{job.location}</span>
                          </div>
                          <div className="detail-item">
                            <span className="icon">💼</span>
                            <span>Min. {Math.floor(Math.random() * 3) + 1} tahun</span>
                          </div>
                          <div className="detail-item">
                            <span className="icon">💰</span>
                            <span>{job.salary || 'Negotiable'}</span>
                          </div>
                        </div>

                        <div className="job-footer">
                          <span className="hot-badge">Pelamar Masih Sedikit</span>
                          <span className="posted-time">
                            {Math.floor(Math.random() * 30) + 1}j lalu
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <h4>😔 Tidak ada pekerjaan ditemukan</h4>
                      <p>Coba ubah filter pencarian Anda</p>
                      <button className="btn-primary" onClick={clearFilters}>
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button 
                          key={pageNum} 
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => paginate(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Job Detail Section */}
          {showDetail && (
            <div className="job-detail-section">
              <div className="job-detail-header">
                <button className="back-btn" onClick={handleCloseDetail}>
                  ← Kembali ke Daftar
                </button>
              </div>

              {isLoadingDetail ? (
                <div className="loading-container">
                  <LoadingSpinner />
                  <p>Memuat detail pekerjaan...</p>
                </div>
              ) : selectedJob ? (
                <div className="job-detail-content">
                  {/* Job Header */}
                  <div className="detail-header">
                    <div className="detail-title-section">
                      <h2>{selectedJob.title}</h2>
                      <h5>{selectedJob.company}</h5>
                    </div>
                    {selectedJob.matchScore && (
                      <div className="match-score">
                        <div className="score-circle">
                          {selectedJob.matchScore}%
                        </div>
                        <small>Match</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="detail-meta">
                    <span>📍 {selectedJob.location}</span>
                    <span>💰 {selectedJob.salary}</span>
                    <span>📅 Full Time</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="detail-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => handleApplyJob(selectedJob)}
                    >
                      🚀 Lamar Pekerjaan
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleSaveJob(selectedJob)}
                    >
                      💾 Simpan
                    </button>
                  </div>

                  {/* Job Sections */}
                  <div className="detail-section">
                    <h5>📋 Deskripsi Pekerjaan</h5>
                    <p>{selectedJob.description}</p>
                  </div>

                  <div className="detail-section">
                    <h5>📌 Requirements</h5>
                    <ul>
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h5>🎯 Tanggung Jawab</h5>
                    <ul>
                      {selectedJob.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h5>🎁 Benefits</h5>
                    <ul>
                      {selectedJob.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Company Info */}
                  <div className="detail-section company-section">
                    <h5>🏢 Tentang Perusahaan</h5>
                    <h6>{selectedJob.company}</h6>
                    <p>{selectedJob.companyInfo.about}</p>
                    <div className="company-details">
                      <p><strong>Ukuran:</strong> {selectedJob.companyInfo.size}</p>
                      <p><strong>Industri:</strong> {selectedJob.companyInfo.industry}</p>
                    </div>
                  </div>

                  {/* Login Notice for Non-authenticated Users */}
                  {!isAuthenticated && (
                    <div className="auth-notice">
                      <h6>💡 Dapatkan Lebih Banyak</h6>
                      <p>Login untuk melihat analisis kecocokan dengan CV Anda</p>
                      <button 
                        className="btn-primary"
                        onClick={() => openAuthModal()}
                      >
                        Login Sekarang
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal}
        message={authMessage}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default JobList;