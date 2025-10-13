import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onAuthClick }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleHomeClick = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleJobMatchingClick = () => {
    navigate('/job-matching');
    setIsMobileMenuOpen(false);
  };

  const handleJobListClick = () => {
    navigate('/job-list');
    setIsMobileMenuOpen(false);
  };

  const handleAuthClick = () => {
    if (onAuthClick) {
      onAuthClick();
    }
    setIsMobileMenuOpen(false);
  };

  const handleWishlistClick = () => {
    navigate('/wishlist');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section" onClick={handleHomeClick}>
          <div className="logo-wrapper">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="white" stroke="white" strokeWidth="1.5"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="#22543d" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-main">KAMPUS RWID</span>
              <span className="logo-sub">Job Matching Platform</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <div className="nav-links">
            <button onClick={handleHomeClick} className="nav-item">
              <span>Home</span>
            </button>
            <button onClick={handleJobMatchingClick} className="nav-item">
              <span>Job Matching</span>
            </button>
            <button onClick={handleJobListClick} className="nav-item">
              <span>Job List & Detail</span>
            </button>
            <button onClick={handleWishlistClick} className="nav-item">
              <span>Wishlist</span>
            </button>
          </div>
          
          <button onClick={handleAuthClick} className="auth-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sign Up | Log In</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            <button onClick={handleHomeClick} className="mobile-nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Home</span>
            </button>
            
            <button onClick={handleJobMatchingClick} className="mobile-nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Job Matching</span>
            </button>
            
            <button onClick={handleJobListClick} className="mobile-nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Job List & Detail</span>
            </button>
            
            <button onClick={handleWishlistClick} className="mobile-nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.64169 1.5487 7.04096 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Wishlist</span>
            </button>
            
            <div className="mobile-auth-section">
              <button onClick={handleAuthClick} className="mobile-auth-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Sign Up | Log In</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>
        )}
      </div>
    </header>
  );
};

export default Header;