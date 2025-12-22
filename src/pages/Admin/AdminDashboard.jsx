import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../config/supabase";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalCVs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total jobs - count only
      const { count: jobsCount, error: jobsError } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true });

      if (jobsError) throw jobsError;

      // Get total CVs - count only
      const { count: cvsCount, error: cvsError } = await supabase
        .from("cvs")
        .select("id", { count: "exact", head: true });

      if (cvsError) throw cvsError;

      // Get unique users from CVs table (workaround)
      const { data: cvsData, error: cvsDataError } = await supabase
        .from("cvs")
        .select("user_id");

      if (cvsDataError) throw cvsDataError;

      const uniqueUsers = new Set(cvsData?.map((cv) => cv.user_id) || []);

      setStats({
        totalJobs: jobsCount || 0,
        totalUsers: uniqueUsers.size || 0,
        totalCVs: cvsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set zeros on error to prevent undefined
      setStats({
        totalJobs: 0,
        totalUsers: 0,
        totalCVs: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container py-5">
        <div className="admin-header mb-4">
          <h1>Admin Dashboard</h1>
          <p className="text-muted">Manage your application</p>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon jobs">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.totalJobs}</h3>
                <p>Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon users">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Active Users</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon cvs">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.totalCVs}</h3>
                <p>Uploaded CVs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="mb-4">Quick Actions</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <Link to="/admin/jobs" className="action-card">
                <div className="action-icon">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3>Manage Jobs</h3>
                <p>Add, edit, or delete job listings</p>
              </Link>
            </div>

            <div className="col-md-4">
              <Link to="/admin/users" className="action-card">
                <div className="action-icon">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3>Manage Users</h3>
                <p>View and manage user accounts</p>
              </Link>
            </div>

            <div className="col-md-4">
              <Link to="/admin/cvs" className="action-card">
                <div className="action-icon">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3>Manage CVs</h3>
                <p>View and download uploaded CVs</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
