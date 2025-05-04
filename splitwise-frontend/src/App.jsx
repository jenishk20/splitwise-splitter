// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  const handleLogin = () => {
    window.location.href = `${BASE_API_URL}/auth`;
  };

  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      try {
        const response = await axios.get(
          `${BASE_API_URL}/callback?code=${code}`
        );
        setUser(response.data.user);
        setAccessToken(response.data.tokens.access_token);

        const groupsRes = await axios.get(
          `${BASE_API_URL}/groups?access_token=${response.data.tokens.access_token}`
        );
        setGroups(groupsRes.data.groups);
        window.history.replaceState({}, document.title, "/");
      } catch (err) {
        console.error("Login failed", err);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const name = params.get("first_name");

    if (token) {
      setAccessToken(token);
      setUser({ first_name: name });

      axios
        .get(
          `${import.meta.env.VITE_API_BASE_URL}/groups?access_token=${token}`
        )
        .then((res) => setGroups(res.data.groups))
        .catch((err) => console.error("Failed to fetch groups:", err));

      // clean up URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 text-white font-sans">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-2">
            🔗 Splitwise Auto Splitter
          </h1>
          <p className="text-lg text-purple-100">
            Smartly split shared expenses with your group using automation.
          </p>
        </header>

        {!user ? (
          <div className="flex justify-center">
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-white text-purple-700 font-bold rounded-2xl shadow hover:bg-purple-100 transition duration-300"
            >
              🔐 Login with Splitwise
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-10 text-center">
              <p className="text-xl">
                👋 Welcome, <span className="font-bold">{user.first_name}</span>
                !
              </p>
              <p className="text-sm text-purple-200">Here are your groups 👇</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white text-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
                >
                  <h3 className="text-xl font-semibold">{group.name}</h3>
                  <p className="text-sm text-gray-500">Group ID: {group.id}</p>
                  <p className="text-sm text-gray-500">
                    Members: {group.members.length}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
