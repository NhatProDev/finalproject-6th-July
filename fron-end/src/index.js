import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="913335909200-u33o9h0b9rl2aj8vqb97r3de3hk33h92.apps.googleusercontent.com">  
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
