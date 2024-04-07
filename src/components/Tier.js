// src/Tier.js
import React from 'react';

const Tier = ({ tier, onDrop }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    onDrop(itemId);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  return (
    <div className="tier" onDrop={handleDrop} onDragOver={allowDrop}>
      <h2>{tier}</h2>
      <div className="drop-zone">Drop Item Here</div>
    </div>
  );
};

export default Tier;
