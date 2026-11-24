import { formatRentalDate, formatRequestTime } from "./dateUtils.js";

/**
 * matchesRentalSearch
 * Filters rental items/requests by item name, username, and date.
 * Supports multi-token search so queries like "drill nov", "kamal camera", or "2026-11-20" match.
 *
 * @param {Object} item - Rental request or rented item object
 * @param {string} query - Search query string
 * @returns {boolean} True if the item matches all tokens in the query
 */
export const matchesRentalSearch = (item, query) => {
  if (!item) return false;
  if (!query || typeof query !== "string" || !query.trim()) return true;

  const tokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const searchableParts = [];

  // 1. Item Name, Title, and Category
  if (item.title) searchableParts.push(item.title);
  if (item.itemTitle) searchableParts.push(item.itemTitle);
  if (item.item_title) searchableParts.push(item.item_title);
  if (item.name) searchableParts.push(item.name);
  if (item.category) searchableParts.push(item.category);

  // 2. Usernames (Requester, Buyer, Seller, Owner, Renter, Target)
  if (item.userName) searchableParts.push(item.userName);
  if (item.user_name) searchableParts.push(item.user_name);
  if (item.buyerName) searchableParts.push(item.buyerName);
  if (item.buyer_name) searchableParts.push(item.buyer_name);
  if (item.sellerName) searchableParts.push(item.sellerName);
  if (item.seller_name) searchableParts.push(item.seller_name);
  if (item.requesterName) searchableParts.push(item.requesterName);
  if (item.requester_name) searchableParts.push(item.requester_name);
  if (item.renterName) searchableParts.push(item.renterName);
  if (item.renter_name) searchableParts.push(item.renter_name);
  if (item.targetUserName) searchableParts.push(item.targetUserName);

  // 3. Contact information (phone, email, city) for convenience
  if (item.renterPhone) searchableParts.push(item.renterPhone);
  if (item.buyerPhone || item.buyer_phone) searchableParts.push(item.buyerPhone || item.buyer_phone);
  if (item.sellerPhone || item.seller_phone) searchableParts.push(item.sellerPhone || item.seller_phone);
  if (item.renterEmail) searchableParts.push(item.renterEmail);
  if (item.buyerEmail || item.buyer_email) searchableParts.push(item.buyerEmail || item.buyer_email);
  if (item.sellerEmail || item.seller_email) searchableParts.push(item.sellerEmail || item.seller_email);
  if (item.sellerCity || item.seller_city) searchableParts.push(item.sellerCity || item.seller_city);
  if (item.renterCity || item.buyerCity || item.buyer_city) searchableParts.push(item.renterCity || item.buyerCity || item.buyer_city);

  // 4. Dates (Raw strings and formatted versions)
  const rawDates = [
    item.startDate || item.start_date,
    item.endDate || item.end_date,
    item.createdAt || item.created_at,
    item.updatedAt || item.updated_at,
  ].filter(Boolean);

  for (const d of rawDates) {
    searchableParts.push(String(d));
    try {
      const formatted = formatRentalDate(d);
      if (formatted && formatted !== "N/A") {
        searchableParts.push(formatted);
      }
      const formattedTime = formatRequestTime(d);
      if (formattedTime && formattedTime !== "Recently") {
        searchableParts.push(formattedTime);
      }
      const dateObj = new Date(d);
      if (!isNaN(dateObj.getTime())) {
        searchableParts.push(
          dateObj.toLocaleDateString("en-US", { month: "long" })
        );
        searchableParts.push(String(dateObj.getFullYear()));
        searchableParts.push(String(dateObj.getDate()));
      }
    } catch {}
  }

  // 5. Status text
  if (item.status) searchableParts.push(item.status);
  if (item.requestStatus) searchableParts.push(item.requestStatus);

  const haystack = searchableParts.join(" ").toLowerCase();

  // Every token must match somewhere in haystack
  return tokens.every((token) => haystack.includes(token));
};
