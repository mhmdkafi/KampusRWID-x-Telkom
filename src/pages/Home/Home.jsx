import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import JobSlider from '../../components/JobSlider/JobSlider';
import AuthModal from '../../components/AuthModal/AuthModal';

const Home = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const goToJobMatching = () => {
    navigate('/job-matching');
  };

  return (
    <div style={{background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', minHeight: '100vh'}}>
      <Header />
      
      <main className="section-padding">
        <div className="container">
          <div className="row align-items-center g-5">
            {/* Left Section - Job Slider */}
            <div className="col-lg-6 order-2 order-lg-1">
              <div className="d-flex justify-content-center position-relative">
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{zIndex: -1}}>
                  <div className="bg-light rounded-circle opacity-30" style={{width: '350px', height: '350px'}}></div>
                  <div className="position-absolute rounded-circle opacity-10" style={{width: '200px', height: '200px', top: '20%', right: '10%', background: '#e2e8f0'}}></div>
                </div>
                <JobSlider />
              </div>
            </div>
            
            {/* Right Section - Content */}
            <div className="col-lg-6 order-1 order-lg-2">
              <div className="ps-lg-4">
                <div className="mb-4">
                  <span className="badge text-white px-4 py-2 rounded-pill fw-semibold" 
                        style={{background: 'linear-gradient(135deg, #22543d 0%, #2f855a 100%)'}}>
                    🎯 Platform AI untuk Job Matching Terdepan
                  </span>
                </div>

                <h1 className="display-4 fw-bold mb-4 lh-1" style={{color: '#1a202c'}}>
                  Temukan Kecocokan<br />
                  <span style={{color: '#22543d'}}>Kerja Paling Akurat.</span>
                </h1>
                
                <p className="lead mb-4 fs-5" style={{color: '#4a5568', lineHeight: '1.7'}}>
                  Jangan buang waktu mencari lowongan yang tidak sesuai. Kami 
                  menganalisis CV Anda secara mendalam menggunakan teknologi AI untuk menemukan 
                  pekerjaan yang paling cocok dengan keahlian Anda.
                </p>
                
                <p className="mb-5 fs-6" style={{color: '#718096', lineHeight: '1.6'}}>
                  Unggah CV, dapatkan analisis mendalam, dan temukan rekomendasi pekerjaan terbaik 
                  dalam hitungan detik dengan tingkat akurasi hingga 95%.
                </p>
                
                <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                  <button 
                    className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-semibold btn-modern"
                    style={{background: 'linear-gradient(135deg, #22543d 0%, #2f855a 100%)', border: 'none'}}
                    onClick={goToJobMatching}
                  >
                    <svg className="me-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Mulai Job Matching
                  </button>
                  
                  <button 
                    className="btn btn-outline-primary btn-lg rounded-pill px-5 py-3 fw-semibold"
                    onClick={openAuthModal}
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
};

export default Home;