import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  X,
  MapPin,
  Navigation,
  Search,
  Check,
  Loader2,
  AlertCircle,
  Compass,
} from "lucide-react";
import GoogleMapIcon from "./GoogleMapIcon";

const API_URL = "http://localhost:5001";

// Default coordinates: Sri Lanka center (around Kandy / Colombo)
const DEFAULT_LAT = 6.9271;
const DEFAULT_LNG = 79.8612;

// Custom Leaflet DivIcon for the Shop Pin
const createShopPinIcon = () => {
  return L.divIcon({
    className: "custom-shop-pin-marker",
    html: `
      <div style="position: relative; width: 40px; height: 48px; transform: translate(-50%, -100%);">
        <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
          <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
          <path d="M20 0C8.95 0 0 8.95 0 20c0 14.5 18 27.2 18.78 27.75a2 2 0 0 0 2.44 0C22 47.2 40 34.5 40 20 40 8.95 31.05 0 20 0z" fill="#00aa5b" filter="url(#shadow)"/>
          <circle cx="20" cy="18" r="13" fill="#ffffff"/>
          <path d="M14 19v-4h12v4M16 23h8M17 12h6" stroke="#00aa5b" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); background: #111827; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">
          Drag Me
        </span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export default function MapLocationPickerModal({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialName,
  userId,
  onLocationSaved,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({
    lat: initialLat ? parseFloat(initialLat) : DEFAULT_LAT,
    lng: initialLng ? parseFloat(initialLng) : DEFAULT_LNG,
  });
  const [locationName, setLocationName] = useState(initialName || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Update coords when props change
  useEffect(() => {
    if (initialLat && initialLng) {
      setCoords({
        lat: parseFloat(initialLat),
        lng: parseFloat(initialLng),
      });
    }
    if (initialName) {
      setLocationName(initialName);
    }
  }, [initialLat, initialLng, initialName]);

  // Reverse geocoding helper via Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const display =
          data.address?.road ||
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.display_name?.split(",").slice(0, 3).join(",") ||
          "";
        if (display && !locationName) {
          setLocationName(display);
        }
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
  };

  // Initialize or update Leaflet map
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const initialZoom = initialLat && initialLng ? 15 : 13;
        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: initialZoom,
          zoomControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([coords.lat, coords.lng], {
          icon: createShopPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on("dragend", (e) => {
          const newPos = e.target.getLatLng();
          setCoords({ lat: newPos.lat, lng: newPos.lng });
          reverseGeocode(newPos.lat, newPos.lng);
        });

        map.on("click", (e) => {
          const newPos = e.latlng;
          marker.setLatLng(newPos);
          setCoords({ lat: newPos.lat, lng: newPos.lng });
          reverseGeocode(newPos.lat, newPos.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([coords.lat, coords.lng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng]);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position programmatically
  const moveToLocation = (lat, lng, name = null) => {
    const newCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
    setCoords(newCoords);
    if (name) setLocationName(name);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newCoords.lat, newCoords.lng], 15, {
        duration: 1.2,
      });
      if (markerRef.current) {
        markerRef.current.setLatLng([newCoords.lat, newCoords.lng]);
      }
    }
  };

  // GPS / My Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage({
        type: "error",
        text: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setLocatingUser(true);
    setStatusMessage({ type: "info", text: "Acquiring your GPS location..." });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        moveToLocation(latitude, longitude);
        reverseGeocode(latitude, longitude);
        setLocatingUser(false);
        setStatusMessage({
          type: "success",
          text: "Current GPS location pinned! You can drag the pin to adjust.",
        });
      },
      (err) => {
        setLocatingUser(false);
        setStatusMessage({
          type: "error",
          text: "Location permission denied or unavailable. Please search for your city or click on the map.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search location via OpenStreetMap Nominatim
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const q = encodeURIComponent(`${searchQuery.trim()}, Sri Lanka`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        moveToLocation(lat, lng, searchQuery.trim());
        setStatusMessage({
          type: "success",
          text: `Found: ${place.display_name.split(",").slice(0, 3).join(",")}`,
        });
      } else {
        // Fallback search without Sri Lanka suffix
        const fallbackRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery.trim()
          )}&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const fbData = await fallbackRes.json();
        if (fbData && fbData.length > 0) {
          moveToLocation(parseFloat(fbData[0].lat), parseFloat(fbData[0].lon), searchQuery.trim());
        } else {
          setStatusMessage({
            type: "error",
            text: "Location not found. Try entering a nearby major town or landmark.",
          });
        }
      }
    } catch (err) {
      console.error("Search error:", err);
      setStatusMessage({ type: "error", text: "Search service unavailable." });
    } finally {
      setSearching(false);
    }
  };

  // Save location to backend
  const handleSave = async () => {
    if (!userId) {
      alert("User identification missing. Please sign in again.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/map-location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          map_latitude: coords.lat,
          map_longitude: coords.lng,
          map_location_name: locationName.trim() || "Shop Location",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local storage user if matching
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (Number(parsed.id || parsed.user_id) === Number(userId)) {
              const updated = {
                ...parsed,
                map_latitude: coords.lat,
                map_longitude: coords.lng,
                map_location_name: locationName.trim() || "Shop Location",
              };
              localStorage.setItem("user", JSON.stringify(updated));
            }
          } catch (e) {
            console.error("Failed to update localStorage:", e);
          }
        }

        window.dispatchEvent(new Event("user_updated"));
        window.dispatchEvent(new Event("items_updated"));

        if (onLocationSaved) {
          onLocationSaved({
            map_latitude: coords.lat,
            map_longitude: coords.lng,
            map_location_name: locationName.trim() || "Shop Location",
          });
        }

        alert("Shop map location saved successfully!");
        onClose();
      } else {
        alert(data.message || "Failed to save location.");
      }
    } catch (err) {
      console.error("Save location error:", err);
      alert("Server error occurred while saving map location.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "680px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          animation: "modalFadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #f8fafc, #ffffff)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <GoogleMapIcon size={24} />
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Set Shop Map Location
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "2px",
                }}
              >
                Help customers find your store and view distance & directions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div
          style={{
            padding: "14px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "8px", width: "100%" }}
          >
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: "absolute", left: "12px" }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, town, or street (e.g. Maharagama, Kandy)..."
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  backgroundColor: "#ffffff",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              style={{
                backgroundColor: "#00aa5b",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "0 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {searching ? (
                <Loader2 size={16} className="spin-animation" />
              ) : (
                <Search size={16} />
              )}
              Search
            </button>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locatingUser}
              title="Use GPS current location"
              style={{
                backgroundColor: "#ffffff",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "0 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              {locatingUser ? (
                <Loader2 size={16} className="spin-animation" color="#00aa5b" />
              ) : (
                <Navigation size={16} color="#00aa5b" />
              )}
              My GPS Location
            </button>
          </form>

          {statusMessage.text && (
            <div
              style={{
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                borderRadius: "6px",
                backgroundColor:
                  statusMessage.type === "error"
                    ? "#fee2e2"
                    : statusMessage.type === "success"
                    ? "#dcfce7"
                    : "#e0f2fe",
                color:
                  statusMessage.type === "error"
                    ? "#991b1b"
                    : statusMessage.type === "success"
                    ? "#166534"
                    : "#0369a1",
              }}
            >
              <AlertCircle size={14} />
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Interactive Map */}
        <div style={{ position: "relative", width: "100%", height: "350px" }}>
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%", zIndex: 1 }}
          />

          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.95)",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#334155",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              pointerEvents: "none",
            }}
          >
            Tip: Click anywhere or drag the green pin to position
          </div>
        </div>

        {/* Location Details Form */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "4px",
              }}
            >
              Shop / Landmark Display Name (visible to customers)
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Rent-Hub Store, Galle Road, Bambalapitiya"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#64748b",
              background: "#f8fafc",
              padding: "8px 12px",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Compass size={14} color="#00aa5b" />
              <span>
                Coordinates: <strong>{coords.lat.toFixed(5)}</strong>,{" "}
                <strong>{coords.lng.toFixed(5)}</strong>
              </span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "11px",
              }}
            >
              Preview on Google Maps ↗
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 22px",
              borderRadius: "8px",
              border: "none",
              background: "#00aa5b",
              fontSize: "13px",
              fontWeight: 700,
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 4px rgba(0, 170, 91, 0.25)",
            }}
          >
            {saving ? (
              <Loader2 size={16} className="spin-animation" />
            ) : (
              <Check size={16} />
            )}
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
}
