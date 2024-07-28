import React from 'react';
import Card from './Card';

const ChainList = ({ chains }) => {
  return (
    <div className="chain-list">
      {chains.map(chain => (
        <Card key={chain.id} chain={chain} />
      ))}
    </div>
  );
};

export default ChainList;