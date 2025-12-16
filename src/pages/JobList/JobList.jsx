import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import AuthModal from "../../components/AuthModal/AuthModal";
import { getJobs } from "../../services/api/matchingAPI";
import JobCard from "../../components/JobCard/JobCard";
import "./JobList.css";

const JobList = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(9);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAuthenticated = !!user;

  // OPTIMASI 1: Load jobs hanya sekali, bukan setiap user berubah
  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsLoading(true);
      try {
        console.time("⏱️ Jobs fetch");
        const jobsFromDB = await getJobs(user?.id);
        console.timeEnd("⏱️ Jobs fetch");

        if (isMounted) {
          setJobs(jobsFromDB);
        }
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []); // Hapus dependency user

  // OPTIMASI 2: Gunakan useMemo untuk filtering (hanya kalkulasi ulang saat dependencies berubah)
  const filteredJobs = useMemo(() => {
    console.time("⏱️ Filter jobs");
    let result = jobs;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchLower) ||
          job.company?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower)
      );
    }

    if (locationFilter) {
      result = result.filter((job) => job.location === locationFilter);
    }

    if (companyFilter) {
      result = result.filter((job) => job.company === companyFilter);
    }

    // Sorting
    switch (sortBy) {
      case "salary-high":
        result = [...result].sort(
          (a, b) => (b.salaryRange || 0) - (a.salaryRange || 0)
        );
        break;
      case "salary-low":
        result = [...result].sort(
          (a, b) => (a.salaryRange || 0) - (b.salaryRange || 0)
        );
        break;
      case "match-score":
        result = [...result].sort(
          (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
        );
        break;
      case "recent":
        result = [...result].sort(
          (a, b) => new Date(b.posted || 0) - new Date(a.posted || 0)
        );
        break;
      default:
        break;
    }

    console.timeEnd("⏱️ Filter jobs");
    return result;
  }, [jobs, searchTerm, locationFilter, companyFilter, sortBy]);

  // OPTIMASI 3: Memoize unique values
  const uniqueLocations = useMemo(
    () => [...new Set(jobs.map((job) => job.location))].filter(Boolean),
    [jobs]
  );

  const uniqueCompanies = useMemo(
    () => [...new Set(jobs.map((job) => job.company))].filter(Boolean),
    [jobs]
  );

  const handleViewJobDetails = useCallback(
    (job) => {
      // Navigate ke halaman detail terpisah
      navigate(`/jobs/${job.id}`);
    },
    [navigate]
  );

  // Check URL params for job detail
  useEffect(() => {
    const jobIdFromUrl = searchParams.get("id");
    if (jobIdFromUrl && jobs.length > 0) {
      const job = jobs.find((j) => j.id === parseInt(jobIdFromUrl));
      if (job) {
        handleViewJobDetails(job);
      }
    }
  }, [searchParams, jobs, handleViewJobDetails]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, companyFilter, sortBy]);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleSaveJob = (job) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    alert(`Job "${job.title}" saved to your favorites!`);
  };

  const handleApplyJob = (job) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    navigate("/matching");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setCompanyFilter("");
    setSortBy("relevance");
  };

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="job-list-page">
        <div className="text-center py-5">
          <LoadingSpinner />
          <p className="mt-3">Loading amazing job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-list-page">
      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3">
            <div className="filters-sidebar">
              <div className="filters-header">
                <h5>🔍 Filters</h5>
                <button onClick={clearFilters} className="btn btn-link btn-sm">
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="filter-section">
                <label>Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Location Filter */}
              <div className="filter-section">
                <label>Location</label>
                <select
                  className="form-select"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location, idx) => (
                    <option key={idx} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div className="filter-section">
                <label>Company</label>
                <select
                  className="form-select"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="">All Companies</option>
                  {uniqueCompanies.map((company, idx) => (
                    <option key={idx} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="filter-section">
                <label>Sort By</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="match-score">Match Score</option>
                  <option value="recent">Most Recent</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="results-count mt-3">
                <p className="text-muted mb-0">
                  <strong>{filteredJobs.length}</strong> jobs found
                </p>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="col-lg-9">
            {currentJobs.length === 0 ? (
              <div className="no-results text-center py-5">
                <h3>No jobs found</h3>
                <p className="text-muted">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn btn-primary mt-3">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="jobs-grid">
                  {currentJobs.map((job, index) => (
                    <div key={index} onClick={() => handleViewJobDetails(job)}>
                      <JobCard
                        job={job}
                        onSave={handleSaveJob}
                        onApply={handleApplyJob}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <nav>
                      <ul className="pagination justify-content-center">
                        <li
                          className={`page-item ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, index) => (
                          <li
                            key={index}
                            className={`page-item ${
                              currentPage === index + 1 ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
};

export default JobList;
