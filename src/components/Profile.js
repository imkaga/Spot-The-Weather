import React, { useState, useEffect } from 'react';
import * as Utils from './Utils'; // Import all functions from Utils.js

export default function Profile() {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [followersCount, setFollowersCount] = useState(0);
    const [topTracks, setTopTracks] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false); // State for user login status

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (accessToken) {
            setLoggedIn(true); // User is logged in
            Utils.getProfile(accessToken, refreshToken) // Use Utils.getProfile instead of getProfile
                .then(data => {
                    if (data) {
                        setUserName(data.display_name);
                        setUserId(data.id); // Set the user ID
                        setProfilePicture(data.images[0].url); // Assuming there's at least one image
                        setFollowersCount(data.followers.total);
                    }
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                });

            Utils.getTopTracks(accessToken) // Use Utils.getTopTracks instead of getTopTracks
                .then(tracks => {
                    if (tracks) {
                        setTopTracks(tracks.items);
                    }
                })
                .catch(error => {
                    console.error('Error fetching top tracks:', error);
                });
        } else {
            console.error('Access token not found');
        }
    }, []);

    const handleLogin = Utils.authenticate; // Function for handling login

    return (
        <>
            {loggedIn ? ( // Render content if logged in
                <>
                <div className='card'>
                    <h3>Cześć, <b>{userName}!</b></h3>
                    <div className='profpic'>
                    <img src={profilePicture} alt="Profile" className='profpic'/> {/* Display profile picture */}
                    </div>
                    <p>Liczba obserwujących: <b>{followersCount}</b></p> {/* Display followers count */}
                    <button className='recommend-songs' onClick={() => window.open(`https://open.spotify.com/user/${userId}`, '_blank')}>
                        Odwiedź profil na Spotify
                    </button>
                    
                    <ol className="numbered-list">
                    <h2>Top 10 Piosenek:</h2>
                        {topTracks.map((track, index) => (
                            <li key={track.id}>
                                <span style={{ fontWeight: 'bold' }}>{track.artists.map(artist => artist.name).join(', ')}</span> - {track.name}
                            </li>
                        ))}
                    </ol>
                    </div>
                </>
            ) : ( // Render login message and button if not logged in
                <>
                    <h3>Żeby wyświetlić zawartość tej strony - Zaloguj Się!</h3>
                    <button className="login" onClick={handleLogin}>Zaloguj się ze Spotify</button>
                </>
            )}
        </>
    )
}
