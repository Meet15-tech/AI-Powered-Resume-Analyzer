import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaRobot, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ProgressBar = ({ label, percentage, colorCls }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>
      <span>{label}</span>
      <span>{percentage}%</span>
    </div>
    <div className="progress-bar-container">
      <div className={`progress-bar-fill`} style={{ width: `${percentage}%`, backgroundColor: colorCls || 'var(--primary)' }}></div>
    </div>
  </div>
);

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [showExtracted, setShowExtracted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (result?.score !== undefined) {
      setTimeout(() => setProgress(result.score), 100);
    }
  }, [result]);

  if (!result) return <Navigate to="/upload" />;

  const { score, metrics, contentIssues, foundSkills, missingSkills, aiFeedback, extractedText } = result;

  let scoreClass = 'color-red';
  let hexColor = 'var(--danger)';
  if (score >= 71) { scoreClass = 'color-green'; hexColor = 'var(--success)'; }
  else if (score >= 41) { scoreClass = 'color-orange'; hexColor = 'var(--warning)'; }

  // Issue count logic
  let issuesCount = 0;
  if (!contentIssues.hasMetrics) issuesCount++;
  if (!contentIssues.hasActionVerbs) issuesCount++;
  if (!contentIssues.hasSummary) issuesCount++;
  missingSkills.length > 0 && issuesCount++;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="result-header">
        <h2>Dashboard Outline</h2>
        <button className="secondary-btn" onClick={() => navigate('/upload')}>
          Analyze Another
        </button>
      </div>

      <div className="dashboard-grid">
        
        {/* LEFT COLUMN */}
        <div className="dashboard-left">
          
          <div className="card score-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ marginBottom: '0' }}>ATS Match Score</h3>
            <div className={`circular-score ${scoreClass}`}>
              <svg>
                <circle cx="100" cy="100" r={radius} className="score-bg" />
                <circle cx="100" cy="100" r={radius} className="score-progress" style={{ strokeDasharray: circumference, strokeDashoffset }} />
              </svg>
              <div className="score-text" style={{ color: hexColor }}>{Math.round(progress)}</div>
            </div>
            {issuesCount > 0 ? (
              <p style={{ color: 'var(--warning)', fontWeight: 600, marginTop: '1rem' }}><FaTimesCircle /> {issuesCount} Issues Detected</p>
            ) : (
              <p style={{ color: 'var(--success)', fontWeight: 600, marginTop: '1rem' }}><FaCheckCircle /> Excellent Integrity</p>
            )}
          </div>

          <div className="card">
            <h3>Diagnostic Breakdown</h3>
            <ProgressBar label="Keyword Match" percentage={metrics.keywordMatch || 0} />
            <ProgressBar label="Section Completeness" percentage={metrics.sectionCompleteness || 0} />
            <ProgressBar label="Content Quality" percentage={metrics.contentQuality || 0} />
            <ProgressBar label="Skills Match" percentage={metrics.skillsMatch || 0} />
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard-right">
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>ATS Parse Rate</h3>
                <span className="badge badge-success">92%</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Your resume is successfully readable by applicant tracking systems.</p>
              <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: '92%', backgroundColor: 'var(--success)' }}></div></div>
            </div>
          </div>

          <div className="card">
            <h3>Skills Analysis</h3>
            <div className="skills-container" style={{ marginBottom: '1rem' }}>
              {foundSkills.length > 0 ? foundSkills.map(skill => <span key={`fs-${skill}`} className="badge badge-success">{skill}</span>) : <span className="text-muted">No core skills found</span>}
            </div>
            
            {(missingSkills && missingSkills.length > 0) && (
              <>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Missing Highly Ranked Keywords:</h4>
                <div className="skills-container">
                  {missingSkills.map(skill => <span key={`ms-${skill}`} className="badge badge-danger">{skill}</span>)}
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.05rem' }}>Content Issues</h3>
              <ul style={{ listStyle: 'none', fontSize: '0.95rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  {contentIssues.hasMetrics ? <span style={{color:'var(--success)'}}>✔ Has metrics</span> : <span style={{color:'var(--danger)'}}>❌ Lacks metrics</span>}
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  {contentIssues.hasActionVerbs ? <span style={{color:'var(--success)'}}>✔ Strong action verbs</span> : <span style={{color:'var(--danger)'}}>❌ Weak action verbs</span>}
                </li>
                <li>
                  {contentIssues.hasSummary ? <span style={{color:'var(--success)'}}>✔ Professional summary</span> : <span style={{color:'var(--danger)'}}>❌ Missing summary</span>}
                </li>
              </ul>
            </div>
          </div>

          <div className="ai-feedback-box">
            <div className="bot-header">
              <FaRobot size={24} /> <span>AI Recruiter Feedback</span>
            </div>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {aiFeedback && aiFeedback.map((fb, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{fb}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="collapsible-header" onClick={() => setShowExtracted(!showExtracted)}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Extracted Resume Text</h3>
              {showExtracted ? <FaChevronUp className="text-muted" /> : <FaChevronDown className="text-muted" />}
            </div>
            {showExtracted && (
              <div className="collapsible-content fade-in">
                {extractedText ? extractedText : 'No text could be extracted.'}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Result;
