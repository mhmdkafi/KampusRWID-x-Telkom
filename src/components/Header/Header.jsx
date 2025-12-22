import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../AuthModal/AuthModal";
import "./Header.css";

function Header() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Guard: Jangan render admin links kalau masih loading
  if (loading) {
    return (
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            JobMatch AI
          </Link>
          <nav className="nav">
            <span>Loading...</span>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
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
          JobMatch AI
        </Link>

        <nav className="nav">
          <Link to="/jobs" className={isActive("/jobs") ? "active" : ""}>
            Jobs
          </Link>
          <Link
            to="/matching"
            className={isActive("/matching") ? "active" : ""}
          >
            Job Matching
          </Link>

          {/* TAMBAH: Saved Jobs link (hanya muncul saat login) */}
          {user && (
            <Link
              to="/saved-jobs"
              className={`saved-jobs-link ${
                isActive("/saved-jobs") ? "active" : ""
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Saved Jobs
            </Link>
          )}

          {isAdmin() && (
            <div className="admin-dropdown">
              <button
                className="admin-menu-btn"
                onClick={() => setShowAdminMenu(!showAdminMenu)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m-9-9h6m6 0h6" />
                  <path d="m19 19-2-2m0 0 2-2m-2 2-2-2m2 2-2 2" />
                </svg>
                Admin Panel
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: showAdminMenu ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showAdminMenu && (
                <div className="admin-dropdown-menu">
                  <Link
                    to="/admin/dashboard"
                    className="dropdown-item"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/jobs"
                    className="dropdown-item"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    Manage Jobs
                  </Link>
                  <Link
                    to="/admin/users"
                    className="dropdown-item"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    <svg
                      width="18"
                      height="18"
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
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/cvs"
                    className="dropdown-item"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Manage CVs
                  </Link>
                  <Link
                    to="/admin/accuracy"
                    className="dropdown-item"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Accuracy Test
                  </Link>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="user-menu">
              <span className="user-email">{user.full_name}</span>
              {isAdmin() && <span className="admin-badge">Admin</span>}
              <button onClick={signOut} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="login-btn"
            >
              Login
            </button>
          )}
        </nav>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}

export default Header;
