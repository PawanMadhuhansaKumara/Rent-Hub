import React from "react";
import { ArrowLeft, CheckCircle2, MapPin, Mail, Phone, Plus, Edit3 } from "lucide-react";
import GoogleMapIcon from "../GoogleMapIcon";
import SettingsPopup from "../SettingsPopup";

export default function ProfileHeader({
  profile,
  isOwnProfile,
  handleBack,
  setShowEditProfile,
  setShowMapPicker,
  setShowDistanceModal,
  navigate,
  t,
}) {
  return (
    <>
      {/* Top Navigation Bar with Back Button & Title */}
      <div className="profile-top-bar">
        <div className="profile-top-left">
          <button
            type="button"
            onClick={handleBack}
            className="profile-back-btn"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="profile-page-heading">
            {isOwnProfile
              ? t("profile.myProfile", "My Profile")
              : t("profile.userProfile", "Seller Profile")}
          </span>
        </div>
      </div>

      {/* Profile Header (Avatar, User Info & Action Buttons) */}
      <div className="profile-header-card">
        <div className="profile-header-left">
          {/* Profile Picture */}
          <div className="profile-avatar-wrapper">
            <img
              src={profile.profile_pic_url}
              alt={profile.full_name || "Profile"}
              className="profile-avatar-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300";
              }}
            />
          </div>

          {/* User details on the right side of the profile picture */}
          <div className="profile-info-block">
            <div className="profile-name-row">
              <h1 className="profile-user-name">
                {profile.full_name || profile.username || "RentHub Shop"}
              </h1>
              {profile.is_verified ? (
                <span className="profile-verified-chip" title="Verified Member">
                  <CheckCircle2 size={14} color="var(--primary)" fill="var(--primary)" />
                  <span>{t("profile.verified", "Verified")}</span>
                </span>
              ) : null}
            </div>

            {profile.about && (
              <p className="profile-user-about">{profile.about}</p>
            )}

            <div className="profile-meta-list">
              {(profile.address || profile.nearest_city) && (
                <span className="profile-meta-item">
                  <MapPin size={14} color="var(--primary)" />
                  <span>
                    {[profile.address, profile.nearest_city]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </span>
              )}

              {profile.email && (
                <span className="profile-meta-item">
                  <Mail size={14} color="var(--primary)" />
                  <span>{profile.email}</span>
                </span>
              )}

              {profile.phone_no && (
                <span className="profile-meta-item">
                  <Phone size={14} color="var(--primary)" />
                  <span>{profile.phone_no}</span>
                </span>
              )}
            </div>

            {/* Google Map Location Badge right below the address line */}
            <div className="profile-map-row">
              <button
                type="button"
                onClick={() => {
                  if (isOwnProfile && !profile.map_latitude) {
                    setShowMapPicker(true);
                  } else {
                    setShowDistanceModal(true);
                  }
                }}
                className="profile-map-button"
                title="Click to view shop location, route & distance on map"
              >
                <GoogleMapIcon size={16} />
                <span>
                  {profile.map_location_name ||
                    (profile.nearest_city
                      ? `${profile.nearest_city}`
                      : t("map.viewOnMap"))}
                </span>
                <span className="profile-map-button-route">
                  {t("map.viewDistanceRoute")}
                </span>
              </button>

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="profile-change-pin-btn"
                >
                  {profile.map_latitude
                    ? t("map.changeMapPin")
                    : t("map.setMapLocation")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Right Aligned */}
        {isOwnProfile && (
          <div className="profile-actions-wrapper">
            <button
              type="button"
              onClick={() => navigate("/add-item")}
              className="profile-primary-btn"
            >
              <Plus size={16} /> {t("profile.addItem")}
            </button>
            <button
              type="button"
              onClick={() => setShowEditProfile(true)}
              className="profile-secondary-btn"
            >
              <Edit3 size={16} /> {t("profile.editProfile")}
            </button>
            <SettingsPopup
              onOpenMapLocation={() => setShowMapPicker(true)}
            />
          </div>
        )}
      </div>
    </>
  );
}
