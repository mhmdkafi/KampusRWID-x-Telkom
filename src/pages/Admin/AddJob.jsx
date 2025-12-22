import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createJob,
  updateJob,
  getJobById,
} from "../../services/api/matchingAPI";
import "./AddJob.css";

const AddJob = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "Full-time",
    salary: "",
    description: "",
    requirements: "",
    responsibilities: "",
    skills: "",
    application_url: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchJobData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]); // Add dependencies

  const fetchJobData = async () => {
    try {
      setFetchingJob(true);
      const job = await getJobById(id);

      setFormData({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        job_type: job.job_type || "Full-time",
        salary: job.salary || "",
        description: job.description || "",
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : "",
        responsibilities: Array.isArray(job.responsibilities)
          ? job.responsibilities.join("\n")
          : "",
        skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
        application_url: job.application_url || "",
        image_url: job.image_url || "",
      });
    } catch (error) {
      console.error("Error fetching job:", error);
      alert("Failed to load job data");
      navigate("/admin/jobs");
    } finally {
      setFetchingJob(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        requirements: formData.requirements
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r),
        responsibilities: formData.responsibilities
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r),
      };

      if (isEditMode) {
        await updateJob(id, jobData);
        alert("Job updated successfully!");
      } else {
        await createJob(jobData);
        alert("Job added successfully!");
      }

      navigate("/admin/jobs");
    } catch (error) {
      console.error("Error saving job:", error);
      alert(`Failed to ${isEditMode ? "update" : "add"} job: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="add-job-page">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-job-page">
      <div className="container py-5">
        <div className="page-header">
          <button onClick={() => navigate("/admin/jobs")} className="back-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </button>
          <h1>{isEditMode ? "Edit Job" : "Add New Job"}</h1>
          <p className="text-muted">
            {isEditMode
              ? "Update job listing details"
              : "Fill in the form to add a new job"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                Job Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Frontend Developer"
              />
            </div>

            <div className="form-group">
              <label>
                Company <span className="required">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="e.g., Tech Company"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Jakarta, Indonesia"
              />
            </div>

            <div className="form-group">
              <label>Job Type</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary Range</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., Rp 8.000.000 - 12.000.000"
              />
            </div>

            <div className="form-group">
              <label>Application URL</label>
              <input
                type="url"
                name="application_url"
                value={formData.application_url}
                onChange={handleChange}
                placeholder="https://example.com/apply"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Company Logo URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe the job role..."
            />
          </div>

          <div className="form-group">
            <label>Requirements (one per line)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="5"
              placeholder="e.g.,&#10;Bachelor's degree in Computer Science&#10;3+ years experience"
            />
          </div>

          <div className="form-group">
            <label>Responsibilities (one per line)</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows="5"
              placeholder="e.g.,&#10;Develop web applications&#10;Work with team"
            />
          </div>

          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, MongoDB"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/admin/jobs")}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" />
                  {isEditMode ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{isEditMode ? "Update Job" : "Add Job"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
