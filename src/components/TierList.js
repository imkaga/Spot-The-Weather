// src/TierList.js
import React, { useState } from 'react';
import Tier from './Tier';
import '../styles/TierList.css';

const TierList = () => {
  // Define tiers and items
  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const items = ['Item 1', 'Item 2', 'Item 3', 'TEST']; // Define your items here

  // State to track dropped items in each tier
  const [droppedItems, setDroppedItems] = useState({});

  // Handle drop event for each tier
  const handleDrop = (tier) => (itemId) => {
    setDroppedItems((prevItems) => ({
      ...prevItems,
      [tier]: [...(prevItems[tier] || []), itemId],
    }));
  };

  // Handle removing a dropped item from a tier
  const handleClearDrop = (tier, itemId) => {
    setDroppedItems((prevItems) => ({
      ...prevItems,
      [tier]: prevItems[tier].filter((id) => id !== itemId),
    }));
  };

  // Render the tier list, draggable items, and dropped items
  return (
    <div className="tier-list-container">
      <h1>Tier List</h1>

      {/* Render tier boxes */}
      <div className="tier-list">
        {tiers.map((tier) => (
          <div key={tier} className="tier-container">
            <Tier tier={tier} onDrop={handleDrop(tier)} />
          </div>
        ))}
      </div>

      {/* Render draggable items */}
      <div className="items-container">
        {items.map((item) => (
          <div
            key={item}
            className="item"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Render tier tables with dropped items */}
      <div className="tier-tables">
        {tiers.map((tier) => (
          <div key={tier} className="tier-table">
            <h2>{tier}</h2>
            <ul className="dropped-items">
              {/* Map over dropped items in each tier */}
              {droppedItems[tier]?.map((itemId) => (
                <li key={itemId}>
                  {itemId}
                  <button onClick={() => handleClearDrop(tier, itemId)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierList;
