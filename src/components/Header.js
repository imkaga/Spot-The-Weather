import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ toggleTheme }) {
    return (
        <>
            <h1 className="is-size-1">Spot The Weather</h1>
            <button className="theme-btn" onClick={toggleTheme}>Theme</button>
            <header>
                <nav className="nawigacja">
                    <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <Link to="/">Strona Główna</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="Feelings">Muzyka Dla Uczuć</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="FindMusic">Wyszukiwarka Muzyczna</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="TierListPage">Tier List</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="Profile">Profil</Link>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    );
}
