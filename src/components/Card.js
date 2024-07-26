import React, { useState } from 'react';

const Card = ({ chain }) => {
  const [buttonState, setButtonState] = useState('download');

  const handleButtonClick = () => {
    switch (buttonState) {
      case 'download':
        setButtonState('downloading');
        setTimeout(() => setButtonState('run'), 3000);
        break;
      case 'run':
        setButtonState('stop');
        break;
      case 'stop':
        setButtonState('run');
        break;
      default:
        break;
    }
  };

  return (
    <div className="card">
      <div className="card-left">
        <button
          className={`btn ${buttonState}`}
          onClick={handleButtonClick}
          disabled={buttonState === 'downloading'}
        >
          {buttonState.charAt(0).toUpperCase() + buttonState.slice(1)}
        </button>
        <h2>{chain.display_name}</h2>
        <p>{chain.description}</p>
      </div>
      <div className="card-right">
        <button className="btn settings">Settings</button>
      </div>
    </div>
  );
};

export default Card;