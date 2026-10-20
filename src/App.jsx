import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./pages/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile"; // Profile page එක මෙතැනින් Import කරගත්තා
import BottomNav from "./components/BottomNav";

export default function App() {
  const [user, setUser] = useState(null); 

  useEffect(() => {
    // App එක Load වෙනවිට LocalStorage එකේ User කෙනෙක් ඉන්නවාදැයි පරීක්ෂා කිරීම
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        
        <Route
          path="/login"
          element={<Login onLoginSuccess={(userData) => setUser(userData)} />}
        />
        
        <Route path="/register" element={<Register />} />

        {/* අලුතෙන් එකතු කළ Profile Route එක (ලොග් වී සිටී නම් පමණක් Profile එකට යයි) */}
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}