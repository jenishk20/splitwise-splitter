import React from "react";
import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

const App = () => {
  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  const handleLogin = () => {
    window.location.href = `${BASE_API_URL}/auth`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const name = params.get("first_name");

    if (token) {
      setAccessToken(token);
      setUser({ first_name: name });

      axios
        .get(`${BASE_API_URL}/groups?access_token=${token}`)
        .then((res) => setGroups(res.data.groups))
        .catch((err) => console.error("Failed to fetch groups:", err));

      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  



  
};

export default App;
