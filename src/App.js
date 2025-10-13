import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import JobMatching from './pages/JobMatching/JobMatching';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/job-matching" element={<JobMatching />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;