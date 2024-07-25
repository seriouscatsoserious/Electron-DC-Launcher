import React, { useState, useEffect } from 'react';
import Card from './Card';
import cardData from '../CardData.json';

function Nodes() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    setCards(cardData);
  }, []);

  return (
    <div className="Nodes">
      <h1>Drivechain Launcher</h1>
      <div className="card-container">
        {cards.map(card => (
          <Card key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
}

export default Nodes;