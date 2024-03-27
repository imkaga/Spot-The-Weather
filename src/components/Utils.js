import { openWeatherApiKey, openWeatherApiUrl, spotifyClientId, spotifyClientSecret, spotifyRedirectUri } from './ApiKeys';
import html2canvas from 'html2canvas';

export const apiKey = openWeatherApiKey;
export const clientId = spotifyClientId;
export const clientSecret = spotifyClientSecret;
export const redirectUri = spotifyRedirectUri;
export const apiUrl = openWeatherApiUrl;

export async function authenticate() {
    // Function to handle authentication flow
    // Redirect user to Spotify authorization endpoint
    const scopes = [
        'user-read-private', 
        'user-read-email', 
        'user-top-read', 
        'playlist-modify-public', 
        'playlist-modify-private'
    ]; // Add necessary scopes for playlist modification
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=code`;
}

export async function handleAuthorizationCode() {
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
            localStorage.setItem('login_time', Date.now()); // Update login time
            window.location.href = '/';
        } catch (error) {
            console.error('Error exchanging authorization code:', error);
        }
    } else {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const loginTime = localStorage.getItem('login_time');

        if (accessToken && refreshToken && loginTime) {
            const currentTime = Date.now();
            const sessionDuration = 60 * 60 * 1000; // Session duration in milliseconds (1 hour)

            if (currentTime - parseInt(loginTime) > sessionDuration) {
                // Session expired, refresh access token
                try {
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    localStorage.setItem('access_token', newAccessToken);
                    localStorage.setItem('login_time', Date.now()); // Update login time
                    console.log('Access Token Refreshed:', newAccessToken);
                } catch (refreshError) {
                    console.error('Error refreshing access token:', refreshError);
                    handleLogout(); // Log out user if refresh token fails
                }
            }
        }
    }
}

// Utils.js

export async function handleLogout(logoutCallback) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('login_time'); // Remove login time on logout
    logoutCallback(false); // Call the callback function to update login state
    window.location.href = '/';
}


export async function getProfile(accessToken) {
    // Function to fetch user's profile
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

export async function refreshAccessToken(refreshToken) {
    // Function to refresh access token
    const clientCredentials = btoa(`${clientId}:${clientSecret}`);
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

export async function getTopArtists(accessToken) {
    // Function to fetch user's top artists
    console.log('Access Token:', accessToken); // Log the access token
    const url = 'https://api.spotify.com/v1/me/top/artists?limit=5';
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        console.error('Failed to fetch top artists. Status:', response.status);
        const errorData = await response.json();
        console.error('Error data:', errorData);
        throw new Error('Failed to fetch top artists');
    }
    const data = await response.json();
    console.log('Top Artists Data:', data); // Log the response data
    return data;
}

export async function fetchWeatherData(city) {
    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        localStorage.setItem('lastCity', city);
        return { data, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: 'Error fetching weather data. Please try again later.' };
    }
}

export async function getTopTracks(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch top tracks. Status:', response.status);
            const errorData = await response.json();
            console.error('Error data:', errorData);
            throw new Error('Failed to fetch top tracks');
        }

        const data = await response.json();
        console.log('Top Tracks Data:', data); // Log the response data
        return data;
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        throw error;
    }
}

export const getRecommendations = async (accessToken, seedArtists, seedGenres, seedTracks) => {
    let url = `https://api.spotify.com/v1/recommendations?seed_genres=${seedGenres}`;
    if (seedArtists) {
        url += `&seed_artists=${seedArtists}`;
    }
    if (seedTracks) {
        url += `&seed_tracks=${seedTracks}`;
    }
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
    }
    return response.json();
};

export async function createPlaylist(accessToken, userId, weatherData) {
    const cityName = weatherData.name; // Extract city name from weather data
    const weatherCondition = weatherData.weather[0].main.toLowerCase(); // Extract weather condition from weather data
    const formattedDate = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    const playlistName = `${cityName}-${weatherCondition}_${formattedDate}`;

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
}

export async function getRecommendedArtists(accessToken, seedGenres, minPopularity, maxPopularity, limit = 5) {
    try {
        // Ensure seedGenres is an array
        if (!Array.isArray(seedGenres)) {
            throw new Error('seedGenres must be an array');
        }

        // Construct query parameters
        const queryParams = new URLSearchParams({
            limit: limit,
            seed_genres: seedGenres.join(','),
            min_popularity: minPopularity,
            max_popularity: maxPopularity
        });

        // Construct the URL for recommendations
        const url = `https://api.spotify.com/v1/recommendations?${queryParams}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch recommended artists. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Recommended Artists Data:', data); // Log the response data
        
        return data;
    } catch (error) {
        console.error('Error fetching recommended artists:', error);
        throw error;
    }
}

// Define popularityValues
// Utils.js

export const popularityValues = {
    Niche: { min: 0, max: 25 },
    Underground: { min: 26, max: 50 },
    Popular: { min: 51, max: 75 },
    VeryPopular: { min: 76, max: 100 }
  };
  
  
  export async function searchMusicRecommendations(accessToken, selectedGenre, tempo, popularity, limit) {
    try {
        const queryParams = new URLSearchParams({
            seed_genres: selectedGenre || '',
            min_tempo: tempo === 'fast' ? 120 : tempo === 'slow' ? 60 : 90,
            max_tempo: tempo === 'fast' ? 180 : tempo === 'slow' ? 90 : 120,
            min_popularity: popularity.min,
            max_popularity: popularity.max,
            limit: limit >= 10 && limit <= 30 ? limit : 10,
        });

        const url = `https://api.spotify.com/v1/recommendations?${queryParams}`;
        
        console.log('Fetching recommendations from:', url); // Add this line for logging
        
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recommended tracks:', error);
        throw error;
    }
}

export const saveAsImage = async (elementId) => {
    const element = document.getElementById(elementId);
    try {
        const canvas = await html2canvas(element);
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'weather_data.png';
        link.href = image;
        link.click();
    } catch (error) {
        console.error('Error saving image:', error);
    }
};