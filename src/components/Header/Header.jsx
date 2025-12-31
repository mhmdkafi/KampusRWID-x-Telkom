import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../AuthModal/AuthModal";
import "./Header.css";

function Header() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate("/");
  };

  if (loading) {
    return (
      <header className="header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3">
            <Link to="/" className="logo">
              JobMatch AI
            </Link>
            <span className="text-muted">Loading...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="header">
        <div className="container-fluid px-lg-4">
          <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid px-0">
              {/* Logo */}
              <Link to="/" className="logo navbar-brand">
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
                <span className="d-none d-sm-inline">JobMatch AI</span>
                <span className="d-inline d-sm-none">JobMatch</span>
              </Link>

              {/* Mobile Toggle */}
              <button
                className="navbar-toggler border-0 shadow-none"
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              {/* Navigation */}
              <div
                className={`collapse navbar-collapse ${
                  mobileMenuOpen ? "show" : ""
                }`}
              >
                <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
                  {/* Jobs */}
                  <li className="nav-item">
                    <Link
                      to="/jobs"
                      className={`nav-link ${
                        isActive("/jobs") ? "active" : ""
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Jobs
                    </Link>
                  </li>

                  {/* Job Matching */}
                  <li className="nav-item">
                    <Link
                      to="/matching"
                      className={`nav-link ${
                        isActive("/matching") ? "active" : ""
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Job Matching
                    </Link>
                  </li>

                  {/* Saved Jobs */}
                  {user && (
                    <li className="nav-item">
                      <Link
                        to="/saved-jobs"
                        className={`nav-link saved-jobs-link ${
                          isActive("/saved-jobs") ? "active" : ""
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
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
                        <span>Saved Jobs</span>
                      </Link>
                    </li>
                  )}

                  {/* Admin Dropdown */}
                  {isAdmin() && (
                    <li className="nav-item dropdown">
                      <button
                        className="admin-menu-btn dropdown-toggle"
                        onClick={() => setShowAdminMenu(!showAdminMenu)}
                        aria-expanded={showAdminMenu}
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
                        </svg>
                        <span className="d-none d-md-inline">Admin Panel</span>
                        <span className="d-inline d-md-none">Admin</span>
                      </button>

                      {showAdminMenu && (
                        <div className="dropdown-menu dropdown-menu-end show admin-dropdown-menu">
                          <Link
                            to="/admin/dashboard"
                            className="dropdown-item"
                            onClick={() => {
                              setShowAdminMenu(false);
                              setMobileMenuOpen(false);
                            }}
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
                            onClick={() => {
                              setShowAdminMenu(false);
                              setMobileMenuOpen(false);
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="2"
                                y="7"
                                width="20"
                                height="14"
                                rx="2"
                                ry="2"
                              />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                            Manage Jobs
                          </Link>
                          <Link
                            to="/admin/users"
                            className="dropdown-item"
                            onClick={() => {
                              setShowAdminMenu(false);
                              setMobileMenuOpen(false);
                            }}
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
                            onClick={() => {
                              setShowAdminMenu(false);
                              setMobileMenuOpen(false);
                            }}
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
                        </div>
                      )}
                    </li>
                  )}

                  {/* User Menu / Login */}
                  {user ? (
                    <li className="nav-item">
                      <div className="user-menu d-flex align-items-center gap-2 flex-wrap">
                        <span className="user-email d-none d-lg-inline">
                          {user.full_name}
                        </span>
                        {isAdmin() && (
                          <span className="admin-badge">Admin</span>
                        )}
                        <button onClick={handleLogout} className="logout-btn">
                          Logout
                        </button>
                      </div>
                    </li>
                  ) : (
                    <li className="nav-item">
                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          setMobileMenuOpen(false);
                        }}
                        className="login-btn"
                      >
                        Login
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}

export default Header;
