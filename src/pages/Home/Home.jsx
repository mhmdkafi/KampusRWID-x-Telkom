import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import JobSlider from "../../components/JobSlider/JobSlider";
import AuthModal from "../../components/AuthModal/AuthModal";

const Home = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState("login"); // ADD: state untuk mode
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  // UPDATE: Tambah parameter mode
  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleJobMatchingClick = () => {
    if (!isAuthenticated) {
      openAuthModal("login"); // Buka sebagai login
    } else {
      navigate("/matching");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header REMOVED - sudah ada di App.js */}

      <main style={{ padding: "100px 0 60px" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3rem",
              flexWrap: "wrap",
            }}
          >
            {/* Left Section - Job Slider */}
            <div style={{ flex: "1", minWidth: "300px", order: 2 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: -1,
                  }}
                >
                  <div
                    style={{
                      background: "#f7fafc",
                      borderRadius: "50%",
                      opacity: 0.3,
                      width: "350px",
                      height: "350px",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      borderRadius: "50%",
                      opacity: 0.1,
                      width: "200px",
                      height: "200px",
                      top: "20%",
                      right: "10%",
                      background: "#e2e8f0",
                    }}
                  ></div>
                </div>
                <JobSlider />
              </div>
            </div>

            {/* Right Section - Content */}
            <div style={{ flex: "1", minWidth: "300px", order: 1 }}>
              <div style={{ paddingLeft: "2rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #22543d 0%, #2f855a 100%)",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "25px",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    🎯 Platform AI untuk Job Matching Terdepan
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: "3rem",
                    fontWeight: "700",
                    marginBottom: "1.5rem",
                    lineHeight: "1.1",
                    color: "#1a202c",
                  }}
                >
                  Temukan Kecocokan
                  <br />
                  <span style={{ color: "#22543d" }}>Kerja Paling Akurat.</span>
                </h1>

                <p
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "1.5rem",
                    color: "#4a5568",
                    lineHeight: "1.7",
                  }}
                >
                  Jangan buang waktu mencari lowongan yang tidak sesuai. Kami
                  menganalisis CV Anda secara mendalam menggunakan teknologi AI
                  untuk menemukan pekerjaan yang paling cocok dengan keahlian
                  Anda.
                </p>

                <p
                  style={{
                    marginBottom: "1.5rem",
                    color: "#718096",
                    lineHeight: "1.6",
                  }}
                >
                  Unggah CV, dapatkan analisis mendalam, dan temukan rekomendasi
                  pekerjaan terbaik dalam hitungan detik dengan tingkat akurasi
                  hingga 95%.
                </p>

                {/* User Welcome Message */}
                {isAuthenticated && user && (
                  <div
                    style={{
                      background: "rgba(34, 84, 61, 0.1)",
                      border: "1px solid rgba(34, 84, 61, 0.2)",
                      borderRadius: "10px",
                      padding: "1rem 1.25rem",
                      marginBottom: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      style={{ marginRight: "0.75rem", flexShrink: 0 }}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M9 12L11 14L15 10"
                        stroke="#22543d"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#22543d"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div>
                      <strong style={{ color: "#22543d", fontSize: "0.9rem" }}>
                        Welcome back, {user.full_name}!
                      </strong>
                      <br />
                      <small style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                        Ready to find your perfect job match?
                      </small>
                    </div>
                  </div>
                )}

                {/* Authentication Notice */}
                {!isAuthenticated && (
                  <div
                    style={{
                      background: "rgba(34, 84, 61, 0.1)",
                      border: "1px solid rgba(34, 84, 61, 0.2)",
                      borderRadius: "10px",
                      padding: "1rem 1.25rem",
                      marginBottom: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      style={{ marginRight: "0.75rem", flexShrink: 0 }}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#22543d"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 16V12"
                        stroke="#22543d"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 8H12.01"
                        stroke="#22543d"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div>
                      <strong style={{ color: "#22543d", fontSize: "0.9rem" }}>
                        Login Required
                      </strong>
                      <br />
                      <small style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                        Silakan login atau daftar untuk menggunakan fitur Job
                        Matching
                      </small>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <button
                    style={{
                      background:
                        "linear-gradient(135deg, #22543d 0%, #2f855a 100%)",
                      border: "none",
                      color: "white",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "25px",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      minWidth: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      transition: "all 0.3s ease",
                    }}
                    onClick={handleJobMatchingClick}
                    onMouseOver={(e) =>
                      (e.target.style.transform = "translateY(-2px)")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.transform = "translateY(0)")
                    }
                  >
                    {!isAuthenticated && (
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          right: "-5px",
                          background: "#fbbf24",
                          color: "#1a202c",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "0.7rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        !
                      </span>
                    )}
                    <svg
                      style={{ marginRight: "0.5rem" }}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="7,10 12,15 17,10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="12"
                        y1="15"
                        x2="12"
                        y2="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isAuthenticated
                      ? "Mulai Job Matching"
                      : "Login untuk Job Matching"}
                  </button>

                  {!isAuthenticated && (
                    <button
                      style={{
                        background: "transparent",
                        border: "2px solid #22543d",
                        color: "#22543d",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "25px",
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        minWidth: "180px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => openAuthModal("register")} // CHANGED: pass "register"
                      onMouseOver={(e) => {
                        e.target.style.background = "#22543d";
                        e.target.style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#22543d";
                      }}
                    >
                      <svg
                        style={{ marginRight: "0.5rem" }}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="7"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Daftar Sekarang
                    </button>
                  )}
                </div>

                {/* Features Preview */}
                {!isAuthenticated && (
                  <div>
                    <h6
                      style={{
                        color: "#22543d",
                        fontSize: "0.9rem",
                        marginBottom: "1rem",
                      }}
                    >
                      ✨ Fitur yang akan Anda dapatkan:
                    </h6>
                    <div
                      style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: "1",
                          minWidth: "200px",
                        }}
                      >
                        <div
                          style={{
                            width: "35px",
                            height: "35px",
                            background: "rgba(34, 84, 61, 0.1)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                            marginRight: "0.75rem",
                          }}
                        >
                          🤖
                        </div>
                        <div>
                          <strong
                            style={{ color: "#1a202c", fontSize: "0.85rem" }}
                          >
                            AI Analysis
                          </strong>
                          <p
                            style={{
                              margin: 0,
                              color: "#718096",
                              fontSize: "0.75rem",
                            }}
                          >
                            Analisis CV otomatis
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: "1",
                          minWidth: "200px",
                        }}
                      >
                        <div
                          style={{
                            width: "35px",
                            height: "35px",
                            background: "rgba(34, 84, 61, 0.1)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                            marginRight: "0.75rem",
                          }}
                        >
                          🎯
                        </div>
                        <div>
                          <strong
                            style={{ color: "#1a202c", fontSize: "0.85rem" }}
                          >
                            Smart Matching
                          </strong>
                          <p
                            style={{
                              margin: 0,
                              color: "#718096",
                              fontSize: "0.75rem",
                            }}
                          >
                            Rekomendasi akurat
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* UPDATE: Pass authMode as initialMode */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </div>
  );
};

export default Home;
