import React, { useState, useEffect } from "react";
import { searchMusicRecommendations, loggedin } from "./Utils";
import * as Utils from "./Utils"; // Import functions from Utils.js

const FindMusic = () => {
  // State declarations
  const [selectedGenre, setSelectedGenre] = useState("");
  const [tempo, setTempo] = useState("");
  const [popularity, setPopularity] = useState({
    min: 0,
    max: 100,
    target: 50,
  });
  const [limit, setLimit] = useState(10); // Initialize limit state
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [playlistId, setPlaylistId] = useState(""); // State to store the playlist ID
  const [loggedIn, setLoggedIn] = useState(false); // State for user login status
  const [subgenres, setSubgenres] = useState([]); // State for subgenres
  const [selectedSubgenre, setSelectedSubgenre] = useState(""); // State for selected subgenre
  const [userId, setUserId] = useState(''); // State for storing user's Spotify user ID
  const [userName, setUserName] = useState(''); // State for storing user's name  

  useEffect(() => {
    setLoggedIn(loggedin()); // Check if user is logged in when component mounts
    setPlaylistId("YOUR_PLAYLIST_ID_HERE");
  }, []);

  useEffect(() => {
    Utils.handleAuthorizationCode()
      .then(() => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          Utils.getProfile(accessToken)
            .then(data => {
              if (data) {
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
  

  const handleLogin = Utils.authenticate; // Function for handling login

  const findOrCreatePlaylist = async (accessToken, userId) => {
    try {
      const playlistName = "Spot The Weather - Wyszukiwarka";
  
      // Check if the playlist already exists for the user
      const existingPlaylistId = await getPlaylistId(accessToken, userId, playlistName);
  
      if (existingPlaylistId) {
        // Playlist already exists, return the existing playlist ID
        return existingPlaylistId;
      } else {
        // Playlist doesn't exist, create a new playlist
        const playlistResponse = await createPlaylist(accessToken, userId, playlistName);
        return playlistResponse.id;
      }
    } catch (error) {
      console.error("Error finding or creating playlist:", error);
      throw error; // Propagate the error for handling upstream
    }
  };
  
  const getPlaylistId = async (accessToken, userId, playlistName) => {
    try {
      const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch playlists! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Find the playlist by name (case-insensitive match)
      const existingPlaylist = data.items.find(
        (playlist) =>
          playlist.name.toLowerCase() === playlistName.toLowerCase() && playlist.owner.id === userId
      );
  
      return existingPlaylist ? existingPlaylist.id : null;
    } catch (error) {
      console.error("Error getting playlist ID:", error);
      throw error; // Propagate the error for handling upstream
    }
  };

  const createPlaylist = async (accessToken, userId, playlistName) => {
  try {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        public: true,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create playlist! Status: " + response.status);
    }

    const playlistData = await response.json();
    return playlistData;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error; // Propagate the error for handling upstream
  }
};

const handleAddToPlaylist = async (trackUri) => {
  try {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("Access token not found");
      return;
    }

    const apiUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
    const playlistId = await findOrCreatePlaylist(accessToken, userId);

    // Filter recommendedTracks to include only track URIs
    const trackUris = recommendedTracks.map((track) => track.uri);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }), // Pass only the selected track URI
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("Track added to playlist successfully!");
  } catch (error) {
    console.error("Error adding track to playlist:", error);
  }
};


  // Event handler functions
  const handleGenreChange = (event) => {
    const selectedMainGenre = event.target.value;
    setSelectedGenre(selectedMainGenre);
  
    // Format and set available subgenres based on selected main genre
    const formattedSubgenres = (genreSubgenres[selectedMainGenre] || []).map(subgenre => formatSubgenre(subgenre));
    setSubgenres(formattedSubgenres);
  };

  const formatSubgenre = (subgenre) => {
    // Split the subgenre string by spaces and capitalize each word
    return subgenre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  

  const handleSubgenreChange = (event) => {
    const selectedSubgenre = event.target.value;
    setSelectedSubgenre(selectedSubgenre);
  };

  const handleTempoChange = (event) => {
    setTempo(event.target.value);
  };

  // Helper functions to get min and max tempo based on selected tempo option
  const getMinTempo = (tempo) => {
    switch (tempo) {
      case "fast":
        return 120;
      case "slow":
        return 60;
      case "calm":
        return 90;
      default:
        return 0;
    }
  };

  const getMaxTempo = (tempo) => {
    switch (tempo) {
      case "fast":
        return 180;
      case "slow":
        return 100;
      case "calm":
        return 120;
      default:
        return 200;
    }
  };

  const handlePopularityChange = (event) => {
    const selectedValue = event.target.value;
    const [min, max] = selectedValue.split("-").map(Number);
    setPopularity({ min, max });
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value)); // Parse the value to integer and update the limit state
  };

  // Lista gatunków
  const genreSubgenres = {
    pop: [
      "dance-pop",
      "synth-pop",
      "pop-film",
      "r-n-b"
    ],
    "hip-hop": [
      "rap",
      "trap",
    ],
    rock: [
      "alt-rock",
      "black-metal",
      "emo",
      "goth",
      "hard-rock",
      "heavy-metal",
      "new-age",
      "new-wave",
      "metal",
      "metalcore",
      "punk",
      "post-punk",
    ],
    indie: [
      "dream-pop",
      "indie-rock",
      "indie-shoegaze",
      "indietronica",
      "indie-pop",
    ],
    jazz: [], // Brak podgatunków do dopasowania
    classical: [
      "opera",
      "piano",
      "baroque",
      "romantic"
    ],
    electronic: [
      "dubstep",
      "edm",
      "house",
      "techno",
      "trance",
    ],
    disco: [
      "funk",
      "nu-disco"
    ],
    "new-age": [ // Prawdopodobnie do wyjebania
      "ambient",
    ],
    folk: [
      "folk-rock",
      "sertanejo",
      "tango",
      "country"
    ],
    inne: [
      "anime",
      "blues",
      "bajo jajo"
    ],
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedGenre) {
      alert("Proszę wybrać gatunek!");
      return; // Exit early if no genre is selected
    }
  
    const genreToSearch = selectedSubgenre || selectedGenre; // Use subgenre if selected, otherwise use main genre
  
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("Access token not found");
        return;
      }
  
      // Ensure that the genre name is lowercase for API compatibility
      const lowercaseGenreToSearch = genreToSearch.toLowerCase();
  
      let apiUrl = `https://api.spotify.com/v1/recommendations?seed_genres=${encodeURIComponent(
        lowercaseGenreToSearch
      )}`;
  
      // Add tempo parameter if tempo is selected
      if (tempo) {
        apiUrl += `&min_tempo=${getMinTempo(tempo)}&max_tempo=${getMaxTempo(
          tempo
        )}`;
      }
  
      apiUrl += `&min_popularity=${popularity.min}&max_popularity=${popularity.max}&limit=${limit}`;
  
      console.log("API URL:", apiUrl); // Log the constructed API URL to the console
  
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.error) {
        throw new Error(`API error! ${data.error.message}`);
      }
  
      setRecommendedTracks(data.tracks);
    } catch (error) {
      console.error("Error fetching recommended tracks:", error);
    }
  };
  

  return (
    <>
      {loggedIn ? (
        <>
        <div className="card">
          <h1>Find Music</h1>
          <p>
            Ważne! Popularność muzyki nie jest określana przez ilość odsłuchań,
            a jak często była odsłuchiwana w ostatnim czasie.{" "}
          </p>
          <br></br>
          <div>
            <form onSubmit={handleSubmit}>
            <div class="form-container">
              <label>Gatunek:</label>
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
                <option value="inne">Inne</option>
              </select>

              <label>Podgatunek:</label>
              <select value={selectedSubgenre} onChange={handleSubgenreChange}>
                <option value="">-</option>
                {subgenres.map((subgenre, index) => (
                  <option key={index} value={subgenre}>
                    {subgenre}
                  </option>
                ))}
              </select>


              <label>Tempo:</label>
              <select value={tempo} onChange={handleTempoChange}>
                <option value="">-</option>
                <option value="fast">Szybkie</option>
                <option value="slow">Wolne</option>
                <option value="calm">Spokojne</option>
              </select>

              <label>Popularność:</label>
              <select
                value={`${popularity.min}-${popularity.max}`}
                onChange={handlePopularityChange}
              >
                <option value="">-</option>
                <option value="0-15">Mało popularne</option>
                <option value="16-40">Znane</option>
                <option value="41-70">Popularne</option>
                <option value="71-100">Bardzo Popularne</option>
              </select>

              <label>Ilość piosenek:</label>
              <select value={limit} onChange={handleLimitChange}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
            </div>
              <button type="submit">Recommend Songs</button>
            </form>
          </div>

          <div>
            <h3>Recommended Songs</h3>
            <div className="recommended-main">
              <ul>
                {recommendedTracks.map((track, index) => (
                  <li key={index}>
                    <div>
                      <img
                        src={track.album.images[0].url}
                        alt="Album Cover"
                        style={{ width: "50px", height: "50px" }}
                      />
                    </div>
                    <div>
                      <span style={{ fontWeight: "bold" }}>
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </span>{" "}
                      - {track.name}
                      {/* Add button to add recommended tracks to playlist */}
      {recommendedTracks.length > 0 && (
        <button onClick={handleAddToPlaylist}>
          Add Songs to Playlist "Spot The Weather - Wyszukiwarka"
        </button>
      )}
                      {/* Check if track.preview_url exists */}
                      {track.preview_url ? (
                        // If preview_url is available, render the audio player
                        <audio controls>
                          <source src={track.preview_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        // If preview_url is not available, display the message
                        <p className="song-preview">Podgląd piosenki niedostępny</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </div>
        </>
      ) : (
        <>
          <h3>Żeby wyświetlić zaawartość tej strony - Zaloguj Się!</h3>
          <button onClick={handleLogin}>Login with Spotify</button>
        </>
      )}
    </>
  );
};

export default FindMusic;
