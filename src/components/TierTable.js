// src/TierTable.js
import React from 'react';

const TierTable = ({ tier, items, onClearDrop }) => {
  return (
    <div className="tier-table">
      <h2>{tier}</h2>
      <ul className="dropped-items">
        {items.map((itemId) => (
          <li key={itemId}>
            {itemId}
            <button onClick={() => onClearDrop(tier, itemId)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TierTable;
