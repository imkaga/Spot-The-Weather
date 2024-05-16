import React, { useState, useEffect } from 'react';
import * as Utils from './Utils'; // Import functions from Utils.js
import { handleHeaderItemClick } from './Header';

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
    const [lastActivityTime, setLastActivityTime] = useState(Date.now()); // State for tracking user activity
    const [sessionExpired, setSessionExpired] = useState(false); // State for session expiration popup // W RAZIE CZEGO DO WYRZUCENIA
    const [currentPreview, setCurrentPreview] = useState(null); // State to track current audio preview
    const [playingTrack, setPlayingTrack] = useState(null); // State to track the currently playing track
    const [isPlaying, setIsPlaying] = useState(false);
    
    
    const handleLogin = Utils.authenticate; // Function for handling login

    const handleLogout = () => {
        Utils.handleLogout(setLoggedIn); // Pass setLoggedIn as an argument
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

    useEffect(() => {
        // Check login status and session expiry on component mount
        checkLoginStatus();
        // Add event listener for user activity
        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keypress', handleUserActivity);

        return () => {
            // Cleanup event listener on component unmount
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keypress', handleUserActivity);
        };
    }, []);

    useEffect(() => {
        // Check login status and session expiry when last activity time changes
        checkLoginStatus();
    }, [lastActivityTime]);

    const checkLoginStatus = () => {
        const loginTime = localStorage.getItem('login_time');
        const isLoggedIn = localStorage.getItem('access_token') !== null;

        if (isLoggedIn && loginTime) {
            const currentTime = Date.now();
            const sessionDuration = 60 * 60 * 1000; // Session duration in milliseconds (1 hour)

            if (currentTime - parseInt(loginTime) > sessionDuration) {
                // Session expired, logout user
                handleLogout();
            } else {
                setLoggedIn(true);
            }
        }
    };

    const handleUnauthorizedError = (error) => {
        if (error.response && error.response.status === 401) {
            setSessionExpired(true); // Set session expiration state
            handleLogout(); // Log out the user
        }
    };

    useEffect(() => {
        if (sessionExpired) {
            alert('Sesja wygasła. (401)'); // Display popup for session expiration
        }
    }, [sessionExpired]);

    

    const handleUserActivity = () => {
        // Update last activity time when user interacts with the page
        setLastActivityTime(Date.now());
    };

    const handleBeforeUnload = () => {
        // Clear recommended tracks from local storage when the user closes the app
        localStorage.removeItem('recommendedTracks');
    };

    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
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
                    if (error.response && error.response.status === 401) {
                        handleLogout(); // Log out user if 401 error occurs
                    }
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

    useEffect(() => { 
        const storedRecommendedTracks = localStorage.getItem('recommendedTracks');
        if (storedRecommendedTracks) {
            setRecommendedTracks(JSON.parse(storedRecommendedTracks));
        }
    }, []);
    
    useEffect(() => {
        return () => {
          if (currentPreview) {
            Utils.pausePreview(currentPreview); // Pause the audio preview
            setCurrentPreview(null); // Reset current audio preview
            setPlayingTrack(null); // Reset playing track
            setIsPlaying(false); // Reset playing state
          }
        };
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
                    // Alert the user for an invalid city name
                    alert('Niepoprawna nawzwa miejscowości');
                } else {
                    setWeatherData(data);
                    setErrorMessage('');
                    //localStorage.setItem('lastCity', city);
                    // setRefreshCount(0); // Reset refresh count when city is changed
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

    const recommendSongs = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const weatherGenres = mapWeatherToGenres(weatherData);
    
            // Calculate total weight sum for genre probabilities
            const totalWeight = weatherGenres.reduce((sum, genre) => sum + genre.weight, 0);
    
            // Randomly select a genre based on weighted probabilities
            let randomNumber = Math.random() * totalWeight;
            let selectedGenre = null;
    
            for (const genre of weatherGenres) {
                if (randomNumber < genre.weight) {
                    selectedGenre = genre.genre;
                    break;
                }
                randomNumber -= genre.weight;
            }
    
            // Fetch recommendations based on the selected genre
            const response = await Utils.getRecommendations(accessToken, null, [selectedGenre], null);
            localStorage.setItem('recommendedTracks', JSON.stringify(response.tracks));
            setRecommendedTracks(response.tracks);
    
            localStorage.setItem('lastRefreshTime', Date.now());
            setLastRefreshTime(Date.now());
    
            setRefreshCount((prevCount) => {
                if (prevCount + 1 === 5) {
                    setCountdown(5 * 60 * 1000);
                    setShowButton(false);
                }
                return prevCount + 1;
            });
        } catch (error) {
            console.error('Error fetching recommended tracks:', error);
        }
    };
    
    const mapWeatherToGenres = (weatherData) => {
        const weatherCondition = weatherData.weather[0].main.toLowerCase();
    
        switch (weatherCondition) {
            case 'clear':
                return [
                    { genre: 'pop', weight: 40 },
                    { genre: 'hip-hop', weight: 20 },
                    { genre: 'electronic', weight: 15 },
                    { genre: 'disco', weight: 15 },
                    { genre: 'rock', weight: 5 },
                    { genre: 'metal', weight: 5 }
                ];
            case 'rain':
                return [
                    { genre: 'classical', weight: 40 },
                    { genre: 'jazz', weight: 25 },
                    { genre: 'hip-hop', weight: 15 },
                    { genre: 'folk', weight: 10 },
                    { genre: 'rock', weight: 5 },
                    { genre: 'metal', weight: 5 }
                ];
            case 'clouds':
                return [
                    { genre: 'pop', weight: 30 },
                    { genre: 'jazz', weight: 30 },
                    { genre: 'rock', weight: 10 },
                    { genre: 'metal', weight: 10 },
                    { genre: 'indie', weight: 10 },
                    { genre: 'new-age', weight: 10 }
                ];
            case 'thunder':
                return [
                    { genre: 'rock', weight: 25 },
                    { genre: 'metal', weight: 25 },
                    { genre: 'classical', weight: 20 },
                    { genre: 'pop', weight: 10 },
                    { genre: 'hip-hop', weight: 10 },
                    { genre: 'electronic', weight: 10 },
                ];
            case 'snow':
                return [
                    { genre: 'hip-hop', weight: 30 },
                    { genre: 'jazz', weight: 30 },
                    { genre: 'electronic', weight: 30 },
                    { genre: 'classical', weight: 10 },
                ]
            default:
                return [
                    { genre: 'pop', weight: 100 }
                ];
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

                console.log('Utworzono playlistę i dodano utwory');
            } else {
                console.error('Nie znaleziono tokena dostępu, ID użytkownika lub danych pogodowych');
            }
        } catch (error) {
            console.error('Wystąpił problem przy zapisywaniu playlisty:', error);
        }
    };

    const createPlaylist = async (accessToken, userId, weatherData) => { // Function for creating playlist
        const cityName = weatherData.name; // Extract city name from weather data
        //const weatherCondition = weatherData.weather[0].main.toLowerCase(); // Extract weather condition from weather data
        const weatherCondition = translateWeatherCondition(weatherData.weather[0].main.toLowerCase());
        const formattedDate = `${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;
        const playlistName = `${cityName} ${weatherCondition} ${formattedDate}`;

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

    

    const handlePreviewPlay = (previewUrl, track) => {
        if (currentPreview) {
            Utils.pausePreview(currentPreview);
        }
    
        const audio = Utils.playPreview(previewUrl, setCurrentPreview);
        setPlayingTrack(track);
        setIsPlaying(true); // Set playing state to true when starting playback
    
        // Add event listener for audio ended to change button text when song finishes playing
        audio.addEventListener('ended', () => {
            setIsPlaying(false); // Update playing state to false when song finishes playing
        });
    };
    
      const handlePause = () => {
        if (currentPreview) {
          Utils.pausePreview(currentPreview);
          setIsPlaying(false); // Update playing state to false when pausing
        }
      };

      const handleHeaderClick = (itemName) => {
        const clickedItem = handleHeaderItemClick(itemName);
        if (typeof clickedItem === "string") {
            // Perform actions based on the clicked item
            console.log("Clicked item:", clickedItem);
            // Example: pause music if a specific item is clicked
            Utils.pausePreview(currentPreview);
          setIsPlaying(false); // Update playing state to false when pausing
        }
    };
    

    const pausePreviewAndSetIsPlaying = () => {
        if (currentPreview) {
            Utils.pausePreview(currentPreview);
            setIsPlaying(false);
        }
    };

      const handleHeaderItemClick = () => {
        console.log("Header item clicked in Home");
        if (currentPreview) {
            Utils.pausePreview(currentPreview);
            setIsPlaying(false); // Update playing state to false when pausing
          }
    };

      
      const translateWeatherCondition = (condition) => {
        switch (condition.toLowerCase()) {
            case 'clear':
                return 'Słonecznie';
            case 'rain':
                return 'Deszczowo';
            case 'clouds':
                return 'Pochmurnie';
            case 'thunder':
                return 'Burzowo';
            default:
                return 'Inny';
        }
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
                        <button onClick={handleSearch}>Szukaj</button>
                    </div>

                    {errorMessage && <div className="error"><p>{errorMessage}</p></div>}
                    {weatherData && (
                        <div className="weather">
                            {!loggedIn && ( // Render only if not logged in
                                <>
                                    <h3>Cześć!</h3>
                                    <h4>Jeśli chcesz skorzystać z wszystkich dostępnych opcji aplikacji, zaloguj się.</h4>
                                </>
                            )}
                            {loggedIn && ( // Render only if logged in
                                <h3>Cześć, {userName}!</h3>
                            )}
                            <h2>Pogoda dla miasta {weatherData.name}</h2>
                            <p>Warunki Pogodowe: {translateWeatherCondition(weatherData.weather[0].main)}</p>
                            <p>Temperatura: {Math.round(weatherData.main.temp)}°C</p>
                            <p>Wilgotność: {weatherData.main.humidity}%</p>
                        </div>
                    )}
                    <div className="container">
                    {loggedIn && !showButton && countdown !== null && ( // Check loggedIn and showButton states
                            <div>
                                <p>Wszystkie odświeżenia zostały wykorzystane.</p>
                                {/* <p>You used up all of your refreshes. Please wait:</p> */}

                                <p><b>Proszę poczekać: </b> {Math.floor(countdown / 60000)}:{(countdown % 60000 / 1000).toFixed(0).padStart(2, '0')}</p>
                            </div>
                        )}
                        {loggedIn && showButton && ( // Check both loggedIn and showButton states
                            <button className='recommend-songs' onClick={recommendedTracks.length > 0 ? recommendSongs : recommendSongs}>
                                {recommendedTracks.length > 0 ? "Odśwież rekomendacje" : "Rekomenduj piosenki"}
                            </button>
                        )}
                        {recommendedTracks.length > 0 && (
                            <div>
                                <h3>Rekomendowane piosenki:</h3>
                                <button className='recommend-songs' onClick={savePlaylist}>Zapisz Playlistę</button>
                                <div className="recommended-main">
                                <ul>
                                    {recommendedTracks.map((track, index) => (
                                        <li key={index}>
                                            <div>
                                                {/* Render album image */}
                                                <img src={track.album.images[0].url} alt="Album Cover" style={{ width: '50px', height: '50px' }} />
                                            </div>
                                            <div>
                                                {/* Render track name and artists */}
                                                <span style={{ fontWeight: 'bold' }}>{track.artists.map(artist => artist.name).join(', ')}</span> - {track.name}
                                                {/* Check if track has preview URL and render audio player */}
                                                <br></br> 
                                                {track.preview_url ? (
                                                    <>
                                                        {playingTrack === track && isPlaying ? (
                                                        <button onClick={handlePause}>Zapauzuj</button>
                                                        ) : (
                                                        <button onClick={() => handlePreviewPlay(track.preview_url, track)}>Odtwórz</button>
                                                        )}
                                                    </>
                                                    ) : (
                                                    <p className="song-preview">Podgląd niedostępny</p>
                                                    )}

                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* <button onClick={() => Utils.saveAsImage('weather')}>Save Image</button> */}

                {loggedIn ? null : ( // Render the "Zaloguj się" button only if the user is not logged in
                    <button className="login" onClick={handleLogin}>Zaloguj się ze Spotify</button>
                )}
            </div>
        </>
    );
}

export default Home;