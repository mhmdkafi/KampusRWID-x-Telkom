import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const { signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showForgotPasswordPrompt, setShowForgotPasswordPrompt] =
    useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update isLogin when initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === "login");
      setIsForgotPassword(false);
      setShowForgotPasswordPrompt(false);
      setLoginAttempts(0);
      setError("");
      setSuccess(""); // Clear success
    } else {
      // PERBAIKAN: Clear semua saat modal ditutup
      setError("");
      setSuccess("");
      setFormData({
        email: "",
        password: "",
        fullName: "",
        confirmPassword: "",
        newPassword: "",
      });
    }
  }, [initialMode, isOpen]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setShowForgotPasswordPrompt(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validasi password baru
      if (formData.newPassword.length < 6) {
        setError("Password baru minimal 6 karakter!");
        setIsLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Password baru tidak sama!");
        setIsLoading(false);
        return;
      }

      if (!formData.fullName.trim()) {
        setError("Nama lengkap harus diisi untuk verifikasi!");
        setIsLoading(false);
        return;
      }

      // Call backend API untuk reset password
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api"
        }/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            fullName: formData.fullName,
            newPassword: formData.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal reset password");
      }

      setSuccess(
        "Password berhasil diubah! Silakan login dengan password baru."
      );

      // Auto switch ke login setelah 1 detik
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
        setFormData({
          email: formData.email,
          password: "",
          fullName: "",
          confirmPassword: "",
          newPassword: "",
        });
        setSuccess("");
        setShowForgotPasswordPrompt(false);
      }, 1000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.message ||
          "Email atau nama lengkap tidak cocok dengan data yang terdaftar."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isForgotPassword) {
      return handleForgotPassword(e);
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // LOGIN
        try {
          await signIn(formData.email, formData.password);
          setSuccess("Login berhasil! Redirecting...");
          setShowForgotPasswordPrompt(false);
          setLoginAttempts(0);

          // PERBAIKAN: Clear success sebelum close
          setTimeout(() => {
            setSuccess(""); // Clear success message
            setFormData({
              email: "",
              password: "",
              fullName: "",
              confirmPassword: "",
              newPassword: "",
            });
            onClose();
          }, 800); // Kurangi delay dari 1000 ke 800
        } catch (loginError) {
          // Increment login attempts
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);

          // Show forgot password prompt after 1 failed attempt
          if (newAttempts >= 1) {
            setShowForgotPasswordPrompt(true);
          }

          throw loginError;
        }
      } else {
        // SIGN UP
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

        setSuccess("Registrasi berhasil! Silakan login");

        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: "",
            fullName: "",
            confirmPassword: "",
            newPassword: "",
          });
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Auth error:", err);

      // Custom error messages
      let errorMessage = err.message || "Terjadi kesalahan. Silakan coba lagi.";

      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Email atau password salah!";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "Email belum diverifikasi. Silakan cek inbox Anda.";
      } else if (errorMessage.includes("User already registered")) {
        errorMessage = "Email sudah terdaftar. Silakan login.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setShowForgotPasswordPrompt(false);
    setLoginAttempts(0);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      confirmPassword: "",
      newPassword: "",
    });
    setError("");
    setSuccess("");
  };

  const showForgotPassword = () => {
    setIsForgotPassword(true);
    setIsLogin(false);
    setShowForgotPasswordPrompt(false);
    setFormData({
      email: formData.email, // Keep email
      password: "",
      fullName: "",
      confirmPassword: "",
      newPassword: "",
    });
    setError("");
    setSuccess("");
  };

  const backToLogin = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
    setShowForgotPasswordPrompt(false);
    setLoginAttempts(0);
    setFormData({
      email: formData.email, // Keep email
      password: "",
      fullName: "",
      confirmPassword: "",
      newPassword: "",
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
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h2>
              {isForgotPassword
                ? "Reset Password"
                : isLogin
                ? "Selamat Datang Kembali"
                : "Buat Akun Baru"}
            </h2>
            <p>
              {isForgotPassword
                ? "Masukkan email, nama lengkap, dan password baru"
                : isLogin
                ? "Masuk untuk melanjutkan"
                : "Daftar untuk memulai perjalanan karir Anda"}
            </p>
          </div>

          {error && (
            <div className="auth-message error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-message success">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Masukkan email Anda"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {!isForgotPassword && (
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder={
                    isLogin ? "Masukkan password" : "Minimal 6 karakter"
                  }
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Forgot password link - only show after failed login */}
            {isLogin && !isForgotPassword && showForgotPasswordPrompt && (
              <div className="forgot-password-link">
                <button
                  className="forgot-password-btn"
                  onClick={showForgotPassword}
                  disabled={isLoading}
                  type="button"
                >
                  Lupa password?
                </button>
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <>
                <div className="form-group">
                  <label htmlFor="fullName">Nama Lengkap</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Masukkan nama lengkap"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Konfirmasi Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {isForgotPassword && (
              <>
                <div className="form-group">
                  <label htmlFor="fullName">Nama Lengkap</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Masukkan nama lengkap untuk verifikasi"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <span className="form-text">
                    Harus sama dengan nama saat registrasi
                  </span>
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">Password Baru</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Minimal 6 karakter"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Ulangi password baru"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Loading...</span>
                </>
              ) : isForgotPassword ? (
                "Reset Password"
              ) : isLogin ? (
                "Masuk"
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          <div className="auth-toggle">
            {isForgotPassword ? (
              <p>
                Sudah ingat password?
                <button
                  className="toggle-btn"
                  onClick={backToLogin}
                  disabled={isLoading}
                >
                  Kembali ke Login
                </button>
              </p>
            ) : (
              <p>
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
                <button
                  className="toggle-btn"
                  onClick={toggleMode}
                  disabled={isLoading}
                >
                  {isLogin ? "Daftar sekarang" : "Masuk di sini"}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
