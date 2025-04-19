// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';
import App from './App.jsx';
import store from './store';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
