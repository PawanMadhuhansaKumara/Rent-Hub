import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import {
  X,
  MapPin,
  Navigation,
  Car,
  Compass,
  ExternalLink,
  Loader2,
  Clock,
  LocateFixed,
  ArrowRight,
  Store,
} from "lucide-react";
import GoogleMapIcon from "./GoogleMapIcon";

// Sri Lanka city coordinate fallbacks
const SRI_LANKA_CITIES = {
  colombo: { lat: 6.9271, lng: 79.8612, name: "Colombo" },
  kandy: { lat: 7.2906, lng: 80.6337, name: "Kandy" },
  galle: { lat: 6.0535, lng: 80.221, name: "Galle" },
  gampaha: { lat: 7.084, lng: 79.9944, name: "Gampaha" },
  negombo: { lat: 7.2008, lng: 79.8736, name: "Negombo" },
  kurunegala: { lat: 7.4863, lng: 80.3623, name: "Kurunegala" },
  jaffna: { lat: 9.6615, lng: 80.0255, name: "Jaffna" },
  matara: { lat: 5.9549, lng: 80.555, name: "Matara" },
  ratnapura: { lat: 6.6828, lng: 80.4036, name: "Ratnapura" },
  anuradhapura: { lat: 8.3114, lng: 80.4037, name: "Anuradhapura" },
  badulla: { lat: 6.9934, lng: 81.055, name: "Badulla" },
  batticaloa: { lat: 7.731, lng: 81.6747, name: "Batticaloa" },
  kalutara: { lat: 6.5854, lng: 79.9607, name: "Kalutara" },
  dehiwala: { lat: 6.8344, lng: 79.8654, name: "Dehiwala" },
  nugegoda: { lat: 6.8649, lng: 79.8997, name: "Nugegoda" },
  maharagama: { lat: 6.848, lng: 79.9265, name: "Maharagama" },
  malabe: { lat: 6.9044, lng: 79.9542, name: "Malabe" },
};

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// User (Visitor) Pulsing Blue Dot Marker (Uber Style)
const createUserDotIcon = (youLabel = "You") => {
  return L.divIcon({
    className: "uber-user-marker",
    html: `
      <div style="position: relative; width: 28px; height: 28px; transform: translate(-50%, -50%);">
        <div style="
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.25);
          animation: uberPulse 2s infinite ease-out;
        "></div>
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <span style="
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${youLabel}</span>
      </div>
      <style>
        @keyframes uberPulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Shop Destination Marker (Green Store Pin)
const createShopMarkerIcon = (shopName = "Shop") => {
  return L.divIcon({
    className: "uber-shop-marker",
    html: `
      <div style="position: relative; width: 36px; height: 44px; transform: translate(-50%, -100%);">
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
          <filter id="shopShadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-opacity="0.3"/>
          </filter>
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13 16.2 24.5 16.9 25a2 2 0 0 0 2.2 0C19.8 42.5 36 31 36 18 36 8.06 27.94 0 18 0z" fill="#00aa5b" filter="url(#shopShadow)"/>
          <circle cx="18" cy="16" r="11" fill="#ffffff"/>
          <path d="M12 17v-3h12v3M14 20h8M15 11h6" stroke="#00aa5b" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span style="
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          background: #00aa5b;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        ">${shopName}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export default function ShopDistanceModal({ isOpen, onClose, shopData }) {
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const shopMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const [userCoords, setUserCoords] = useState(null);
  const [shopCoords, setShopCoords] = useState(null);
  const [loadingUserLocation, setLoadingUserLocation] = useState(true);
  const [distanceKm, setDistanceKm] = useState(null);
  const [etaMins, setEtaMins] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!shopData) return;

    let lat = null;
    let lng = null;

    if (
      shopData.map_latitude !== null &&
      shopData.map_latitude !== undefined &&
      shopData.map_longitude !== null &&
      shopData.map_longitude !== undefined
    ) {
      lat = parseFloat(shopData.map_latitude);
      lng = parseFloat(shopData.map_longitude);
    } else if (shopData.nearest_city) {
      const cityKey = shopData.nearest_city.trim().toLowerCase();
      if (SRI_LANKA_CITIES[cityKey]) {
        lat = SRI_LANKA_CITIES[cityKey].lat;
        lng = SRI_LANKA_CITIES[cityKey].lng;
      }
    }

    if (!lat || !lng) {
      lat = 6.9271;
      lng = 79.8612;
    }

    setShopCoords({ lat, lng });
  }, [shopData]);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLoadingUserLocation(false);
      return;
    }

    setLoadingUserLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserCoords({ lat: uLat, lng: uLng });
        setLoadingUserLocation(false);
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        setLocationError("GPS location access was not granted.");
        setLoadingUserLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      requestUserLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (userCoords && shopCoords) {
      const directKm = getHaversineDistanceKm(
        userCoords.lat,
        userCoords.lng,
        shopCoords.lat,
        shopCoords.lng
      );
      const roadKm = directKm * 1.25;
      const formattedDistance = roadKm < 1 ? "< 1 km" : `${roadKm.toFixed(1)} km`;
      setDistanceKm(formattedDistance);

      const minutes = Math.max(2, Math.round((roadKm / 35) * 60));
      setEtaMins(minutes);
    } else {
      setDistanceKm(null);
      setEtaMins(null);
    }
  }, [userCoords, shopCoords]);

  useEffect(() => {
    if (!isOpen || !shopCoords) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const center = userCoords
          ? [(userCoords.lat + shopCoords.lat) / 2, (userCoords.lng + shopCoords.lng) / 2]
          : [shopCoords.lat, shopCoords.lng];

        const map = L.map(mapContainerRef.current, {
          center,
          zoom: 13,
          zoomControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const shopLabel = shopData?.map_location_name || shopData?.name || t("map.shop");
        const shopMarker = L.marker([shopCoords.lat, shopCoords.lng], {
          icon: createShopMarkerIcon(shopLabel),
        }).addTo(map);

        mapInstanceRef.current = map;
        shopMarkerRef.current = shopMarker;
      } else {
        mapInstanceRef.current.invalidateSize();
      }

      const map = mapInstanceRef.current;

      if (userCoords) {
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
        } else {
          userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
            icon: createUserDotIcon(t("map.you")),
          }).addTo(map);
        }

        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([
            [userCoords.lat, userCoords.lng],
            [shopCoords.lat, shopCoords.lng],
          ]);
        } else {
          routeLineRef.current = L.polyline(
            [
              [userCoords.lat, userCoords.lng],
              [shopCoords.lat, shopCoords.lng],
            ],
            {
              color: "#00aa5b",
              weight: 5,
              opacity: 0.85,
              dashArray: "8, 8",
              lineCap: "round",
            }
          ).addTo(map);
        }

        const bounds = L.latLngBounds([
          [userCoords.lat, userCoords.lng],
          [shopCoords.lat, shopCoords.lng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else {
        map.setView([shopCoords.lat, shopCoords.lng], 14);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, shopCoords, userCoords]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        userMarkerRef.current = null;
        shopMarkerRef.current = null;
        routeLineRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const shopTitle =
    shopData?.map_location_name ||
    shopData?.name ||
    shopData?.full_name ||
    t("map.shop");

  const shopAddressText =
    shopData?.address ||
    shopData?.nearest_city ||
    shopData?.map_location_name ||
    "Sri Lanka";

  const googleMapsNavUrl =
    userCoords && shopCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${shopCoords.lat},${shopCoords.lng}&travelmode=driving`
      : shopCoords
      ? `https://www.google.com/maps/search/?api=1&query=${shopCoords.lat},${shopCoords.lng}`
      : "https://www.google.com/maps";

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
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "680px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.28)",
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
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #f8fafc, #ffffff)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <GoogleMapIcon size={26} />
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "clamp(15px, 2.5vw, 17px)",
                  fontWeight: 700,
                  color: "#0f172a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {shopTitle}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#64748b",
                  marginTop: "2px",
                }}
              >
                {t("map.liveDistanceRoute")}
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
              flexShrink: 0,
              marginLeft: "8px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Distance & ETA Banner (Uber Style, Responsive Flex) */}
        <div
          style={{
            padding: "12px 18px",
            background: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#00aa5b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 10px rgba(0, 170, 91, 0.3)",
                flexShrink: 0,
              }}
            >
              <Car size={20} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "clamp(17px, 3vw, 20px)",
                    fontWeight: 800,
                    color: "#166534",
                  }}
                >
                  {distanceKm || (loadingUserLocation ? t("map.calculating") : "—")}
                </span>
                {etaMins && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#15803d",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Clock size={12} /> ~{etaMins} {t("map.minsDrive")}
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#475569",
                  marginTop: "2px",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {t("map.fromYourLocationTo")} <strong>{shopAddressText}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {!userCoords && (
              <button
                type="button"
                onClick={requestUserLocation}
                disabled={loadingUserLocation}
                style={{
                  background: "#ffffff",
                  border: "1px solid #86efac",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#166534",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                {loadingUserLocation ? (
                  <Loader2 size={13} className="spin-animation" />
                ) : (
                  <LocateFixed size={13} />
                )}
                {t("map.enableMyGps")}
              </button>
            )}
          </div>
        </div>

        {/* Interactive Map View */}
        <div style={{ position: "relative", width: "100%", height: "clamp(240px, 38vh, 360px)" }}>
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%", zIndex: 1 }}
          />

          {/* Floating Route Legend Overlay */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.95)",
              padding: "6px 10px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  display: "inline-block",
                }}
              />
              <span>{t("map.you")}</span>
            </div>
            <ArrowRight size={11} color="#94a3b8" />
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "#00aa5b",
                  display: "inline-block",
                }}
              />
              <span>{t("map.shop")}</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation CTA Bar */}
        <div
          style={{
            padding: "14px 18px",
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 200px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#1e293b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <Store size={14} color="#00aa5b" />
              <span>{shopTitle}</span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginTop: "2px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <MapPin size={12} color="#94a3b8" />
              <span>{shopAddressText}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              flex: "1 1 auto",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              {t("map.close")}
            </button>

            <a
              href={googleMapsNavUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #00aa5b 0%, #166534 100%)",
                fontSize: "13px",
                fontWeight: 700,
                color: "#ffffff",
                textDecoration: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                boxShadow: "0 3px 8px rgba(0, 170, 91, 0.3)",
                whiteSpace: "nowrap",
              }}
            >
              <GoogleMapIcon size={17} />
              <span>{t("map.openInGoogleMaps")}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
