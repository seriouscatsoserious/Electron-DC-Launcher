import React from 'react';
import Card from './Card';
import cardData from '../CardData.json';

function Nodes() {
  return (
    <div className="Nodes">
      <h1>Drivechain Launcher</h1>
      <div className="card-container">
        {cardData.map(card => (
          <Card key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
}

export default Nodes;