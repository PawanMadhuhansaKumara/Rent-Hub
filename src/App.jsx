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

  // Function to refresh trust score & rental limit from backend
  const refreshUserTrustScore = async (currentU) => {
    const uId = currentU?.user_id || currentU?.id;
    if (!uId) return;
    try {
      const res = await fetch(`http://localhost:5001/api/users/${uId}/trust-score`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const hasChanged =
            Number(currentU.trust_score) !== Number(data.trustScore) ||
            Number(currentU.rental_limit) !== Number(data.maxRentalLimit) ||
            Number(currentU.completed_rentals) !== Number(data.completedRentals);

          const updated = {
            ...currentU,
            trust_score: data.trustScore,
            rental_limit: data.maxRentalLimit,
            max_rental_limit: data.maxRentalLimit,
            completed_rentals: data.completedRentals,
            account_days: data.accountDays,
          };
          setUser(updated);
          localStorage.setItem("user", JSON.stringify(updated));

          if (hasChanged) {
            window.dispatchEvent(new Event("user_updated"));
            window.dispatchEvent(new Event("items_updated"));
          }
        }
      }
    } catch (e) {
      console.error("Failed to refresh user trust score:", e);
    }
  };

  useEffect(() => {
    // App එක Load වෙනවිට LocalStorage එකේ User කෙනෙක් ඉන්නවාදැයි පරීක්ෂා කිරීම
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        refreshUserTrustScore(parsed);
      } catch (err) {
        console.error(err);
      }
    }

    const handleTrustUpdate = () => {
      const saved = localStorage.getItem("user");
      if (saved) {
        try {
          refreshUserTrustScore(JSON.parse(saved));
        } catch {}
      }
    };

    // Real-time polling every 3.5 seconds so limit & trust score update automatically
    const interval = setInterval(handleTrustUpdate, 3500);

    window.addEventListener("focus", handleTrustUpdate);
    window.addEventListener("rent_requests_updated", handleTrustUpdate);
    window.addEventListener("user_trust_updated", handleTrustUpdate);
    window.addEventListener("storage", handleTrustUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleTrustUpdate);
      window.removeEventListener("rent_requests_updated", handleTrustUpdate);
      window.removeEventListener("user_trust_updated", handleTrustUpdate);
      window.removeEventListener("storage", handleTrustUpdate);
    };
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