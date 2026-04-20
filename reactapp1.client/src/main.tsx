import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

console.log('main.tsx: start');

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
