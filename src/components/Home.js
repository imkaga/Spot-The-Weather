import React, { useState, useEffect } from 'react';
import * as Utils from './Utils'; // Import functions from Utils.js

function Home() {
    const [city, setCity] = useState(''); // State for storing the city input
    const [weatherData, setWeatherData] = useState(null); // State for storing weather data
    const [errorMessage, setErrorMessage] = useState(''); // State for error messages
    const [userName, setUserName] = useState(''); // State for storing user's name
    const [loggedIn, setLoggedIn] = useState(false); // State for user login status
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'main'); // State for storing theme
    const [recommendedTracks, setRecommendedTracks] = useState(() => JSON.parse(localStorage.getItem('recommendedTracks')) || []); // State for storing recommended tracks
    const [userId, setUserId] = useState(''); // State for storing user's Spotify user ID
    const [refreshCount, setRefreshCount] = useState(0); // State for storing the refresh count
    const [lastRefreshTime, setLastRefreshTime] = useState(() => parseInt(localStorage.getItem('lastRefreshTime')) || null); // State for storing the last refresh time
    const [countdown, setCountdown] = useState(null); // State for countdown until next refresh
    const [showButton, setShowButton] = useState(true); // State for showing or hiding the refresh button

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
                                setUserId(data.id); // Set the user's Spotify user ID
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

    useEffect(() => { // Effect for handling countdown until next refresh
        const storedLastRefreshTime = localStorage.getItem('lastRefreshTime');
        if (storedLastRefreshTime) {
            const remainingTime = 5 * 60 * 1000 - (Date.now() - parseInt(storedLastRefreshTime));
            if (remainingTime > 0) {
                setCountdown(remainingTime);
                setShowButton(false); // Hide the button when countdown starts
            }
        }
    }, []);
    

    useEffect(() => { // Effect for updating countdown timer
        if (countdown !== null) {
            const timer = setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown <= 0) {
                        clearInterval(timer);
                        setShowButton(true); // Show the button when countdown ends
                        return 0;
                    } else {
                        return prevCountdown - 1000;
                    }
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [countdown]);

    const handleSearch = () => { // Function for handling search
        Utils.fetchWeatherData(city)
            .then(({ data, error }) => {
                if (error) {
                    setErrorMessage(error);
                } else {
                    setWeatherData(data);
                    setErrorMessage('');
                    localStorage.setItem('lastCity', city);
                    setRefreshCount(0); // Reset refresh count when city is changed
                    setShowButton(true); // Show the button after search
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

    const recommendSongs = async () => { // Function for recommending songs
        try {
            console.log('Refreshing recommendations...'); // Console log to indicate refreshing recommendations
            const accessToken = localStorage.getItem('access_token');
            const weatherGenre = mapWeatherToGenres(weatherData); // Get the mapped genre based on weather
            const response = await Utils.getRecommendations(accessToken, null, weatherGenre, null);
            localStorage.setItem('recommendedTracks', JSON.stringify(response.tracks)); // Store recommended tracks in localStorage
            setRecommendedTracks(response.tracks);
            localStorage.setItem('lastRefreshTime', Date.now());
            setLastRefreshTime(Date.now());
            setRefreshCount(prevCount => prevCount + 1);
            if (refreshCount + 1 === 5) {
                setCountdown(5 * 60 * 1000);
                setShowButton(false); // Hide the button after 5 clicks
            }
        } catch (error) {
            console.error('Error fetching recommended tracks:', error);
        }
    };

    const mapWeatherToGenres = (weatherData) => { // Function for mapping weather to genres
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

    const savePlaylist = async () => { // Function for saving playlist
        try {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken && userId && weatherData) { // Make sure weatherData is available
                // Create playlist
                const playlistResponse = await createPlaylist(accessToken, userId, weatherData);
                const playlistId = playlistResponse.id;

                // Add recommended tracks to the playlist
                await addTracksToPlaylist(accessToken, userId, playlistId, recommendedTracks.map(track => track.uri));

                console.log('Playlist created and tracks added successfully');
            } else {
                console.error('Access token, user ID, or weather data not found');
            }
        } catch (error) {
            console.error('Error saving playlist:', error);
        }
    };

    const createPlaylist = async (accessToken, userId, weatherData) => { // Function for creating playlist
        const cityName = weatherData.name; // Extract city name from weather data
        const weatherCondition = weatherData.weather[0].main.toLowerCase(); // Extract weather condition from weather data
        const formattedDate = `${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;
        const playlistName = `${cityName}-${weatherCondition}-${formattedDate}`;

        const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: playlistName,
                public: true,
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to create playlist');
        }
        return response.json();
    };

    const addTracksToPlaylist = async (accessToken, userId, playlistId, trackUris) => { // Function for adding tracks to playlist
        const url = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: trackUris,
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to add tracks to playlist');
        }
        return response.json();
    };

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
                        </div>
                    )}
                    <div className="container">
                        {!showButton && countdown !== null && (
                            <div>
                                <p>You used up all of your refreshes. Please wait:</p>
                                <p>{Math.floor(countdown / 60000)}:{(countdown % 60000 / 1000).toFixed(0).padStart(2, '0')}</p>
                            </div>
                        )}
                        {showButton && (
                            <button onClick={recommendSongs}>Refresh recommendations</button>
                        )}
                        {recommendedTracks.length > 0 && (
                            <div>
                                <h3>Recommended Songs</h3>
                                <ul>
                                    {recommendedTracks.map((track, index) => (
                                        <li key={index}>{track.name} - {track.artists.map(artist => artist.name).join(', ')}</li>
                                    ))}
                                </ul>
                                <button onClick={savePlaylist}>Save Playlist</button>
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
