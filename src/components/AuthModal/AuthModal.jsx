import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose }) => {
  const { signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error saat user mengetik
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // LOGIN
        await signIn(formData.email, formData.password);
        setSuccess("Login berhasil! Redirecting...");
        setTimeout(() => {
          onClose();
          // Reset form
          setFormData({
            email: "",
            password: "",
            fullName: "",
            confirmPassword: "",
          });
        }, 1000);
      } else {
        // SIGN UP
        // Validasi password
        if (formData.password !== formData.confirmPassword) {
          setError("Password tidak sama!");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password minimal 6 karakter!");
          setIsLoading(false);
          return;
        }

        if (!formData.fullName.trim()) {
          setError("Nama lengkap harus diisi!");
          setIsLoading(false);
          return;
        }

        await signUp(formData.email, formData.password, formData.fullName);
        setSuccess("Registrasi berhasil! Silakan login...");

        // Auto switch ke login setelah 2 detik
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            email: formData.email, // Keep email
            password: "",
            fullName: "",
            confirmPassword: "",
          });
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      confirmPassword: "",
    });
    setError("");
    setSuccess("");
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <button className="close-btn" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="auth-modal-content">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-circle">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h2>{isLogin ? "Masuk ke Akun" : "Daftar Akun Baru"}</h2>
            <p>
              {isLogin
                ? "Masuk untuk mengakses fitur Job Matching"
                : "Buat akun untuk memulai pencarian kerja"}
            </p>

            {error && (
              <div className="auth-message error">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#dc2626"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8V12"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 16H12.01"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-message success">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#059669"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 12L11 14L15 10"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{success}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contoh@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Masukkan password (min. 6 karakter)"
                required
                disabled={isLoading}
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Konfirmasi Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Ulangi password"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  {isLogin ? "Masuk..." : "Mendaftar..."}
                </>
              ) : (
                <>
                  <svg
                    className="me-2"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="10,17 15,12 10,7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="21"
                      y1="12"
                      x2="3"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isLogin ? "Masuk" : "Daftar"}
                </>
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
              <button
                onClick={toggleMode}
                className="toggle-btn"
                disabled={isLoading}
              >
                {isLogin ? "Daftar di sini" : "Masuk di sini"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
