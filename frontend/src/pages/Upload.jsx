import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCloudUploadAlt, FaFilePdf, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processStep, setProcessStep] = useState(0); 
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      setFile(null);
    } else {
      setFile(selectedFile);
      setError(null);
    }
  };

  // Helper function to animate steps sequentially
  const simulateSteps = async (responseData) => {
    // We already have response, but we delay UI navigation to give feeling of deep AI processing
    setProcessStep(1); // parsing
    await new Promise(r => setTimeout(r, 1000));
    setProcessStep(2); // extracting
    await new Promise(r => setTimeout(r, 1000));
    setProcessStep(3); // scoring
    await new Promise(r => setTimeout(r, 1000));
    setProcessStep(4); // AI
    await new Promise(r => setTimeout(r, 1200));
    navigate('/result', { state: { result: responseData } });
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    setProcessStep(0);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Sequence visual loader before proceeding
      await simulateSteps(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred during upload.');
      setLoading(false);
    }
  };

  const stepsText = [
    "Parsing resume layers...",
    "Extracting competency profile...",
    "Calculating ATS compatibility matrix...",
    "Generating ChatGPT Professional Feedback..."
  ];

  return (
    <div className="upload-container fade-in">
      {!loading ? (
        <div className="upload-card card">
          <h2>Smart ATS Check</h2>
          <p className="text-muted">Upload your resume in PDF format to get an enterprise-level review.</p>
          
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="file-input"
            />
            {file ? (
              <>
                <FaFilePdf className="drop-icon" style={{ color: 'var(--primary)' }} />
                <h3>{file.name}</h3>
                <p style={{ color: 'var(--primary)' }}>Ready to analyze</p>
              </>
            ) : (
              <>
                <FaCloudUploadAlt className="drop-icon" />
                <h3>Drag & Drop your PDF here</h3>
                <p className="text-muted">or click to browse from your device</p>
              </>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            onClick={handleUpload} 
            className="primary-btn upload-btn" 
            disabled={!file}
          >
            Upload & Proceed
          </button>
        </div>
      ) : (
        <div className="upload-card card" style={{ padding: '4rem 3rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Analyzing Engine Active</h2>
          <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            {stepsText.map((text, i) => {
              const currentItemNum = i + 1;
              const isPast = processStep > currentItemNum;
              const isCurrent = processStep === currentItemNum;
              const isFuture = processStep < currentItemNum;
              
              let cx = "";
              if (isPast) cx = "processing-step done";
              else if (isCurrent) cx = "processing-step active fade-in";
              else cx = "processing-step";

              return (
                <div key={i} className={cx} style={{ opacity: isFuture ? 0.3 : 1 }}>
                  {isPast ? <FaCheckCircle /> : isCurrent ? <FaSpinner className="spinner" style={{width: 16, height: 16, borderTopColor: 'currentColor'}} /> : <div style={{width:16,height:16, borderRadius:'50%', border:'2px solid currentColor'}} />}
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
