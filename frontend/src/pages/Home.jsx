import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaChartLine, FaRegLightbulb, FaRocket } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container fade-in">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-badge">
          <FaRocket style={{ color: 'var(--primary)' }} />
          <span>V2 Smart Engine Now Live</span>
        </div>
        <h1 className="hero-title">
          Elevate Your Resume with <span className="text-gradient">Intelli-AI</span>
        </h1>
        <p className="hero-subtitle">
          Unlock your next career move. Instantly scan your resume for critical industry skills, receive an ATS-optimized match score, and get actionable suggestions designed to make you stand out.
        </p>
        <div className="hero-actions">
          <button className="primary-btn pulse-anim" onClick={() => navigate('/upload')} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Analyze Resume Now
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-grid">
        <div className="feature-card card">
          <div className="feature-icon-wrapper">
            <FaRobot className="feature-icon" />
          </div>
          <h3>Smart Keyword Parsing</h3>
          <p>Our engine strictly checks your footprint against standard tech stacks like React, Node, SQL, and Git.</p>
        </div>
        <div className="feature-card card">
          <div className="feature-icon-wrapper">
            <FaChartLine className="feature-icon" />
          </div>
          <h3>Instant ATS Scoring</h3>
          <p>Get a quantifiable, animated match score within seconds based on how closely your timeline mirrors modern demands.</p>
        </div>
        <div className="feature-card card">
          <div className="feature-icon-wrapper">
            <FaRegLightbulb className="feature-icon" />
          </div>
          <h3>Actionable Feedback</h3>
          <p>We dynamically spot missing competencies and instruct you precisely on what tools or descriptors to append next.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
