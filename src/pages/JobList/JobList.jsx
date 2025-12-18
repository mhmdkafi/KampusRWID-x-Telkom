import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import AuthModal from "../../components/AuthModal/AuthModal";
import { getJobs } from "../../services/api/matchingAPI";
import JobCard from "../../components/JobCard/JobCard";
import "./JobList.css";

const JobList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Temporary Filter States (not applied until Search button clicked)
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [jobTypeInput, setJobTypeInput] = useState("");

  // Applied Filter States (after Search button clicked)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedLocation, setAppliedLocation] = useState("");
  const [appliedCompany, setAppliedCompany] = useState("");
  const [appliedJobType, setAppliedJobType] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(5);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load jobs
  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const jobsFromDB = await getJobs(user?.id);
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
  }, [user?.id]);

  // Apply all filters when Search button is clicked
  const handleApplyFilters = () => {
    setAppliedSearch(searchInput);
    setAppliedLocation(locationInput);
    setAppliedCompany(companyInput);
    setAppliedJobType(jobTypeInput);
    setCurrentPage(1);
  };

  // Handle Enter key in any input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  // Filtering logic (uses APPLIED filters only)
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Search filter - PRIORITIZE TITLE FIRST
    if (appliedSearch) {
      const searchLower = appliedSearch.toLowerCase();

      // Separate into title matches and others
      const titleMatches = [];
      const otherMatches = [];

      result.forEach((job) => {
        const matchesTitle = job.title?.toLowerCase().includes(searchLower);
        const matchesCompany = job.company?.toLowerCase().includes(searchLower);
        const matchesDescription = job.description
          ?.toLowerCase()
          .includes(searchLower);

        if (matchesTitle) {
          titleMatches.push(job);
        } else if (matchesCompany || matchesDescription) {
          otherMatches.push(job);
        }
      });

      // Title matches come first, then others
      result = [...titleMatches, ...otherMatches];
    }

    // Location filter
    if (appliedLocation) {
      result = result.filter((job) =>
        job.location?.toLowerCase().includes(appliedLocation.toLowerCase())
      );
    }

    // Company filter
    if (appliedCompany) {
      const companyLower = appliedCompany.toLowerCase();
      result = result.filter((job) =>
        job.company?.toLowerCase().includes(companyLower)
      );
    }

    // Job Type filter
    if (appliedJobType) {
      result = result.filter((job) => job.job_type === appliedJobType);
    }

    // Sorting - ALWAYS APPLIED
    switch (sortBy) {
      case "recent":
        result = [...result].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "salary-high":
        result = [...result].sort((a, b) => {
          const salaryA = a.salary || 0;
          const salaryB = b.salary || 0;
          return salaryB - salaryA;
        });
        break;
      case "salary-low":
        result = [...result].sort((a, b) => {
          const salaryA = a.salary || 0;
          const salaryB = b.salary || 0;
          return salaryA - salaryB;
        });
        break;
      default:
        break;
    }

    return result;
  }, [
    jobs,
    appliedSearch,
    appliedLocation,
    appliedCompany,
    appliedJobType,
    sortBy,
  ]);

  // Memoize unique locations
  const uniqueLocations = useMemo(
    () => [...new Set(jobs.map((job) => job.location))].filter(Boolean),
    [jobs]
  );

  // Memoize unique job types
  const uniqueJobTypes = useMemo(
    () => [...new Set(jobs.map((job) => job.job_type))].filter(Boolean),
    [jobs]
  );

  const handleViewJobDetails = useCallback(
    (job) => {
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
  }, [appliedSearch, appliedLocation, appliedCompany, appliedJobType, sortBy]);

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleApplyJob = (job) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (job.application_url) {
      window.open(job.application_url, "_blank");
    } else {
      alert("Link aplikasi tidak tersedia untuk lowongan ini.");
    }
  };

  const clearFilters = () => {
    // Clear inputs
    setSearchInput("");
    setLocationInput("");
    setCompanyInput("");
    setJobTypeInput("");
    // Clear applied filters
    setAppliedSearch("");
    setAppliedLocation("");
    setAppliedCompany("");
    setAppliedJobType("");
    setSortBy("recent");
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

              {/* Search Input */}
              <div className="filter-section">
                <label>Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Job title, company..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Location Filter */}
              <div className="filter-section">
                <label>Location</label>
                <select
                  className="form-select"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
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
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter company name..."
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Job Type Filter */}
              <div className="filter-section">
                <label>Job Type</label>
                <select
                  className="form-select"
                  value={jobTypeInput}
                  onChange={(e) => setJobTypeInput(e.target.value)}
                >
                  <option value="">All Types</option>
                  {uniqueJobTypes.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
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
                  <option value="recent">Most Recent</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                </select>
              </div>

              {/* Apply Filters Button Only */}
              <div className="apply-filters-section mt-3">
                <button
                  className="btn-apply-filters"
                  onClick={handleApplyFilters}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M21 21L16.65 16.65"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="col-lg-9">
            {currentJobs.length === 0 ? (
              <div className="no-results text-center py-5">
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤷‍♂️</div>
                <h3>No jobs found</h3>
                <p className="text-muted">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                <div className="jobs-grid">
                  {currentJobs.map((job, index) => (
                    <div key={index} onClick={() => handleViewJobDetails(job)}>
                      <JobCard
                        job={job}
                        isActive={false}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode="login"
      />
    </div>
  );
};

export default JobList;
