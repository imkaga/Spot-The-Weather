import React, { useState, useEffect } from 'react';

// Zmienne
const apiKey = "85f93b7e11258cb2617c3f745ecf3349"; // Api Key OpenWeather
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q="; // Api URL OpenWeather
// Spotify API
const clientId = '44c1aa3e0f954b9491bb515284729f0b'; // ClientID Spotify
const redirectUri = 'http://localhost:3000/'; // Redirect URL
const clientSecret = '343770fe2dcc4167acd9722f8c3424d9'; //Client Secret Spotify
//Notatka dla siebie - dodać tutaj później API itd od spotify :)

// Function to handle authentication flow
async function authenticate() {
    // const clientId = '44c1aa3e0f954b9491bb515284729f0b'; // Już dodane powyżej
    // const redirectUri = 'http://localhost:3000/'; // Już dodane powyżej
    const scopes = ['user-read-private', 'user-read-email']; // Add necessary scopes

    // Redirect user to Spotify authorization endpoint
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=code`;
}

async function handleAuthorizationCode() {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get('code');

    if (authorizationCode) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`
                },
                body: `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${redirectUri}`
            });

            if (!response.ok) {
                throw new Error(`Failed to exchange authorization code for access token. Status: ${response.status}`);
            }

            const data = await response.json();
            const accessToken = data.access_token;

            if (!accessToken) {
                throw new Error('Access token not found in response');
            }

            localStorage.setItem('access_token', accessToken);
            window.location.href = '/home';
        } catch (error) {
            console.error('Error exchanging authorization code:', error);
        }
    }
}


// Funkcja do pobierania accessTokena użytkownika
async function getProfile(accessToken, refreshToken) {
    try {
        // Fetch user's profile using Spotify access token
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        // If the access token is expired, refresh it and try again
        if (error.message === "Unauthorized") {
            try {
                const newAccessToken = await refreshAccessToken(refreshToken);
                // Store the new access token in local storage
                localStorage.setItem('access_token', newAccessToken);
                // Retry fetching user's profile with the new access token
                return getProfile(newAccessToken, refreshToken);
            } catch (refreshError) {
                console.error('Error refreshing access token:', refreshError);
                throw refreshError;
            }
        } else {
            throw error;
        }
    }
}

// Funkcja do odświeania access tokena użytkownika
async function refreshAccessToken(refreshToken) {
    const clientCredentials = btoa('44c1aa3e0f954b9491bb515284729f0b' + ':' + '343770fe2dcc4167acd9722f8c3424d9');
    const spotifyTokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${clientCredentials}`,
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        cache: "no-cache"
    });

    const spotifyTokenData = await spotifyTokenResponse.json();
    return spotifyTokenData.access_token;
}

function Home() {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'main'); // Initialize theme from localStorage or default to 'main'

    // Call handleAuthorizationCode when your component mounts
    useEffect(() => {
    handleAuthorizationCode();
    }, []);

    useEffect(() => {
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity) {
            setCity(lastCity);
            fetchWeatherData(lastCity);
        }

        // Log the access token from local storage
        console.log('Access Token from Local Storage:', localStorage.getItem('access_token'));

        // Fetch user's profile from Spotify after component mounts
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            console.log('Access Token:', accessToken); // Log the access token

            // Fetch user profile
            getProfile(accessToken)
                .then(data => {
                    if (data) {
                        console.log('User Profile:', data); // Log the user's profile data
                        setUserName(data.display_name); // Update the userName state
                    }
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                });
        } else {
            console.error('Access token not found');
        }
    }, []);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
    
        if (accessToken) {
            getProfile(accessToken, refreshToken)
                .then(data => {
                    if (data) {
                        setUserName(data.display_name);
                    }
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                });
        } else {
            console.error('Access token not found');
        }
    }, [])


    // Efekt dotyczący zmiany motywu 
    useEffect(() => {
        document.body.classList.toggle('light-theme', theme === 'light'); // Apply 'light-theme' class based on theme state
        localStorage.setItem('theme', theme); // Store current theme in localStorage
    }, [theme]);

    const fetchWeatherData = async (city) => {
        try {
            const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setWeatherData(data);
            setErrorMessage('');
            localStorage.setItem('lastCity', city); // Zapisz ostatnie wyszukiwane miasto
        } catch (error) {
            console.error(error);
            setWeatherData(null);
            setErrorMessage('Error fetching weather data. Please try again later.');
        }
    };

    const handleSearch = () => {
        fetchWeatherData(city);
    };

    const handleChange = (e) => {
        setCity(e.target.value);
    };

    // Zmienna pozwalająca na wyszukiwanie przy użyciu entera
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Zmienna zapisująca wcześniej wybrany motyw. Po odświeżeniu strony, motyw jest zachowany.
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'main' ? 'light' : 'main')); // Toggle theme between 'main' and 'light'
    };

    // Sekcja typu <body>
    return (
        <>
            <h1 className="is-size-1">Spot The Weather</h1>
            <button className="theme-btn" onClick={toggleTheme}>Theme</button>
            <header>
                <nav className="nawigacja">
                    <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <a href="./index.html">Strona Główna</a>
                        </li>
                        <li className="nav-item">
                            <a href="./rezerwacja.html">empty</a>
                        </li>
                        <li className="nav-item">
                            <a href="./kontakt.html">Profil</a>
                        </li>
                        <li className="nav-item">
                            <a href="./onas.html">Udostępnij</a>
                        </li>
                    </ul>
                </nav>
            </header>
            <div className="container">
                <div className="card">
                    <div className="search">
                        <input 
                            type="text" 
                            placeholder="Wprowadź nazwę miasta" 
                            spellCheck="false" 
                            value={city} 
                            onChange={handleChange} 
                            onKeyDown={handleKeyDown} 
                        />
                        <button onClick={handleSearch}>Search</button>
                    </div>
                    {errorMessage && <div className="error"><p>{errorMessage}</p></div>}
                    {weatherData && (
                        <div className="weather">
                            <h3>Cześć, {userName}!</h3> {/* Display user's name here */}
                            <h2>Pogoda w {weatherData.name}</h2>
                            <p>Temperatura: {Math.round(weatherData.main.temp)}°C</p>
                            <p>Wilgotność: {weatherData.main.humidity}%</p>
                            <p>Prędkość wiatru: {weatherData.wind.speed} km/h</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Home;