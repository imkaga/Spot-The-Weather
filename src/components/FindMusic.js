import React, { useState } from 'react';
import { searchMusicRecommendations } from './Utils';

const FindMusic = () => {
  // State declarations
  const [selectedGenre, setSelectedGenre] = useState('');
  const [tempo, setTempo] = useState('');
  const [popularity, setPopularity] = useState({ min: 0, max: 100, target: 50 });
  const [limit, setLimit] = useState(10); // Initialize limit state
  const [recommendedTracks, setRecommendedTracks] = useState([]);

  // Event handler functions
  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
  };

  const handleTempoChange = (event) => {
    setTempo(event.target.value);
  };

  const handlePopularityChange = (event) => {
    const selectedValue = event.target.value;
    const [min, max] = selectedValue.split('-').map(Number);
    setPopularity({ min, max });
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value)); // Parse the value to integer and update the limit state
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedGenre) {
      alert('Proszę wybrać gatunek!');
      return; // Exit early if no genre is selected
    }
  
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await searchMusicRecommendations(
        accessToken,
        selectedGenre,
        tempo,
        popularity, // Ensure that popularity object is passed here
        limit
      );
      setRecommendedTracks(response.tracks);
    } catch (error) {
      console.error('Error fetching recommended tracks:', error);
    }
  };
  

  return (
    <>
      <h1>Find Music</h1>
      <p>Ważne! Popularność muzyki nie jest określana przez ilość odsłuchań, a jak często była odsłuchiwana w ostatnim czasie. </p>
      <br></br>
      <div>
        <form onSubmit={handleSubmit}>
          <label>Select Genre:</label>
          <select value={selectedGenre} onChange={handleGenreChange}>
            <option value="">-</option>
            <option value="pop">Pop</option>
            <option value="hip-hop">Rap/Hip-Hop</option>
            <option value="rock">Rock/Metal</option>
            <option value="indie">Indie</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="electronic">Electronic</option>
            <option value="disco">Disco</option>
            <option value="new-age">New Age</option>
            <option value="folk">Folk</option>
          </select>

          <label>Tempo:</label>
          <select value={tempo} onChange={handleTempoChange}>
            <option value="">-</option>
            <option value="fast">Fast</option>
            <option value="slow">Slow</option>
            <option value="calm">Calm</option>
          </select>

          <label>Popularity:</label>
          <select value={`${popularity.min}-${popularity.max}`} onChange={handlePopularityChange}>
            <option value="">-</option>
            <option value="0-5">Underground</option>
            <option value="6-15">Niche</option>
            <option value="16-40">Somewhat Known</option>
            <option value="41-70">Popular</option>
            <option value="71-100">Very Popular</option>
          </select>

          <label>Number of Songs:</label>
          <select value={limit} onChange={handleLimitChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>

          <button type="submit">Recommend Songs</button>
        </form>
      </div>

      <div>
        <h3>Recommended Songs</h3>
        <div class="recommended">
        <ul>
          {recommendedTracks.map((track, index) => (
            <li key={index}>
              <div>
                <img src={track.album.images[0].url} alt="Album Cover" style={{ width: '50px', height: '50px' }} />
              </div>
              <div>
              <span style={{ fontWeight: 'bold' }}>{track.artists.map(artist => artist.name).join(', ')}</span> - {track.name}
                {track.preview_url && (
                  <audio controls>
                    <source src={track.preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </>
  );
};

export default FindMusic;
