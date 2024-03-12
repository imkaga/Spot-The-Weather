import { Link, NavLink } from "react-router-dom";

export default function Header() {
    return(
        <>
         <h1 className="is-size-1">Spot The Weather</h1>
            {/* 
            <button className="theme-btn" onClick={toggleTheme}>Theme</button>
            */}
            <header>
                <nav className="nawigacja">
                    <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <Link to="/">
                            Strona Główna
                            </Link>
                        </li>
                        <li className="nav-item">
                            <a href="./rezerwacja.html">empty</a>
                        </li>
                        <li className="nav-item">
                            <Link to="Profile">
                            Profil
                            </Link>
                        </li>
                        <li className="nav-item">
                            <a href="./onas.html">Udostępnij</a>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    )
}