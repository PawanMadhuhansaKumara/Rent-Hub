/**
 * dateUtils.js
 * Comprehensive date formatting utilities for Rent-Hub
 */

/**
 * Formats a rental date string or timestamp cleanly without timezone shifts.
 * Handles ISO strings ("2026-11-10T00:00:00.000Z"), YYYY-MM-DD, or Date objects.
 * Output example: "Nov 10, 2026"
 */
export const formatRentalDate = (dateVal) => {
  if (!dateVal) return "N/A";
  try {
    let clean = String(dateVal).trim();
    if (clean.includes("T")) {
      clean = clean.split("T")[0];
    }
    // Match YYYY-MM-DD
    const match = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return clean || String(dateVal);
  } catch {
    return String(dateVal || "N/A");
  }
};

/**
 * Formats request creation time.
 * Output example: "Nov 10, 2026, 09:45 PM"
 */
export const formatRequestTime = (dateVal) => {
  if (!dateVal) return "Recently";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
};

/**
 * Returns a compact relative time string for cards (especially mobile).
 * e.g. "Just now", "5m ago", "2h ago", "Yesterday", "Nov 10"
 */
export const formatCompactTime = (dateVal) => {
  if (!dateVal) return "Recently";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffSec = Math.max(0, Math.floor((now - d) / 1000));
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
};

/**
 * Checks if a rental item or request is overdue (late return).
 * A rental is late if:
 * 1. It is currently active / picked up / rented (not completed, returned, declined, or cancelled).
 * 2. The end_date is in the past.
 */
export const isRentalLate = (item) => {
  if (!item) return false;
  const status = (item.requestStatus || item.status || "").toLowerCase();

  // If completed, returned, declined, cancelled, or rejected, it is not late
  if (
    status === "completed" ||
    status === "returned" ||
    status === "declined" ||
    status === "cancelled" ||
    status === "rejected"
  ) {
    return false;
  }

  const endRaw = item.endDate || item.end_date;
  if (!endRaw) return false;

  try {
    let clean = String(endRaw).trim();
    let endDate;
    if (clean.includes("T")) {
      endDate = new Date(clean);
    } else {
      const match = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        endDate = new Date(year, month, day, 23, 59, 59, 999);
      } else {
        endDate = new Date(clean);
      }
    }

    if (isNaN(endDate.getTime())) return false;
    return Date.now() > endDate.getTime();
  } catch {
    return false;
  }
};

/**
 * Returns number of days a rental is overdue (e.g. 1, 2, 5).
 */
export const getDaysOverdue = (item) => {
  if (!isRentalLate(item)) return 0;
  const endRaw = item.endDate || item.end_date;
  try {
    let clean = String(endRaw).trim();
    let endDate;
    if (clean.includes("T")) {
      endDate = new Date(clean);
    } else {
      const match = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        endDate = new Date(year, month, day, 23, 59, 59, 999);
      } else {
        endDate = new Date(clean);
      }
    }
    const diffMs = Date.now() - endDate.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 1;
  }
};
