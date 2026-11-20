import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, MapPin } from "lucide-react";
import "./components.css";
import { useTranslation } from "react-i18next";

export default function ItemCard({ item }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Card එක click කළ විට views වැඩි කර details page එකට යාම
  const handleCardClick = (e) => {
    // Seller profile link එක click කළ විට details page එකට යාම වළක්වන්න
    if (e.target.closest(".item-author-header")) {
      return;
    }

    // Card එක click කළ සැනින් view එකක් record කිරීම
    fetch(`http://localhost:5001/api/items/${item.id}/view`, {
      method: "POST",
    }).catch(() => {});

    navigate(`/item/${item.id}`);
  };

  const imageUrl = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `http://localhost:5001${item.image.startsWith("/") ? "" : "/"}${item.image}`
    : null;

  const rawAvatar = item.userProfilePic || item.user_profile_pic;
  const avatarUrl = rawAvatar
    ? rawAvatar.startsWith("http")
      ? rawAvatar
      : `http://localhost:5001${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`
    : null;

  const authorName =
    item.userName || item.user_name || item.seller_name || "Rent Hub Member";

  const nearestCity =
    item.nearestCity || item.nearest_city || item.city || "Sri Lanka";

  const authorId = item.userId || item.user_id;
  const authorProfileLink = authorId ? `/profile/${authorId}` : "/profile";

   const isRented = (() => {
    if (!item) return false;

    // Database එකේ available_quantity එක 0 හෝ ඊට අඩු නම් පමණක් Rented Out වේ!
    const stock =
      item.available_quantity !== undefined && item.available_quantity !== null
        ? Number(item.available_quantity)
        : null;

    if (stock !== null) {
      return stock <= 0;
    }

    return (
      item.available === "Rented Out" ||
      String(item.available).toLowerCase() === "rented out" ||
      item.available === 0 ||
      item.available === "0"
    );
  })();

  return (
    <article
      className="item-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* Facebook-style Author Header at the Very Top */}
      <Link to={authorProfileLink} className="item-author-header">
        <div className="item-author-avatar-wrapper">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={authorName}
              className="item-author-avatar"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.parentElement?.querySelector(
                  ".item-author-avatar-fallback",
                );
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="item-author-avatar-fallback"
            style={{ display: avatarUrl ? "none" : "flex" }}
          >
            <User size={13} color="var(--primary)" />
          </div>
        </div>

        <div className="item-author-info">
          <span className="item-author-name" title={authorName}>
            {authorName}
          </span>
          <span className="item-author-badge" title={nearestCity}>
            <MapPin size={10} style={{ flexShrink: 0, color: "var(--primary)" }} />
            <span>{nearestCity}</span>
          </span>
        </div>
      </Link>

      <div className="item-card-image-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="item-image"
            loading="lazy"
          />
        ) : (
          <div className="no-image">No Image Available</div>
        )}
        {isRented && (
          <span
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "var(--badge-red-text)",
              color: "var(--text-inverse)",
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              zIndex: 2,
            }}
          >
            Rented Out
          </span>
        )}
      </div>

      <div className="item-info">
        <div className="item-header">
          <h3 className="item-title" title={item.title}>
            {item.title}
          </h3>
        </div>

        <div className="item-meta-row">
          <span className="item-condition">
            {t("item.condition")}: {item.condition || "Good"}
          </span>
                    <span className="item-availability"
            style={{
              color: isRented ? "var(--badge-red-text)" : "inherit",
              fontWeight: isRented ? "700" : "inherit",
            }}
          >
            {isRented
              ? "Rented Out"
              : `${t("item.availability")}: ${item.available_quantity ?? item.available ?? 1}`}
          </span>

        </div>

        <div className="item-price">
          <strong>
            {t("item.currency")} {Number(item.price).toFixed(2)}
          </strong>
          <span>/ {t(`item.${item.priceType || "day"}`)}</span>
        </div>
      </div>
    </article>
  );
}