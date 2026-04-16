import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { FaFileAlt } from 'react-icons/fa';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Result from './pages/Result';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-logo">
            <NavLink to="/">
              <FaFileAlt /> IntelliResume
            </NavLink>
          </div>
          <ul className="navbar-links">
            <li><NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Home</NavLink></li>
            <li><NavLink to="/upload" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Upload</NavLink></li>
            <li><NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>History</NavLink></li>
          </ul>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/result" element={<Result />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
