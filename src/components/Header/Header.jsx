import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../AuthModal/AuthModal";
import "./Header.css";

function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          JobMatch AI
        </Link>

        <nav className="nav">
          <Link to="/jobs">Jobs</Link>
          <Link to="/matching">Job Matching</Link>
          {isAdmin() && <Link to="/admin/add-job">Admin Panel</Link>}
          {isAdmin() && <Link to="/admin/accuracy">Accuracy Test</Link>}

          {user ? (
            <div className="user-menu">
              <span className="user-email">{user.email}</span>
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
