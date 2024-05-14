import React, { useState, useEffect } from 'react';
import TierList from './TierList';
import { loggedin } from './Utils'; // Import loggedin function from Utils
import '../styles/TierList.css';


const TierListPage = () => {
  const [loggedIn, setLoggedIn] = useState(false); // State for user login status

  useEffect(() => {
    setLoggedIn(loggedin()); // Check if user is logged in when component mounts
  }, []);

  const handleLogin = () => {
    // Implement your login logic here
  };

  return (
    <>
      {loggedIn ? (
        <TierList />
      ) : (
        <div>
          <h3>Żeby wyświetlić zawartość tej strony - Zaloguj Się!</h3>
          <button className="login" onClick={handleLogin}>Zaloguj się ze Spotify</button>
        </div>
      )}
    </>
  );
};

export default TierListPage;
