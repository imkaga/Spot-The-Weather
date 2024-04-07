// src/Item.js
import React from 'react';

const Item = ({ itemId }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', itemId);
  };

  return (
    <div className="item" draggable onDragStart={handleDragStart}>
      {itemId}
    </div>
  );
};

export default Item;
