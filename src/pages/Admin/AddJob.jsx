import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../config/supabase";
import Notification from "../../components/Notification/Notification";
import { useNotification } from "../../hooks/useNotification";
import "./AddJob.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api";

const AddJob = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const isEditMode = Boolean(jobId);
  const { notification, showNotification, hideNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    required_skills: [],
    experience_level: "Entry Level",
    status: "active",
  });

  const [skillInput, setSkillInput] = useState("");

  // Fetch job data if editing - gunakan useCallback untuk fix warning
  const fetchJobData = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch job");
      }

      setFormData({
        title: result.job.title || "",
        company: result.job.company || "",
        location: result.job.location || "",
        type: result.job.type || "Full-time",
        salary_min: result.job.salary_min || "",
        salary_max: result.job.salary_max || "",
        description: result.job.description || "",
        requirements: result.job.requirements || "",
        responsibilities: result.job.responsibilities || "",
        benefits: result.job.benefits || "",
        required_skills: result.job.required_skills || [],
        experience_level: result.job.experience_level || "Entry Level",
        status: result.job.status || "active",
      });
    } catch (error) {
      console.error("Error fetching job:", error);
      showNotification("Failed to load job data: " + error.message, "error");
      navigate("/admin/jobs");
    } finally {
      setLoading(false);
    }
  }, [jobId, navigate, showNotification]);

  useEffect(() => {
    if (isEditMode) {
      fetchJobData();
    }
  }, [isEditMode, fetchJobData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.company || !formData.location) {
      showNotification("Please fill in all required fields", "warning");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showNotification("You must be logged in", "error");
        navigate("/");
        return;
      }

      const url = isEditMode
        ? `${API_URL}/jobs/${jobId}`
        : `${API_URL}/jobs`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save job");
      }

      showNotification(
        isEditMode ? "Job updated successfully!" : "Job created successfully!",
        "success"
      );

      // Wait a bit to show notification before navigating
      setTimeout(() => {
        navigate("/admin/jobs");
      }, 1500);
    } catch (error) {
      console.error("Error saving job:", error);
      showNotification("Failed to save job: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="add-job">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-job">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      <div className="container py-5">
        <div className="page-header">
          <div>
            <button
              onClick={() => navigate("/admin/jobs")}
              className="back-btn"
            >
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
                ? "Update job posting details"
                : "Create a new job posting"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label htmlFor="title">
                Job Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Senior Frontend Developer"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">
                  Company <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-control"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  Location <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Jakarta, Indonesia"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Job Type</label>
                <select
                  id="type"
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="experience_level">Experience Level</label>
                <select
                  id="experience_level"
                  name="experience_level"
                  className="form-control"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salary_min">Minimum Salary (IDR)</label>
                <input
                  type="number"
                  id="salary_min"
                  name="salary_min"
                  className="form-control"
                  value={formData.salary_min}
                  onChange={handleInputChange}
                  placeholder="5000000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary_max">Maximum Salary (IDR)</label>
                <input
                  type="number"
                  id="salary_max"
                  name="salary_max"
                  className="form-control"
                  value={formData.salary_max}
                  onChange={handleInputChange}
                  placeholder="10000000"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Job Details</h3>

            <div className="form-group">
              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="5"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the role and what the candidate will be doing..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                className="form-control"
                rows="5"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="List the qualifications and requirements..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="responsibilities">Responsibilities</label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                className="form-control"
                rows="5"
                value={formData.responsibilities}
                onChange={handleInputChange}
                placeholder="What are the key responsibilities..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="benefits">Benefits</label>
              <textarea
                id="benefits"
                name="benefits"
                className="form-control"
                rows="4"
                value={formData.benefits}
                onChange={handleInputChange}
                placeholder="What benefits does the company offer..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Required Skills</h3>

            <div className="form-group">
              <label>Add Skills</label>
              <div className="skill-input-group">
                <input
                  type="text"
                  className="form-control"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter or click Add"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-add-skill"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="skills-list">
              {formData.required_skills.length > 0 ? (
                formData.required_skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="remove-skill"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-muted">No skills added yet</p>
              )}
            </div>
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditMode ? "Update Job" : "Create Job"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
