import React, { useState } from 'react';
import '../styles/TierList.css';

const TierList = () => {
  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const items = ['Item 1', 'Item 2', 'Item 3', 'TEST'];

  const [droppedItems, setDroppedItems] = useState({});

  const handleDrop = (tier, itemId, e) => {
    e.preventDefault(); // Prevent default behavior of drag-and-drop
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

  // Define Tier component within TierList component
  const Tier = ({ tier }) => {
    const handleDropLocal = (itemId, e) => {
      handleDrop(tier, itemId, e); // Call the handleDrop function from TierList component
    };

    const handleItemClick = (itemId) => {
      handleClearDrop(tier, itemId); // Remove item from droppedItems
    };

    const allowDrop = (e) => {
      e.preventDefault(); // Prevent default behavior of drag-and-drop
    };

    return (
      <div className="tier" onDrop={(e) => handleDropLocal(e.dataTransfer.getData('text/plain'), e)} onDragOver={allowDrop}>
        <div className="drop-zone">Drop Item Here</div> {/* Display drop zone text */}
        {droppedItems[tier]?.map((itemId) => (
          <li key={itemId} onClick={() => handleItemClick(itemId)}>
            {itemId}
          </li>
        ))}
      </div>
    );
  };

  return (
    <div className="tier-list-container">
      <h1>Tier List</h1>

      <div className="tier-list">
        {/* Render tier pairs (e.g., S S, A A, B B, C C, D D) */}
        {tiers.map((tier) => (
          <div key={tier} className="tier-pair">
            <div className={`tier-name tier-${tier.toLowerCase()}`}>
              <h2>{tier}</h2>
              {/* Render dropped items for the current tier */}
              <ul className="dropped-items">
              </ul>
            </div>
            {/* Render Tier component */}
            <Tier tier={tier} /> {/* Pass tier prop to Tier component */}
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
