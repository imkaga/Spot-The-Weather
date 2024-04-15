import React, { useState } from 'react';
import Tier from './Tier';
import '../styles/TierList.css';

const TierList = () => {
  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const items = ['Item 1', 'Item 2', 'Item 3', 'TEST'];

  const [droppedItems, setDroppedItems] = useState({});

  const handleDrop = (tier) => (itemId) => {
    setDroppedItems((prevItems) => ({
      ...prevItems,
      [tier]: [...(prevItems[tier] || []), itemId],
    }));
  };

  const handleClearDrop = (tier, itemId) => {
    setDroppedItems((prevItems) => ({
      ...prevItems,
      [tier]: prevItems[tier].filter((id) => id !== itemId),
    }));
  };

  return (
    <div className="tier-list-container">
      <h1>Tier List</h1>

      <div className="tier-list">
        {/* Render tier pairs (e.g., S S, A A, B B, C C, D D) */}
        {tiers.map((tier) => (
          <div key={tier} className="tier-pair">
            <div className="tier">
              <h2>{tier}</h2>
              {/* Render dropped items for the current tier */}
              <ul className="dropped-items">
                {droppedItems[tier]?.map((itemId) => (
                  <li key={itemId}>
                    {itemId}
                    <button onClick={() => handleClearDrop(tier, itemId)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Render Tier component */}
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
    </div>
  );
};

export default TierList;
