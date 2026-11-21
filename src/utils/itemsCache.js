/**
 * itemsCache.js
 * High-performance in-memory cache and change detector for Rent-Hub items.
 * Ensures items load instantaneously on page switches and ONLY re-render when actual data changes.
 */

let cachedItems = null;
let cachedKey = "all";

export const getCachedItems = (key = "all") => {
  if (cachedKey === key && Array.isArray(cachedItems) && cachedItems.length > 0) {
    return cachedItems;
  }
  return null;
};

export const setCachedItems = (items, key = "all") => {
  cachedItems = Array.isArray(items) ? items : [];
  cachedKey = key;
};

export const getCachedItemById = (id) => {
  if (!id || !Array.isArray(cachedItems)) return null;
  return cachedItems.find((p) => String(p.id) === String(id)) || null;
};

/**
 * Fast item comparison to detect whether the server item list actually changed.
 * Avoids unnecessary re-renders when backend data is identical.
 */
export const areItemsEqual = (prevList, nextList) => {
  if (!prevList && !nextList) return true;
  if (!prevList || !nextList) return false;
  if (prevList.length !== nextList.length) return false;

  for (let i = 0; i < prevList.length; i++) {
    const p = prevList[i];
    const n = nextList[i];
    if (
      p.id !== n.id ||
      p.title !== n.title ||
      p.price !== n.price ||
      p.available !== n.available ||
      p.available_quantity !== n.available_quantity ||
      p.is_available !== n.is_available ||
      p.views !== n.views ||
      p.updated_at !== n.updated_at
    ) {
      return false;
    }
  }
  return true;
};
