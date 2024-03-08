import React from 'react';
import axios from 'axios';
import Home from './components/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";
import './App.css';

// Zmienne
const apiKey = "85f93b7e11258cb2617c3f745ecf3349"; // Api Key OpenWeather
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q="; // Api URL OpenWeather
// Spotify API
const clientId = '44c1aa3e0f954b9491bb515284729f0b'; // ClientID Spotify
const redirectUri = 'http://localhost:3000/'; // Redirect URL
const clientSecret = '343770fe2dcc4167acd9722f8c3424d9'; //Client Secret Spotify

function App() {
  const handleLogin = () => {
    window.location.href = 'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + clientId + // Using the defined clientId variable
      '&redirect_uri=' + redirectUri + // Using the defined redirectUri variable
      '&scope=user-read-private%20user-read-email'; // Adjust scopes as per your application's requirements
  };

  return (
    <div className="App">
      <Home />
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  );
}

export default App;
