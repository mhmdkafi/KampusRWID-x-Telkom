import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import "./ManageCVs.css";

const ManageCVs = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);

      // Fetch CVs with specific columns
      const { data, error } = await supabase
        .from("cvs")
        .select("id, user_id, filename, storage_path, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format CV data
      const formattedCVs = data.map((cv) => ({
        id: cv.id,
        userId: cv.user_id,
        userEmail: `user-${cv.user_id.substring(0, 8)}@...`, // Show partial ID
        filename: cv.filename,
        storagePath: cv.storage_path,
        uploadedAt: new Date(cv.created_at).toLocaleDateString(),
      }));

      setCvs(formattedCVs);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      alert("Failed to fetch CVs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cv) => {
    try {
      console.log("Downloading CV:", cv.storagePath);

      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from("cvs")
        .download(cv.storagePath);

      if (error) {
        console.error("Storage error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data received from storage");
      }

      console.log("Downloaded data:", data);

      // Create blob URL and download
      const blob = new Blob([data], { type: data.type || "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = cv.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Download complete");
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert("Failed to download CV: " + (error.message || "Unknown error"));
    }
  };

  const handleView = async (cv) => {
    try {
      // Get public URL for viewing
      const { data } = supabase.storage
        .from("cvs")
        .getPublicUrl(cv.storagePath);

      if (data?.publicUrl) {
        window.open(data.publicUrl, "_blank");
      } else {
        throw new Error("Could not generate public URL");
      }
    } catch (error) {
      console.error("Error viewing CV:", error);
      alert("Failed to view CV: " + error.message);
    }
  };

  const handleDelete = async (cv) => {
    if (!window.confirm(`Are you sure you want to delete ${cv.filename}?`)) {
      return;
    }

    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from("cvs")
        .remove([cv.storagePath]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("cvs")
        .delete()
        .eq("id", cv.id);

      if (dbError) {
        console.error("Database deletion error:", dbError);
        throw dbError;
      }

      alert("CV deleted successfully");
      fetchCVs(); // Refresh list
    } catch (error) {
      console.error("Error deleting CV:", error);
      alert("Failed to delete CV: " + error.message);
    }
  };

  const filteredCVs = cvs.filter(
    (cv) =>
      cv.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-cvs">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-cvs">
      <div className="container py-5">
        {/* Header */}
        <div className="page-header">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
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
              Back to Dashboard
            </button>
            <h1>Manage CVs</h1>
            <p className="text-muted">View and download uploaded CVs</p>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by filename or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="cvs-stats mb-4">
          <div className="stat-item">
            <strong>{cvs.length}</strong> Total CVs
          </div>
          <div className="stat-item">
            <strong>{filteredCVs.length}</strong> Filtered Results
          </div>
        </div>

        {/* CVs Table */}
        <div className="cvs-table-wrapper">
          <table className="cvs-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>User</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCVs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No CVs found
                  </td>
                </tr>
              ) : (
                filteredCVs.map((cv) => (
                  <tr key={cv.id}>
                    <td>
                      <div className="filename-cell">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {cv.filename}
                      </div>
                    </td>
                    <td>{cv.userEmail}</td>
                    <td>{cv.uploadedAt}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleView(cv)}
                          className="btn-action btn-view"
                          title="View"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownload(cv)}
                          className="btn-action btn-download"
                          title="Download"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(cv)}
                          className="btn-action btn-delete"
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageCVs;
