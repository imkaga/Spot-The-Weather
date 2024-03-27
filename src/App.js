import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import FindMusic from './components/FindMusic';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'main'); // Initialize theme from localStorage or default to 'main'

  const toggleTheme = () => {
    const newTheme = theme === 'main' ? 'light' : 'main';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (theme) => {
    document.body.classList.toggle('light-theme', theme === 'light');
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="App">
      <Header toggleTheme={toggleTheme} /> {/* Pass toggleTheme as a prop */}
      <Routes>
        <Route path="/" element={<Home toggleTheme={toggleTheme} />} />
        <Route path="FindMusic" element={<FindMusic toggleTheme={toggleTheme} />} />
        <Route path="profile" element={<Profile toggleTheme={toggleTheme} />} />
      </Routes>
    </div>
  );
}

export default App;
