import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import Homepage from "./components/Homepage";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  const handleLogin = () => {
    window.location.href = `${BASE_API_URL}/login/auth`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const name = params.get("first_name");

    if (token) {
      setAccessToken(token);
      setUser({ first_name: name, access_token: token });

      axios
        .get(`${BASE_API_URL}/groups/fetchUserGroups?access_token=${token}`)
        .then((res) => setGroups(res.data.groups))
        .catch((err) => console.error("Failed to fetch groups:", err));

      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} handleLogin={handleLogin} />
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Dashboard user={user} groups={groups} token={accessToken} />
              ) : (
                <Homepage handleLogin={handleLogin} />
              )
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
