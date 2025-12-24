import { useState, useRef } from 'react';
import { uploadPdf } from '../../services/apiService';
import type{ ExtractionResponse } from '../../models/orderFormModel';
import './PdfUpload.css';

interface PdfUploadProps {
  onExtractionComplete: (response: ExtractionResponse) => void;
}

export default function PdfUpload({ onExtractionComplete }: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please select a PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size must be less than 50MB');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const response = await uploadPdf(file);
      setIsUploading(false);
      if (response.success && response.data) {
        onExtractionComplete(response);
        console.log(response);
      } else {
        setErrorMessage(response.message || 'Extraction failed');
      }
    } catch (error: any) {
      setIsUploading(false);
      setErrorMessage(error.error?.detail || 'Failed to upload PDF. Please try again.');
    }
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!isUploading && !selectedFile && (
          <div className="upload-content">
            <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <h3>Upload Order Form PDF</h3>
            <p>Drag and drop your PDF file here, or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              id="file-input"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button type="button" className="browse-btn" onClick={() => fileInputRef.current?.click()}>
              Browse Files
            </button>
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Processing PDF...</p>
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className="file-selected">
            <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p className="file-name">{selectedFile.name}</p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}