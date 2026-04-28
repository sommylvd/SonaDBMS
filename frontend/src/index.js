import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Глобальные стили
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #ffe4ec;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #ff69b4;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #ff1493;
  }
  
  button {
    transition: all 0.2s ease;
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255,105,180,0.4);
  }
  
  input, textarea, select {
    transition: all 0.2s ease;
  }
  
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #ff69b4 !important;
    box-shadow: 0 0 0 3px rgba(255,105,180,0.1);
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);