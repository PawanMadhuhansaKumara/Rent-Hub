import AddItem from "./AddItem";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./pages/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPW from "./pages/ForgotPW";
import Home from "./pages/Home";
import Profile from "./pages/profile"; // Profile page එක මෙතැනින් Import කරගත්තා
import BottomNav from "./components/BottomNav";
import ItemDetails from "./pages/ItemDetails";
import MyItems from "./pages/MyItems";
import BusinessHub from "./pages/BusinessHub";
import Notifications from "./pages/Notifications";

function RentsRedirect() {
  const location = useLocation();
  const search = location.search || "";
  if (search.includes("tab=rented")) {
    return <Navigate to="/my-items?tab=rented-items&subtab=rented-in" replace />;
  }
  return <Navigate to="/my-items?tab=rent-requests" replace />;
}



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
        <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPW />} />

        <Route path="/item/:id" element={<ItemDetails />} />

        <Route
          path="/profile"
          element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:userId"
          element={<Profile user={user} setUser={setUser} />}
        />

        <Route
          path="/add-item"
          element={user ? <AddItem /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-items"
          element={user ? <MyItems user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/MyItems"
          element={user ? <MyItems user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/business-hub"
          element={user ? <BusinessHub user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/BusinessHub"
          element={user ? <BusinessHub user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={user ? <Notifications user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-post"
          element={<Navigate to="/add-item" replace />}
        />
        <Route path="/rents" element={<RentsRedirect />} />
        <Route path="/rents/*" element={<RentsRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Show Bottom Navigation only when user is logged in */}
      {user && <BottomNav user={user} />}
    </Router>
  );
}