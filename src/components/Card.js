import React, { useState } from 'react';

const Card = ({ data }) => {
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
        <h2>{data.title}</h2>
        <p>{data.description}</p>
        {data.blockHeight && <p>Block height: {data.blockHeight}</p>}
      </div>
      <div className="card-right">
        <button className="btn settings">Settings</button>
      </div>
    </div>
  );
};

export default Card;