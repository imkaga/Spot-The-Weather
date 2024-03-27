import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '../styles/TierList.css';

const ItemTypes = {
  BOX: 'box',
};

const Box = ({ name, moveBox }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { name, type: ItemTypes.BOX },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        moveBox(item.name, dropResult.name);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className={`box ${isDragging ? 'dragging' : ''}`}>
      {name}
    </div>
  );
};

const Tier = ({ name, boxes, moveBox }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.BOX,
    drop: () => ({ name }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`tier ${isOver ? 'hovered' : ''}`}>
      <h2>{name}</h2>
      {boxes.map((box) => (
        <Box key={box} name={box} moveBox={moveBox} />
      ))}
    </div>
  );
};

const TierList = () => {
  const [boxes, setBoxes] = useState([
    { name: 'Box 1', tier: 'S' },
    { name: 'Box 2', tier: 'A' },
    { name: 'Box 3', tier: 'B' },
    { name: 'Box 4', tier: 'C' },
    { name: 'Box 5', tier: 'D' },
    { name: 'Box 6', tier: 'F' },
  ]);

  const moveBox = (boxName, newTier) => {
    const updatedBoxes = boxes.map((box) => {
      if (box.name === boxName) {
        return { ...box, tier: newTier };
      }
      return box;
    });
    setBoxes(updatedBoxes);
  };

  return (
    <div className="tier-list">
      <DndProvider backend={HTML5Backend}>
        <Tier name="S" boxes={boxes.filter((box) => box.tier === 'S')} moveBox={moveBox} />
        <Tier name="A" boxes={boxes.filter((box) => box.tier === 'A')} moveBox={moveBox} />
        <Tier name="B" boxes={boxes.filter((box) => box.tier === 'B')} moveBox={moveBox} />
        <Tier name="C" boxes={boxes.filter((box) => box.tier === 'C')} moveBox={moveBox} />
        <Tier name="D" boxes={boxes.filter((box) => box.tier === 'D')} moveBox={moveBox} />
        <Tier name="F" boxes={boxes.filter((box) => box.tier === 'F')} moveBox={moveBox} />
      </DndProvider>
    </div>
  );
};

export default TierList;
