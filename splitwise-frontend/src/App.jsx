import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import Homepage from "./components/Homepage";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AddExpensePage from "./components/AddExpensePage";

const App = () => {
  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);

  const handleLogin = () => {
    window.location.href = `${BASE_API_URL}/login/auth`;
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${BASE_API_URL}/login/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);
      setGroups([]);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_API_URL}/login/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.user?.first_name) {
          setUser(res?.data?.user);
          return axios.get(`${BASE_API_URL}/groups/fetchUserGroups`, {
            withCredentials: true,
          });
        }
      })
      .then((res) => {
        if (res) setGroups(res.data.groups);
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
      });
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar
          user={user}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
        />
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Dashboard user={user} groups={groups} />
              ) : (
                <Homepage handleLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/group/:id/add-expense"
            element={<AddExpensePage user={user} groups={groups} />}
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
