import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loggedin, handleLogout, pausePreview } from './Utils';
import * as Utils from './Utils';

export const handleHeaderItemClick = (itemName) => {
    return itemName;
};

export default function Header({ toggleTheme, setIsPlaying = () => {} }) {
    const [currentPreview, setCurrentPreview] = useState(null);

    return (
        <>
            <h1 className="is-size-1">WeatherTunes</h1>
            <header>
                <nav className="nawigacja">
                    <div className='header-buttons'>
                    <button className="theme-btn" onClick={toggleTheme}>Zmień Motyw</button>
                    {loggedin() && (
                        <button className="login-btn" onClick={() => {
                            handleLogout();
                            pausePreview(currentPreview); // Pause music when logging out
                            setIsPlaying(false); // Update playing state to false when pausing
                        }}>Wyloguj</button>
                    )}
                    </div>
                    <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <Link to="/" onClick={() => handleHeaderItemClick('Strona Główna')}>Strona Główna</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="FindMusic" onClick={() => handleHeaderItemClick('Wyszukiwarka Muzyczna')}>Wyszukiwarka Muzyczna</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="TierListPage" onClick={() => handleHeaderItemClick('Tier List')}>Tier List</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="Profile" onClick={() => handleHeaderItemClick('Profil')}>Profil</Link>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    );
}
