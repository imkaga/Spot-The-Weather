import React, { useState, useEffect } from 'react';
import { getProfile, getTopTracks } from './Utils'; 

export default function Profile() {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [followersCount, setFollowersCount] = useState(0);
    const [topTracks, setTopTracks] = useState([]);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (accessToken) {
            getProfile(accessToken, refreshToken)
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

            getTopTracks(accessToken)
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

    return (
        <>
            <h3>Cześć, {userName}!</h3>
            <button onClick={() => window.open(`https://open.spotify.com/user/${userId}`, '_blank')} className="spotify-profile-button">
                Go to Spotify Profile
            </button>
            <img src={profilePicture} alt="Profile" /> {/* Display profile picture */}
            <p>Followers: {followersCount}</p> {/* Display followers count */}
            
            <h2>Top 10 Piosenek:</h2>
            <ol className="numbered-list">
    {topTracks.map((track, index) => (
        <li key={track.id}>
            {track.name} - {track.artists.map(artist => artist.name).join(', ')}
        </li>
    ))}
</ol>


        </>
    )
}
