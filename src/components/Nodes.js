import React, { useState, useEffect } from 'react';
import Card from './Card';

function Nodes() {
  const [chains, setChains] = useState([]);

  useEffect(() => {
    const fetchChains = async () => {
      try {
        const config = await window.electronAPI.getConfig();
        setChains(config.chains);
      } catch (error) {
        console.error('Failed to fetch chain config:', error);
      }
    };

    fetchChains();
  }, []);

  return (
    <div className="Nodes">
      <h1>Drivechain Launcher</h1>
      <div className="chain-list">
        {chains.map(chain => (
          <Card key={chain.id} chain={chain} />
        ))}
      </div>
    </div>
  );
}

export default Nodes;