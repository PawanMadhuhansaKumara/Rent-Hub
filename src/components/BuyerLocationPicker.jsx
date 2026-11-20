
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapPin,
  Navigation,
  Search,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

import "./BuyerLocationPicker.css";

// Default map location: Sri Lanka
const DEFAULT_LOCATION = {
  lat: 6.9271,
  lng: 79.8612,
};

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Map click handler
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(event) {
      setPosition({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return <Marker position={position} />;
}

// Update map center
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15);
  }, [position, map]);

  return null;
}

function BuyerLocationPicker({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
}) {
  const { t } = useTranslation();
  const [position, setPosition] = useState(
    initialLocation || DEFAULT_LOCATION
  );

  const [locationName, setLocationName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPosition(initialLocation || DEFAULT_LOCATION);
      setMessage("");
    }
  }, [isOpen, initialLocation]);

  if (!isOpen) return null;

  // Reverse geocoding
  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );

      if (!response.ok) {
        throw new Error("Unable to get location name");
      }

      const data = await response.json();

      setLocationName(
        data.display_name || "Selected Location"
      );
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setLocationName("Selected Location");
    }
  };

  // GPS current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("GPS is not supported by this browser.");
      return;
    }

    setLoadingGPS(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (result) => {
        const newPosition = {
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        };

        setPosition(newPosition);

        await getLocationName(
          newPosition.lat,
          newPosition.lng
        );

        setLoadingGPS(false);
      },
      (error) => {
        console.error("GPS error:", error);

        setLoadingGPS(false);
        setMessage(
          "Unable to access your location. Please select a location on the map."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Search location
  const handleSearch = async (event) => {
    event.preventDefault();

    if (!searchText.trim()) return;

    setSearching(true);
    setMessage("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(searchText)}`
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const data = await response.json();

      if (data.length === 0) {
        setMessage("Location not found.");
        return;
      }

      const newPosition = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };

      setPosition(newPosition);
      setLocationName(data[0].display_name);
    } catch (error) {
      console.error("Search error:", error);
      setMessage("Unable to search location. Try again.");
    } finally {
      setSearching(false);
    }
  };

  // Confirm buyer location
  const handleConfirm = () => {
    if (!position) return;

    onLocationSelect?.({
      latitude: position.lat,
      longitude: position.lng,
      locationName:
        locationName || "Selected Location",
    });

    onClose?.();
  };

  // Select location by clicking the map
  const handleMapLocationChange = async (newPosition) => {
    setPosition(newPosition);
    setLocationName("");

    await getLocationName(
      newPosition.lat,
      newPosition.lng
    );
  };

  return (
    <div className="buyer-location-overlay">
      <div className="buyer-location-modal">

        <div className="buyer-location-header">
          <div>
            <h2>{t("buyerLocation.title", "Select Your Location")}</h2>
            <p>
              {t("buyerLocation.subtitle", "Find rental items near your location.")}
            </p>
          </div>

          <button
            className="buyer-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <button
          className="buyer-gps-btn"
          onClick={handleCurrentLocation}
          disabled={loadingGPS}
        >
          {loadingGPS ? (
            <Loader2 className="spin" size={18} />
          ) : (
            <Navigation size={18} />
          )}

          {loadingGPS
            ? t("buyerLocation.gettingGps", "Getting your location...")
            : t("buyerLocation.useGps", "Use My Current Location")}
        </button>

        <form
          className="buyer-location-search"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder={t("buyerLocation.searchPlaceholder", "Search city or area...")}
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={searching}
            aria-label="Search location"
          >
            {searching ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <Search size={18} />
            )}
          </button>
        </form>

        {message && (
          <p className="buyer-location-message">
            {message}
          </p>
        )}

        <div className="buyer-map-instruction">
          <MapPin size={17} />
          {t("buyerLocation.mapInstruction", "Click on the map to select your location.")}
        </div>

        <div className="buyer-map-container">
          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={true}
            className="buyer-leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker
              position={position}
              setPosition={handleMapLocationChange}
            />

            <MapUpdater position={position} />
          </MapContainer>
        </div>

        <div className="buyer-selected-location">
          <MapPin size={18} />

          <div>
            <strong>{t("buyerLocation.selectedLocation", "Selected Location")}</strong>
            <p>
              {locationName || t("buyerLocation.selectPoint", "Select a point on the map")}
            </p>

            <small>
              {position.lat.toFixed(5)},{" "}
              {position.lng.toFixed(5)}
            </small>
          </div>
        </div>

        <div className="buyer-location-actions">
          <button
            className="buyer-cancel-btn"
            onClick={onClose}
          >
            {t("buyerLocation.cancel", "Cancel")}
          </button>

          <button
            className="buyer-confirm-btn"
            onClick={handleConfirm}
          >
            <CheckCircle size={18} />
            {t("buyerLocation.confirm", "Confirm Location")}
          </button>
        </div>

      </div>
    </div>
  );
}

export default BuyerLocationPicker;
