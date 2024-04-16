import React, { useState, useEffect } from 'react';
import { getTopArtists, getRandomArtists, loggedin } from './Utils'; // Import necessary functions from utils.js

const TierList = () => {
  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const [droppedItems, setDroppedItems] = useState({ S: [], A: [], B: [], C: [], D: [] });
  const [draggableItems, setDraggableItems] = useState([]);
  const [numArtists, setNumArtists] = useState(10); // Default number of artists to display
  const [droppedArtistIds, setDroppedArtistIds] = useState(new Set());

  useEffect(() => {
    const fetchTopArtistsData = async () => {
      try {
        if (!loggedin()) {
          console.log('User not logged in');
          return;
        }

        const accessToken = localStorage.getItem('access_token');
        const initialDroppedItems = tiers.reduce((acc, tier) => {
          acc[tier] = [];
          return acc;
        }, {});

        let allArtists = [];
        const artistIdsSet = new Set(); // Use a Set to keep track of unique artist IDs
        const limit = 100; // Maximum limit to fetch more artists
        let offset = 0;

        // Fetch more artists than needed to ensure enough unique ones
        while (artistIdsSet.size < numArtists) {
          const topArtistsData = await getTopArtists(accessToken, limit, offset);
          if (!topArtistsData || !topArtistsData.items || topArtistsData.items.length === 0) {
            break; // No more artists to fetch
          }

          // Filter and collect unique artists
          topArtistsData.items.forEach((artist) => {
            if (!artistIdsSet.has(artist.id)) {
              artistIdsSet.add(artist.id);
              allArtists.push(artist);
            }
          });

          offset += limit;
        }

        // Take only the specified number of unique artists
        const uniqueArtists = allArtists.slice(0, numArtists);

        // Update droppedItems state with fetched artists
        setDroppedItems({ ...initialDroppedItems, items: uniqueArtists });
      } catch (error) {
        console.error('Error fetching top artists:', error);
      }
    };

    // Call the function to fetch data when the component mounts or when numArtists changes
    fetchTopArtistsData();
  }, [numArtists]); // Trigger effect whenever numArtists changes

  // Function to handle dropping an artist into a tier
  const handleDrop = (tier, itemId, e) => {
  e.preventDefault();

  // Update droppedItems state to add the dropped artist to the specified tier
  setDroppedItems((prevItems) => ({
    ...prevItems,
    [tier]: [...prevItems[tier], itemId],
  }));

  // Remove the dropped artist from draggableItems
  setDraggableItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
};


  // Function to remove an artist from a tier
  const handleClearDrop = (tier, itemId) => {
    // Remove the dropped item (artist) from the specified tier
    setDroppedItems((prevItems) => ({
      ...prevItems,
      [tier]: prevItems[tier].filter((item) => item.id !== itemId),
    }));
  };

  // Function to allow dropping items
  const allowDrop = (e) => {
    e.preventDefault();
  };

  // Component to render a draggable artist
  const DraggableArtist = ({ artist, isSplitName }) => {
    const imageUrl = artist.images && artist.images.length > 0 ? artist.images[0].url : '';
    console.log('Image URL:', imageUrl); // Log the image URL
  
    const handleDragStart = (e) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ id: artist.id, imageUrl }));
    };
    
  
    return (
      <div className="draggable-artist" draggable onDragStart={handleDragStart}>
        {imageUrl ? (
          <img src={imageUrl} alt={artist.name} style={{ width: 90, height: 90 }} /> // Ten poprawnie działający image
        ) : (
          <div style={{ width: 90, height: 90, backgroundColor: 'lightgray', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            No Image
          </div>
        )}
        {/* Render artist name as split parts only when isSplitName is true and numArtists is 10 */}
        {isSplitName && numArtists === 10 ? (
          artist.name.split(' ').map((part, index) => (
            <p key={index} style={{ margin: '0.2em 0' }}>{part}</p>
          ))
        ) : (
          <p>{artist.name}</p>
        )}
      </div>
    );
  };
  
  // Component to render a tier
  const Tier = ({ tier }) => {
    const handleDropLocal = (e) => {
      e.preventDefault();
      const { id, imageUrl } = JSON.parse(e.dataTransfer.getData('application/json'));
    
      // Update droppedItems
      setDroppedItems((prevItems) => ({
        ...prevItems,
        [tier]: [...prevItems[tier], { id, imageUrl }],
      }));
    
      // Remove the dropped item from draggableItems
      setDraggableItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };
    

    const handleItemClick = (itemId) => {
      // Remove item (artist) from droppedItems of the current tier
      handleClearDrop(tier, itemId);
    };
    

    return (
      <div className="tier" onDrop={handleDropLocal} onDragOver={allowDrop}>
        {/* Render dropped items (artists) for the current tier */}
        {droppedItems[tier]?.map((artist) => (
  <div key={artist.id} className="artist-item" onClick={() => handleItemClick(artist.id)}>
    {artist.imageUrl ? (
      <img src={artist.imageUrl} alt={artist.name} style={{ width: 90, height: 90 }} />
    ) : (
      <div style={{ width: 90, height: 90, backgroundColor: 'lightgray', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        No Image
      </div>
    )}
    <p>{artist.name}</p>
  </div>
))}
      </div>
    );
  };

  return (
    <div className="tier-list-container">
      <h1>Tier List</h1>

      {/* Render Tier components for each tier */}
      <div className="tier-list">
        {tiers.map((tier) => (
          <div key={tier} className="tier-pair">
            <div className={`tier-name tier-${tier.toLowerCase()}`}>
              <h2>{tier}</h2>
            </div>
            {/* Render Tier component for the current tier */}
            <Tier tier={tier} /> {/* Pass tier prop to Tier component */}
          </div>
        ))}
      </div>

      {/* Dropdown to select number of artists */}
      <div>
        <label htmlFor="numArtists">Number of Artists:</label>
        <select id="numArtists" value={numArtists} onChange={(e) => setNumArtists(parseInt(e.target.value))}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

        
      {/* Render draggable items (artists) */}
      <div className="items-container">
        {droppedItems.items?.map((artist) => (
          <DraggableArtist key={artist.id} artist={artist} isSplitName={true} />
        ))}
      </div>
    </div>
  );
};

export default TierList;
