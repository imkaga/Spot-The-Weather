import { openWeatherApiKey, openWeatherApiUrl, spotifyClientId, spotifyClientSecret, spotifyRedirectUri } from './ApiKeys';

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
    // Function to handle authorization code
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
            window.location.href = '/';
        } catch (error) {
            console.error('Error exchanging authorization code:', error);
        }
    }
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

export async function addTracksToPlaylist(accessToken, userId, playlistId, trackUris) {
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
}