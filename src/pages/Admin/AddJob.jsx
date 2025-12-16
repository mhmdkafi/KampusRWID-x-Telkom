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
    salary: "",
    benefits: "",
    experience_required: "",
    job_type: "Full-time",
    image_url: "",
    requirements: "",
    responsibilities: "",
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
        salary: formData.salary || null,
        benefits: formData.benefits
          ? formData.benefits.split(",").map((b) => b.trim())
          : [],
        experience_required: formData.experience_required || null,
        job_type: formData.job_type || "Full-time",
        image_url: formData.image_url || null,
        requirements: formData.requirements
          ? formData.requirements.split("\n").filter((r) => r.trim())
          : [],
        responsibilities: formData.responsibilities
          ? formData.responsibilities.split("\n").filter((r) => r.trim())
          : [],
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
        salary: "",
        benefits: "",
        experience_required: "",
        job_type: "Full-time",
        image_url: "",
        requirements: "",
        responsibilities: "",
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
        <div className="form-row">
          <div className="form-group">
            <label>Judul Pekerjaan: *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Golang Backend Engineer"
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
              placeholder="e.g. PT. Kredit Utama Fintech Indonesia"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Lokasi:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Jakarta Utara, Jakarta Raya"
            />
          </div>

          <div className="form-group">
            <label>Tipe Pekerjaan:</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Gaji:</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. Rp 8.000.000 - Rp 12.000.000"
            />
          </div>

          <div className="form-group">
            <label>Pengalaman Dibutuhkan:</label>
            <input
              type="text"
              name="experience_required"
              value={formData.experience_required}
              onChange={handleChange}
              placeholder="e.g. Minimum 3 years Golang experience"
            />
          </div>
        </div>

        <div className="form-group">
          <label>URL Logo Perusahaan:</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="form-group">
          <label>Skills (pisahkan dengan koma):</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. Golang, Backend Development, Database, Cloud Computing, REST API"
          />
        </div>

        <div className="form-group">
          <label>Benefits (pisahkan dengan koma):</label>
          <input
            type="text"
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            placeholder="e.g. Medical, Miscellaneous allowance, Catering/Food"
          />
        </div>

        <div className="form-group">
          <label>Deskripsi:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="As a Golang Backend Engineer at PT. Kredit Utama Fintech Indonesia, you will be responsible for..."
          />
        </div>

        <div className="form-group">
          <label>Requirements (satu per baris):</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows="5"
            placeholder="Pengalaman Golang minimal 3 tahun&#10;Pemahaman arsitektur backend&#10;Pengalaman desain dan optimasi database"
          />
          <small className="form-help">Tulis satu requirement per baris</small>
        </div>

        <div className="form-group">
          <label>Responsibilities (satu per baris):</label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            rows="5"
            placeholder="Mengembangkan sistem backend menggunakan Golang&#10;Bekerja sama dengan tim frontend dan produk&#10;Mengoptimalkan performa aplikasi"
          />
          <small className="form-help">
            Tulis satu responsibility per baris
          </small>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Menambahkan..." : "Tambah Job"}
        </button>
      </form>
    </div>
  );
}

export default AddJob;
