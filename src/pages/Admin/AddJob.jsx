import React, { useState } from "react";
import { createJob } from "../../services/api/matchingAPI";
import "./AddJob.css";

function AddJob() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location || null,
        skills: formData.skills
          ? formData.skills.split(",").map((s) => s.trim())
          : [],
        description: formData.description || null,
      };

      await createJob(jobData);
      setMessage("✅ Job berhasil ditambahkan!");

      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        skills: "",
        description: "",
      });

      // Auto-hide message setelah 3 detik
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-job-container">
      <h2>Tambah Lowongan Pekerjaan</h2>

      {message && (
        <div
          className={
            message.includes("Error") ? "message error" : "message success"
          }
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Judul Pekerjaan: *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Frontend Developer"
            required
          />
        </div>

        <div className="form-group">
          <label>Perusahaan: *</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Tech Corp"
            required
          />
        </div>

        <div className="form-group">
          <label>Lokasi:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Jakarta, Remote"
          />
        </div>

        <div className="form-group">
          <label>Skills (pisahkan dengan koma):</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, PostgreSQL"
          />
        </div>

        <div className="form-group">
          <label>Deskripsi:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Deskripsi pekerjaan..."
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Menambahkan..." : "Tambah Job"}
        </button>
      </form>
    </div>
  );
}

export default AddJob;
