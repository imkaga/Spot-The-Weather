import { openWeatherApiKey, openWeatherApiUrl, spotifyClientId, spotifyClientSecret, spotifyRedirectUri } from './ApiKeys';

export const apiKey = openWeatherApiKey;
export const clientId = spotifyClientId;
export const clientSecret = spotifyClientSecret;
export const redirectUri = spotifyRedirectUri;
export const apiUrl = openWeatherApiUrl;

export async function authenticate() {
    // Function to handle authentication flow
    // Redirect user to Spotify authorization endpoint
    const scopes = ['user-read-private', 'user-read-email', 'user-top-read']; // Add necessary scopes
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

// Other imports and exports remain the same

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

// Utils.js

export const getRecommendations = async (accessToken, seedArtists, seedGenres, seedTracks) => {
    const url = `https://api.spotify.com/v1/recommendations?seed_artists=${seedArtists}&seed_genres=${seedGenres}&seed_tracks=${seedTracks}`;
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

