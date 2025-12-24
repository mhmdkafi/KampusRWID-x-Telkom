import React, { useState, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useNotification } from '../../hooks/useNotification';
import Notification from '../Notification/Notification';
import './CVUpload.css';

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api";

const CVUpload = ({ onUpload, isLoading }) => {
  const { notification, showNotification, hideNotification } = useNotification();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingCV, setExistingCV] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      showNotification('Format file tidak didukung. Mohon upload file PDF atau Word.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Ukuran file terlalu besar. Maksimal 5MB.', 'error');
      return;
    }

    setSelectedFile(file);

    // Cek apakah user sudah punya CV
    const cv = await checkExistingCV();
    if (cv) {
      setExistingCV(cv);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const checkExistingCV = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("cvs")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error("Error checking existing CV:", error);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // PERBAIKAN: Panggil callback onUpload dengan file
    // JANGAN reset form di sini, biar parent yang handle
    if (onUpload) {
      onUpload(selectedFile);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExistingCV(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="cv-upload-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      <div className="upload-header">
        <h3>📄 Upload CV Anda</h3>
        <p>Unggah CV dalam format PDF atau Word untuk mendapatkan analisis dan rekomendasi pekerjaan</p>
      </div>

      <div className="upload-section">
        {!selectedFile ? (
          <div 
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="upload-icon">📁</div>
            <h4>Drag & Drop CV di sini</h4>
            <p>atau <span className="click-text">klik untuk pilih file</span></p>
            <div className="file-requirements">
              <small>Format: PDF, DOC, DOCX (Max. 5MB)</small>
            </div>
          </div>
        ) : (
          <div className="file-preview">
            {existingCV && (
              <div className="replace-warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p><strong>Anda sudah memiliki CV:</strong> {existingCV.filename}</p>
                  <p className="text-muted">File baru akan menggantikan CV yang lama.</p>
                </div>
              </div>
            )}
            
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <h5>{selectedFile.name}</h5>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button className="remove-file" onClick={removeFile} disabled={isLoading}>
                ❌
              </button>
            </div>
            
            <div className="upload-actions">
              <button 
                className="btn btn-primary btn-analyze"
                onClick={handleUpload}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Menganalisis...
                  </>
                ) : existingCV ? (
                  '🔄 Perbarui & Analisis CV'
                ) : (
                  '🚀 Upload & Analisis CV'
                )}
              </button>
              
              <button 
                className="btn btn-outline-secondary btn-change" 
                onClick={openFileDialog}
                disabled={isLoading}
              >
                📁 Ganti File
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default CVUpload;