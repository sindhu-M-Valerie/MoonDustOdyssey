import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Global styles
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a3a 0%, #0f0f1f 100%);
  }
  
  #root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  
  @keyframes sparkle {
    0% {
      text-shadow: 
        0 0 10px #ff69b4,
        0 0 20px #ff1493,
        0 0 30px #ff69b4,
        0 0 40px #ff1493,
        0 0 50px #ff69b4,
        0 0 60px #ff1493;
    }
    50% {
      text-shadow: 
        0 0 15px #9370db,
        0 0 25px #8a2be2,
        0 0 35px #9370db,
        0 0 45px #8a2be2,
        0 0 55px #9370db,
        0 0 65px #8a2be2;
    }
    100% {
      text-shadow: 
        0 0 10px #00ffff,
        0 0 20px #00bfff,
        0 0 30px #00ffff,
        0 0 40px #00bfff,
        0 0 50px #00ffff,
        0 0 60px #00bfff;
    }
  }
  
  @keyframes glow {
    0%, 100% {
      transform: translateX(-50%) scale(1);
    }
    50% {
      transform: translateX(-50%) scale(1.05);
    }
  }
`;

// Inject global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
