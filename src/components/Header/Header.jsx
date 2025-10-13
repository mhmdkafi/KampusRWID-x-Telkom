import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../AuthModal/AuthModal';
import './Header.css';

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Navigation functions
  const goToHome = () => {
    navigate('/');
  };

  const goToJobMatching = () => {
    navigate('/job-matching');
  };

  const goToJobList = () => {
    navigate('/job-list');
  };

  const goToWishlist = () => {
    navigate('/wishlist');
  };

  // Check if current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          {/* Professional Logo */}
          <div className="navbar-brand" onClick={goToHome} style={{cursor: 'pointer'}}>
            <div className="d-flex align-items-center">
              <div className="position-relative">
                <div 
                  className="logo-container rounded-3 me-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '50px', 
                    height: '50px',
                    background: 'linear-gradient(135deg, #22543d 0%, #2f855a 100%)',
                    boxShadow: '0 4px 15px rgba(34, 84, 61, 0.3)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className="fw-bold text-dark mb-0" style={{fontSize: '18px', letterSpacing: '0.5px'}}>
                  JOB MATCHING
                </div>
                <div style={{fontSize: '12px', letterSpacing: '1px', fontWeight: '500', color: '#22543d'}}>
                  KAMPUS RWID
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Mobile toggle */}
          <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* Professional Navigation */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <button 
                  className={`nav-link fw-semibold px-4 py-2 rounded-pill mx-1 nav-link-modern border-0 bg-transparent ${isActive('/') ? 'active-nav' : ''}`}
                  style={{
                    color: isActive('/') ? '#22543d' : '#6b7280',
                    background: isActive('/') ? 'rgba(34, 84, 61, 0.1)' : 'transparent'
                  }}
                  onClick={goToHome}
                >
                  <svg className="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Home
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link fw-medium px-4 py-2 rounded-pill mx-1 nav-link-modern border-0 bg-transparent ${isActive('/job-matching') ? 'active-nav' : ''}`}
                  style={{
                    color: isActive('/job-matching') ? '#22543d' : '#6b7280',
                    background: isActive('/job-matching') ? 'rgba(34, 84, 61, 0.1)' : 'transparent'
                  }}
                  onClick={goToJobMatching}
                >
                  <svg className="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Job Matching
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link fw-medium px-4 py-2 rounded-pill mx-1 nav-link-modern border-0 bg-transparent ${isActive('/job-list') ? 'active-nav' : ''}`}
                  style={{
                    color: isActive('/job-list') ? '#22543d' : '#6b7280',
                    background: isActive('/job-list') ? 'rgba(34, 84, 61, 0.1)' : 'transparent'
                  }}
                  onClick={goToJobList}
                >
                  <svg className="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Job List
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link fw-medium px-4 py-2 rounded-pill mx-1 nav-link-modern border-0 bg-transparent ${isActive('/wishlist') ? 'active-nav' : ''}`}
                  style={{
                    color: isActive('/wishlist') ? '#22543d' : '#6b7280',
                    background: isActive('/wishlist') ? 'rgba(34, 84, 61, 0.1)' : 'transparent'
                  }}
                  onClick={goToWishlist}
                >
                  <svg className="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61V4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Wishlist
                </button>
              </li>
            </ul>
            
            {/* Professional Auth Button */}
            <button 
              className="btn btn-outline-success rounded-pill px-4 py-2 fw-semibold btn-auth d-flex align-items-center"
              style={{borderColor: '#22543d', color: '#22543d', borderWidth: '2px'}}
              onClick={openAuthModal}
            >
              <svg className="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign Up | Log In
            </button>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default Header;