import React, { useState, useEffect } from 'react';
import * as Utils from './Utils'; // Import functions from Utils.js

function Home() {
    const [city, setCity] = useState(''); // State for storing the city input
    const [weatherData, setWeatherData] = useState(null); // State for storing weather data
    const [errorMessage, setErrorMessage] = useState(''); // State for error messages
    const [userName, setUserName] = useState(''); // State for storing user's name
    const [loggedIn, setLoggedIn] = useState(false); // State for user login status
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'main'); // State for storing theme
    const [recommendedTracks, setRecommendedTracks] = useState([]); // State for storing recommended tracks
    

    const handleLogin = Utils.authenticate; // Function for handling login

    const handleLogout = () => { // Function for handling logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setLoggedIn(false);
        window.location.href = '/';
    };

    useEffect(() => { // Effect for handling authorization code
        Utils.handleAuthorizationCode()
            .then(() => {
                const accessToken = localStorage.getItem('access_token');
                if (accessToken) {
                    console.log('Access Token:', accessToken); // Logging access token
                    Utils.getProfile(accessToken)
                        .then(data => {
                            if (data) {
                                console.log('User Profile:', data); // Logging user profile
                                setUserName(data.display_name); // Setting user's name
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching user profile:', error);
                        });
                } else {
                    console.error('Access token not found');
                }
            })
            .catch(error => {
                console.error('Error handling authorization code:', error);
            });
    }, []);

    useEffect(() => { // Effect for setting city and fetching weather data
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity) {
            setCity(lastCity);
            Utils.fetchWeatherData(lastCity)
                .then(({ data, error }) => {
                    if (error) {
                        setErrorMessage(error);
                    } else {
                        setWeatherData(data);
                        setErrorMessage('');
                    }
                });
        }

        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            Utils.getProfile(accessToken)
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
    }, []);

    useEffect(() => { // Effect for handling access token and user profile
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (accessToken) {
            Utils.getProfile(accessToken, refreshToken)
                .then(data => {
                    if (data) {
                        setUserName(data.display_name);
                        setLoggedIn(true);
                    }
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                });
        } else {
            console.error('Access token not found');
        }
    }, []);

    useEffect(() => { // Effect for setting theme
        document.body.classList.toggle('light-theme', theme === 'light');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleSearch = () => { // Function for handling search
        Utils.fetchWeatherData(city)
            .then(({ data, error }) => {
                if (error) {
                    setErrorMessage(error);
                } else {
                    setWeatherData(data);
                    setErrorMessage('');
                    localStorage.setItem('lastCity', city);
                }
            });
    };

    const handleChange = (e) => { // Function for handling input change
        setCity(e.target.value);
    };

    const handleKeyDown = (e) => { // Function for handling enter key press
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleTheme = () => { // Function for toggling theme
        setTheme((prevTheme) => (prevTheme === 'main' ? 'light' : 'main'));
    };

    

    const recommendSongs = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const weatherGenre = mapWeatherToGenres(weatherData); // Get the mapped genre based on weather
            const response = await Utils.getRecommendations(accessToken, null, weatherGenre, null);
            setRecommendedTracks(response.tracks);
        } catch (error) {
            console.error('Error fetching recommended tracks:', error);
        }
    };
    
    const mapWeatherToGenres = (weatherData) => {
        // Map weather conditions to corresponding music genres
        const weatherCondition = weatherData.weather[0].main.toLowerCase();
        switch (weatherCondition) {
            case 'clear':
                return 'pop'; // Example genre for clear weather
            case 'rain':
                return 'chill'; // Example genre for rainy weather
            case 'clouds':
                return 'indie'; // Example genre for cloudy weather
            // Add more cases for other weather conditions as needed
            default:
                return 'pop'; // Default genre if weather condition doesn't match any specific genre
        }
    };

    useEffect(() => { // Effect for handling search and recommending songs
        if (weatherData) {
            recommendSongs();
        }
    }, [weatherData]);
    

    return (
        <>
            <div className="container">
                <div className="card">
                    <div className="search">
                        <input
                            type="text"
                            placeholder="Enter city name"
                            spellCheck="false"
                            value={city}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown} // Enables search by hitting enter
                        />
                        <button onClick={handleSearch}>Search</button>
                    </div>

                    {errorMessage && <div className="error"><p>{errorMessage}</p></div>}
                    {weatherData && (
                        <div className="weather">
                            <h3>Cześć, {userName}!</h3>
                            <h2>Weather in {weatherData.name}</h2>
                            <p>Condition: {weatherData.weather[0].main}</p>
                            <p>Temperature: {Math.round(weatherData.main.temp)}°C</p>
                            <p>Humidity: {weatherData.main.humidity}%</p>
                            <p>Wind Speed: {weatherData.wind.speed} km/h</p>
                        </div>
                    )}
                {/* Rekomendacja Piosenek */}
                <div className="container">
                    <button onClick={recommendSongs}>Recommend Songs</button>
                    {recommendedTracks.length > 0 && (
                     <div>
                    <h3>Recommended Songs</h3>
                    <ul>
                        {recommendedTracks.map((track, index) => (
                            <li key={index}>{track.name} - {track.artists.map(artist => artist.name).join(', ')}</li>
                        ))}
                    </ul>
                    </div>
                     )}
                    </div>

                
                </div>
                

                <button className="theme-btn" onClick={toggleTheme}>Theme</button>
                {loggedIn ? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <button onClick={handleLogin}>Login with Spotify</button>
                )}
            </div>
        </>
    );
}

export default Home;
