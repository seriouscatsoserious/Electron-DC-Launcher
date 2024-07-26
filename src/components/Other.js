import React, { useState, useEffect } from 'react';

function Other() {
  const [chainInfo, setChainInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const config = await window.electronAPI.getConfig();
        if (config && config.chains && config.chains.length > 0) {
          setChainInfo(config.chains[0]);
        } else {
          setError('No chain information available');
        }
      } catch (err) {
        setError('Failed to load configuration');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!chainInfo) return <div>No chain information available</div>;

  return (
    <div className="Other">
      <h1>Other</h1>
      <h2>Chain Information</h2>
      <p>Chain Name: {chainInfo.display_name}</p>
      <p>Description: {chainInfo.description}</p>
      <p>Version: {chainInfo.version}</p>
      <p>Repository: <a href={chainInfo.repo_url} target="_blank" rel="noopener noreferrer">{chainInfo.repo_url}</a></p>
    </div>
  );
}

export default Other;