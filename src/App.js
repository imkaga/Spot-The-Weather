import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import FindMusic from './components/FindMusic';
import TierListPage from './components/TierListPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.css';
import './App.css';
import { handleLogout } from './components/Utils'; // Import handleLogout from Utils.js

function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'main');
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Example: Initialize as true, assuming the user is initially logged in

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
        const timeoutId = setTimeout(() => {
            // Sprawdź czy użytkownik jest zalogowany
            if (isLoggedIn) {
                alert('401: Sesja wygasła, zaloguj się ponownie.');
                // Wyloguj użytkownika
                handleLogout();
            }
        }, 3600000); // 3600000 milisekund = 1 godzina

        return () => clearTimeout(timeoutId); // Clear the timeout on component unmount or state change
    }, [isLoggedIn]);

    return (
        <div className="App">
            <Header toggleTheme={toggleTheme} handleLogout={() => setIsLoggedIn(false)} /> {/* Pass setIsLoggedIn as a prop */}
            <Routes>
                <Route path="/" element={<Home toggleTheme={toggleTheme} />} />
                <Route path="FindMusic" element={<FindMusic toggleTheme={toggleTheme} />} />
                <Route path="TierListPage" element={<TierListPage toggleTheme={toggleTheme} />} />
                <Route path="Profile" element={<Profile toggleTheme={toggleTheme} />} />
            </Routes>
        </div>
    );
}

export default App;
