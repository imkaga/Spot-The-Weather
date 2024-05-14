import React from 'react';
import { Link } from 'react-router-dom';
import { loggedin, handleLogout, pausePreview } from './Utils';
import * as Utils from './Utils';

export default function Header({ toggleTheme, currentPreview, setCurrentPreview, setIsPlaying, pausePreview }) {
    const handleHeaderItemClick = () => {
    if (currentPreview && typeof currentPreview.pause === 'function') {
        Utils.pausePreview(currentPreview);
        currentPreview.pause();
    }
};



    return (
        <>
            <h1 className="is-size-1">Spot The Weather</h1>
            <header>
                <nav className="nawigacja">
                    <button className="theme-btn" onClick={toggleTheme}>Zmień Motyw</button>
                    <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <Link to="/" onClick={handleHeaderItemClick}>Strona Główna</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="FindMusic" onClick={handleHeaderItemClick}>Wyszukiwarka Muzyczna</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="TierListPage" onClick={handleHeaderItemClick}>Tier List</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="Profile" onClick={handleHeaderItemClick}>Profil</Link>
                        </li>
                        <li className="nav-item">
                            {loggedin() ? (
                                <button className="login-btn" onClick={() => {
                                    handleLogout();
                                    pausePreview(currentPreview); // Pause music when logging out
                                    setIsPlaying(false); // Update playing state to false when pausing
                                }}>Wyloguj</button>
                            ) : (
                                ""
                            )}
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    );
}
