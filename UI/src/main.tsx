import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './styles/tailwind.css';
import './styles/global.scss';

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Root element was not found.');

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
