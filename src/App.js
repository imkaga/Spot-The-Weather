import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'main'); // Initialize theme from localStorage or default to 'main'

  return (
    <div className="App">
      <Header setTheme={setTheme} /> {/* Pass setTheme as a prop */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
