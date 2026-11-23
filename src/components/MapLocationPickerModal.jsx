import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
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

const API_URL = "https://rent-hub-ashen.vercel.app";

// Default coordinates: Sri Lanka center (around Kandy / Colombo)
const DEFAULT_LAT = 6.9271;
const DEFAULT_LNG = 79.8612;

// Custom Leaflet DivIcon for the Shop Pin
const createShopPinIcon = (pinText = "Drag Me") => {
  return L.divIcon({
    className: "custom-shop-pin-marker",
    html: `
      <div style="position: relative; width: 40px; height: 48px; transform: translate(-50%, -100%);">
        <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
          <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
          <path d="M20 0C8.95 0 0 8.95 0 20c0 14.5 18 27.2 18.78 27.75a2 2 0 0 0 2.44 0C22 47.2 40 34.5 40 20 40 8.95 31.05 0 20 0z" fill="var(--primary)" filter="url(#shadow)"/>
          <circle cx="20" cy="18" r="13" fill="var(--text-inverse)"/>
          <path d="M14 19v-4h12v4M16 23h8M17 12h6" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); background: var(--text-main); color: var(--text-inverse); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">
          ${pinText}
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
  const { t } = useTranslation();
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
          icon: createShopPinIcon(t("map.dragPinTip") ? "Shop Pin" : "Drag Me"),
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
    setStatusMessage({ type: "info", text: t("map.acquiringGps") });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        moveToLocation(latitude, longitude);
        reverseGeocode(latitude, longitude);
        setLocatingUser(false);
        setStatusMessage({
          type: "success",
          text: t("map.gpsSuccess"),
        });
      },
      (err) => {
        setLocatingUser(false);
        setStatusMessage({
          type: "error",
          text: t("map.gpsError"),
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
            text: t("map.locationNotFound"),
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

        alert(t("map.gpsSuccess") ? "Shop location saved successfully!" : "Saved!");
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
        padding: "10px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--bg-modal, var(--bg-card))",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "680px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "94vh",
          animation: "modalFadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, var(--bg-app-alt), var(--bg-modal, var(--bg-card)))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <GoogleMapIcon size={24} />
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "clamp(15px, 2.5vw, 17px)",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t("map.setShopLocation")}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {t("map.setShopLocationDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-card-hover)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              flexShrink: 0,
              marginLeft: "8px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions Bar (Fully responsive wrap) */}
        <div
          style={{
            padding: "12px 16px",
            background: "var(--bg-app-alt)",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              width: "100%",
            }}
          >
            <div
              style={{
                flex: "1 1 200px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                minWidth: "160px",
              }}
            >
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "12px" }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("map.searchPlaceholder")}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  fontSize: "13px",
                  outline: "none",
                  backgroundColor: "var(--bg-modal, var(--bg-card))",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--text-inverse)",
                border: "none",
                borderRadius: "10px",
                padding: "9px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              {searching ? (
                <Loader2 size={16} className="spin-animation" />
              ) : (
                <Search size={16} />
              )}
              {t("map.searchBtn")}
            </button>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locatingUser}
              title="Use GPS current location"
              style={{
                backgroundColor: "var(--bg-modal, var(--bg-card))",
                color: "var(--text-main)",
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                padding: "9px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {locatingUser ? (
                <Loader2 size={16} className="spin-animation" color="var(--primary)" />
              ) : (
                <Navigation size={16} color="var(--primary)" />
              )}
              {t("map.myGpsLocation")}
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
                    ? "var(--badge-red-bg)"
                    : statusMessage.type === "success"
                    ? "var(--badge-green-bg)"
                    : "var(--badge-blue-bg)",
                color:
                  statusMessage.type === "error"
                    ? "var(--badge-red-text)"
                    : statusMessage.type === "success"
                    ? "var(--primary-hover)"
                    : "var(--badge-blue-text)",
              }}
            >
              <AlertCircle size={14} />
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Interactive Map (Responsive height) */}
        <div style={{ position: "relative", width: "100%", height: "clamp(240px, 38vh, 340px)" }}>
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%", zIndex: 1 }}
          />

          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              right: "10px",
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.95)",
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              pointerEvents: "none",
              textAlign: "center",
            }}
          >
            {t("map.dragPinTip")}
          </div>
        </div>

        {/* Location Details Form */}
        <div
          style={{
            padding: "14px 18px",
            borderTop: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-modal, var(--bg-card))",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              {t("map.shopLandmarkLabel")}
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder={t("map.shopLandmarkPlaceholder")}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-light)",
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
              flexWrap: "wrap",
              gap: "6px",
              fontSize: "11px",
              color: "var(--text-muted)",
              background: "var(--bg-app-alt)",
              padding: "6px 10px",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Compass size={13} color="var(--primary)" />
              <span>
                {t("map.coordinates")}: <strong>{coords.lat.toFixed(5)}</strong>,{" "}
                <strong>{coords.lng.toFixed(5)}</strong>
              </span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--badge-blue-text)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {t("map.previewGoogleMaps")}
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 18px",
            background: "var(--bg-app-alt)",
            borderTop: "1px solid var(--border-light)",
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
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-light)",
              background: "var(--bg-modal, var(--bg-card))",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {t("map.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              background: "var(--primary)",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text-inverse)",
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
            {t("map.saveLocation")}
          </button>
        </div>
      </div>
    </div>
  );
}
