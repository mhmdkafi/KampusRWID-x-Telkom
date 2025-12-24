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
  const { notification, showNotification, hideNotification } =
    useNotification();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "Full Time",
    salary: "",
    description: "",
    requirements: [],
    responsibilities: [],
    skills: [],
    image_url: "",
    application_url: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [responsibilityInput, setResponsibilityInput] = useState("");

  // Fetch job data if editing
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

      const job = result.job;
      setFormData({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        job_type: job.job_type || "Full Time",
        salary: job.salary || "",
        description: job.description || "",
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        responsibilities: Array.isArray(job.responsibilities)
          ? job.responsibilities
          : [],
        skills: Array.isArray(job.skills) ? job.skills : [],
        image_url: job.image_url || "",
        application_url: job.application_url || "",
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
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleAddRequirement = () => {
    if (
      requirementInput.trim() &&
      !formData.requirements.includes(requirementInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()],
      }));
      setRequirementInput("");
    }
  };

  const handleRemoveRequirement = (reqToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req !== reqToRemove),
    }));
  };

  const handleAddResponsibility = () => {
    if (
      responsibilityInput.trim() &&
      !formData.responsibilities.includes(responsibilityInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        responsibilities: [
          ...prev.responsibilities,
          responsibilityInput.trim(),
        ],
      }));
      setResponsibilityInput("");
    }
  };

  const handleRemoveResponsibility = (respToRemove) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter(
        (resp) => resp !== respToRemove
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

      const url = isEditMode ? `${API_URL}/jobs/${jobId}` : `${API_URL}/jobs`;

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
                placeholder="e.g. Backend Developer"
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
                  placeholder="e.g. Jakarta Raya (Hybrid)"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job_type">Job Type</label>
                <select
                  id="job_type"
                  name="job_type"
                  className="form-control"
                  value={formData.job_type}
                  onChange={handleInputChange}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary (IDR)</label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  className="form-control"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="10000000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="image_url">Company Logo URL</label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  className="form-control"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="form-group">
                <label htmlFor="application_url">Application URL</label>
                <input
                  type="url"
                  id="application_url"
                  name="application_url"
                  className="form-control"
                  value={formData.application_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/apply"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Job Description</h3>

            <div className="form-group">
              <label htmlFor="description">Description</label>
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
          </div>

          <div className="form-section">
            <h3>Requirements</h3>
            <div className="form-group">
              <label>Add Requirements (one by one)</label>
              <div className="skill-input-group">
                <input
                  type="text"
                  className="form-control"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                  placeholder="Type a requirement and press Enter or click Add"
                />
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="btn-add-skill"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="skills-list">
              {formData.requirements.length > 0 ? (
                formData.requirements.map((req, index) => (
                  <span key={index} className="skill-tag">
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req)}
                      className="remove-skill"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-muted">No requirements added yet</p>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Responsibilities</h3>
            <div className="form-group">
              <label>Add Responsibilities (one by one)</label>
              <div className="skill-input-group">
                <input
                  type="text"
                  className="form-control"
                  value={responsibilityInput}
                  onChange={(e) => setResponsibilityInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddResponsibility();
                    }
                  }}
                  placeholder="Type a responsibility and press Enter or click Add"
                />
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  className="btn-add-skill"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="skills-list">
              {formData.responsibilities.length > 0 ? (
                formData.responsibilities.map((resp, index) => (
                  <span key={index} className="skill-tag">
                    {resp}
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(resp)}
                      className="remove-skill"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-muted">No responsibilities added yet</p>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Required Skills</h3>

            <div className="form-group">
              <label>Add Skills (one by one)</label>
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
              {formData.skills.length > 0 ? (
                formData.skills.map((skill, index) => (
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
