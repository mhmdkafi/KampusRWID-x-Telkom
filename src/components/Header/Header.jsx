import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../AuthModal/AuthModal";
import "./Header.css";

function Header() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
          JobMatch AI
        </Link>

        <nav className="nav">
          <Link to="/jobs">Jobs</Link>
          <Link to="/matching">Job Matching</Link>

          {/* TAMBAH: Saved Jobs link (hanya muncul saat login) */}
          {user && (
            <Link to="/saved-jobs" className="saved-jobs-link">
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

          {isAdmin() && <Link to="/admin/add-job">Admin Panel</Link>}
          {isAdmin() && <Link to="/admin/accuracy">Accuracy Test</Link>}

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
