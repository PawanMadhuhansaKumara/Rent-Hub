import { Link } from "react-router-dom";
import { User, MapPin } from "lucide-react";
import "./components.css";
import { useTranslation } from "react-i18next";

export default function ItemCard({ item }) {
  const { t } = useTranslation();
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
    const directRented =
      item.available === "Rented Out" ||
      String(item.available).toLowerCase() === "rented out" ||
      String(item.available).toLowerCase() === "rented" ||
      item.available === 0 ||
      item.available === "0" ||
      String(item.status).toLowerCase() === "rented" ||
      (item.available !== undefined &&
        item.available !== null &&
        item.available !== "" &&
        !isNaN(Number(item.available)) &&
        Number(item.available) < 1);
    if (directRented) return true;

    try {
      const saved = localStorage.getItem("rent_hub_requests");
      if (saved) {
        const requests = JSON.parse(saved);
        if (Array.isArray(requests)) {
          return requests.some((r) => {
            const matchItem =
              String(r.itemId || r.item_id) === String(item.id);
            const isRentedStatus = String(r.status).toLowerCase() === "rented";
            return matchItem && isRentedStatus;
          });
        }
      }
    } catch {}
    return false;
  })();

  return (
    <article className="item-card">
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
            <User size={13} color="#15803d" />
          </div>
        </div>

        <div className="item-author-info">
          <span className="item-author-name" title={authorName}>
            {authorName}
          </span>
          <span className="item-author-badge" title={nearestCity}>
            <MapPin size={10} style={{ flexShrink: 0, color: "#16a34a" }} />
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
              background: "#b91c1c",
              color: "#ffffff",
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
          <span
            className="item-availability"
            style={{
              color: isRented ? "#b91c1c" : "inherit",
              fontWeight: isRented ? "700" : "inherit",
            }}
          >
            {isRented
              ? "Rented Out"
              : `${t("item.availability")}: ${item.available ?? 1}`}
          </span>
        </div>

        <div className="item-price">
          <strong>
            {t("item.currency")} {Number(item.price).toFixed(2)}
          </strong>

          <span>/ {t(`item.${item.priceType || "day"}`)}</span>
        </div>

        <Link to={`/item/${item.id}`} className="view-details-button">
          {t("item.viewDetails")} <span>→</span>
        </Link>
        
      </div>
    </article>
  );
}
