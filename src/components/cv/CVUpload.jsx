import React, { useState, useRef } from 'react';
import './CVUpload.css';

const CVUpload = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleFileSelect = (file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Mohon upload file PDF atau Word.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="cv-upload-container">
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
            <div className="upload-icon">
              📁
            </div>
            <h4>Drag & Drop CV di sini</h4>
            <p>atau <span className="click-text">klik untuk pilih file</span></p>
            <div className="file-requirements">
              <small>Format: PDF, DOC, DOCX (Max. 5MB)</small>
            </div>
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <h5>{selectedFile.name}</h5>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button className="remove-file" onClick={removeFile}>
                ❌
              </button>
            </div>
            
            <div className="upload-actions">
              <button 
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Menganalisis...' : '🚀 Analisis CV'}
              </button>
              
              <button className="btn btn-outline-secondary" onClick={openFileDialog}>
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