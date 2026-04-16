import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/resumes');
      setResumes(data);
    } catch (error) {
      console.error('Failed to fetch resumes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5001/resumes/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleCardClick = (resultData) => {
    navigate('/result', { state: { result: resultData } });
  };

  if (loading) {
    return <div className="fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}><span className="spinner"></span></div>;
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Analysis History</h2>
        <p className="text-muted">Review internal records of your past ATS interactions.</p>
      </div>

      {resumes.length === 0 ? (
        <div className="empty-state card">
          <FaSearch style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--surface-border)' }} />
          <h3>No Records Found</h3>
          <p>You haven't analyzed any resumes through the engine yet.</p>
        </div>
      ) : (
        <div className="history-grid">
          {resumes.map((resume) => {
            let scoreColor = resume.score >= 71 ? 'var(--success)' : resume.score >= 41 ? 'var(--warning)' : 'var(--danger)';
            return (
              <div 
                key={resume._id} 
                className="card" 
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => handleCardClick(resume)}
              >
                <div className="history-card-header">
                  <div style={{ wordBreak: 'break-all', paddingRight: '1rem' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{resume.filename}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button className="delete-btn" onClick={(e) => handleDelete(resume._id, e)}>
                    <FaTrashAlt />
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    border: `4px solid ${scoreColor}`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontWeight: '800',
                    color: scoreColor, fontSize: '1.2rem'
                  }}>
                    {resume.score}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>OVERALL MATCH</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {resume.foundSkills?.slice(0, 3).map(skill => (
                    <span key={skill} className="badge badge-gray">
                      {skill}
                    </span>
                  ))}
                  {resume.foundSkills?.length > 3 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
                      +{resume.foundSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
