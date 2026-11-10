import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Inbox, ShoppingCart, Package } from "lucide-react";

import RentRequestForm from "../components/RentRequestForm";
import RentRequestSuccessModal from "../components/RentRequestSuccessModal";
import RentedItemsTab from "../components/my-items/RentedItemsTab";
import RentRequestsTab from "../components/my-items/RentRequestsTab";
import RentCartTab from "../components/my-items/RentCartTab";
import InventoryItemsTab from "../components/my-items/InventoryItemsTab";

import "./MyItems.css";

const API_URL = "http://localhost:5001";

export default function MyItems({ user }) {
  const [searchParams] = useSearchParams();

  const currentUser =
    user ||
    (() => {
      try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();

  const userId = currentUser?.user_id || currentUser?.id;

  // -------------------------------------------------------------
  // TAB & FILTER NAVIGATION
  // -------------------------------------------------------------
  const validTabs = ["my-items", "rented-items", "rent-requests", "rent-cart"];
  const validRequestFilters = ["sent", "received"];

  const tabFromUrl = searchParams.get("tab");
  const initialTab = validTabs.includes(tabFromUrl)
    ? tabFromUrl
    : "rent-requests";

  const fromSource = searchParams.get("from");
  const isFromBusinessHub = fromSource === "business-hub";

  const filterFromUrl =
    searchParams.get("filter") || searchParams.get("subtab");

  const initialFilter = isFromBusinessHub
    ? "received"
    : validRequestFilters.includes(filterFromUrl)
      ? filterFromUrl
      : "sent";

  const subtabParam = searchParams.get("subtab");
  const initialRentedSubTab = isFromBusinessHub
    ? "sented-out"
    : subtabParam === "rented-in"
      ? "rented-in"
      : "sented-out";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [requestFilter, setRequestFilter] = useState(initialFilter);
  const [rentedSubTab, setRentedSubTab] = useState(initialRentedSubTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const fromParam = searchParams.get("from");
    if (fromParam === "business-hub") {
      setRequestFilter("received");
      setRentedSubTab("sented-out");
    } else {
      const filterParam =
        searchParams.get("filter") || searchParams.get("subtab");
      if (filterParam && validRequestFilters.includes(filterParam)) {
        setRequestFilter(filterParam);
      }
      if (filterParam === "rented-in" || filterParam === "sented-out") {
        setRentedSubTab(filterParam);
      }
    }
  }, [searchParams]);

  // -------------------------------------------------------------
  // INVENTORY ITEMS STATE
  // -------------------------------------------------------------
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/items/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to load your items.");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchMyItems();
  }, [userId]);

  // -------------------------------------------------------------
  // RENT REQUESTS STATE
  // -------------------------------------------------------------
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("rent_hub_requests");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.sort(
            (a, b) =>
              new Date(b.createdAt || b.created_at || 0).getTime() -
                new Date(a.createdAt || a.created_at || 0).getTime() ||
              Number(b.id || 0) - Number(a.id || 0),
          );
        }
      }
    } catch {}
    return [];
  });
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [updatingReqId, setUpdatingReqId] = useState(null);

  const fetchBuyerRequests = async () => {
    try {
      setLoadingRequests(true);
      let localReqs = [];
      try {
        const saved = localStorage.getItem("rent_hub_requests");
        if (saved) localReqs = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
      localReqs = (Array.isArray(localReqs) ? localReqs : []).filter(
        (r) =>
          r.status?.toLowerCase() !== "declined" &&
          r.status?.toLowerCase() !== "cancelled",
      );

      const userFilteredLocal = userId
        ? localReqs.filter(
            (r) =>
              Number(r.buyerId || r.buyer_id) === Number(userId) ||
              Number(r.sellerId || r.seller_id) === Number(userId) ||
              (!r.buyerId && !r.buyer_id),
          )
        : localReqs;

      userFilteredLocal.sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0).getTime() -
            new Date(a.createdAt || a.created_at || 0).getTime() ||
          Number(b.id || 0) - Number(a.id || 0),
      );

      if (!userId) {
        setRequests(userFilteredLocal);
        return;
      }

      try {
        const [buyerRes, sellerRes] = await Promise.all([
          fetch(`${API_URL}/api/rent-requests/buyer/${userId}`).catch(
            () => null,
          ),
          fetch(`${API_URL}/api/rent-requests/seller/${userId}`).catch(
            () => null,
          ),
        ]);

        let apiList = [];
        if (buyerRes && buyerRes.ok) {
          const bData = await buyerRes.json();
          if (Array.isArray(bData)) {
            apiList.push(...bData.map((it) => ({ ...it, reqType: "sent" })));
          }
        }
        if (sellerRes && sellerRes.ok) {
          const sData = await sellerRes.json();
          if (Array.isArray(sData)) {
            apiList.push(
              ...sData.map((it) => ({ ...it, reqType: "received" })),
            );
          }
        }

        const map = new Map();
        apiList.forEach((item) => map.set(String(item.id), item));
        userFilteredLocal.forEach((item) => {
          if (map.has(String(item.id))) {
            const apiItem = map.get(String(item.id));
            const status =
              item.status?.toLowerCase() === "rented"
                ? "rented"
                : apiItem.status || item.status;
            map.set(String(item.id), { ...item, ...apiItem, status });
            return;
          }

          // If this local request refers to an item & buyer already returned from API, do not create duplicate
          const itemKey = String(item.itemId || item.item_id);
          const buyerKey = String(item.buyerId || item.buyer_id);
          const alreadyInApi = apiList.some((apiItem) => {
            const aItemKey = String(apiItem.itemId || apiItem.item_id);
            const aBuyerKey = String(apiItem.buyerId || apiItem.buyer_id);
            return (
              itemKey &&
              itemKey === aItemKey &&
              buyerKey &&
              buyerKey === aBuyerKey
            );
          });

          if (!alreadyInApi) {
            map.set(String(item.id), item);
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) =>
            new Date(b.createdAt || b.created_at || 0) -
            new Date(a.createdAt || a.created_at || 0),
        );
        setRequests(merged);
        try {
          localStorage.setItem("rent_hub_requests", JSON.stringify(merged));
        } catch {}
        return;
      } catch (err) {
        console.warn("Could not reach backend for requests, using local:", err);
      }

      setRequests(userFilteredLocal);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchBuyerRequests();

    const handleUpdate = () => {
      fetchBuyerRequests();
      fetchMyItems();
    };

    window.addEventListener("rent_requests_updated", handleUpdate);
    window.addEventListener("items_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("rent_requests_updated", handleUpdate);
      window.removeEventListener("items_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [userId]);

  // -------------------------------------------------------------
  // RENT CART STATE
  // -------------------------------------------------------------
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [errorCart, setErrorCart] = useState("");
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("");

  const fetchCartItems = async () => {
    try {
      setLoadingCart(true);
      setErrorCart("");
      const res = await fetch(`${API_URL}/api/cart/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) =>
            new Date(b.createdAt || b.created_at || 0).getTime() -
              new Date(a.createdAt || a.created_at || 0).getTime() ||
            Number(b.id || 0) - Number(a.id || 0),
        );
        setCartItems(sorted);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to load cart items.");
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setErrorCart(err.message || "Failed to load cart items.");
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId, activeTab]);

  const isItemCurrentlyRented = (ci) => {
    if (!ci) return false;
    return (
      ci.available === "Rented Out" ||
      String(ci.available).toLowerCase() === "rented out" ||
      String(ci.available).toLowerCase() === "rented" ||
      ci.available === 0 ||
      ci.available === "0" ||
      (ci.available !== undefined &&
        ci.available !== null &&
        ci.available !== "" &&
        !isNaN(Number(ci.available)) &&
        Number(ci.available) < 1)
    );
  };

  const handleToggleSelect = (cartId) => {
    const item = cartItems.find((ci) => ci.id === cartId);
    if (item && isItemCurrentlyRented(item)) {
      alert("This item is currently rented out and cannot be rented.");
      return;
    }
    setSelectedCartIds((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId],
    );
  };

  const handleSelectAll = () => {
    const selectable = cartItems.filter((ci) => !isItemCurrentlyRented(ci));
    if (selectedCartIds.length === selectable.length) {
      setSelectedCartIds([]);
    } else {
      setSelectedCartIds(selectable.map((ci) => ci.id));
    }
  };

  const totalSelectedPrice = cartItems
    .filter((ci) => selectedCartIds.includes(ci.id))
    .reduce(
      (acc, curr) =>
        acc + Number(curr.price || 0) * (Number(curr.quantity) || 1),
      0,
    );

  const handleRemoveFromCart = async (cartId) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/${cartId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCartItems((prev) => prev.filter((it) => it.id !== cartId));
        setSelectedCartIds((prev) => prev.filter((id) => id !== cartId));
      } else {
        alert("Failed to remove item from cart.");
      }
    } catch (err) {
      console.error("Error removing cart item:", err);
      alert("Error removing item from cart.");
    }
  };

  // -------------------------------------------------------------
  // CART BULK & MODAL RENT ACTIONS
  // -------------------------------------------------------------
  const [rentModalItem, setRentModalItem] = useState(null);
  const [rentStartDate, setRentStartDate] = useState("");
  const [rentEndDate, setRentEndDate] = useState("");
  const [rentQuantity, setRentQuantity] = useState(1);

  const handleRentNow = async () => {
    if (selectedCartIds.length === 0) {
      alert("Please select at least one item from the cart to rent.");
      return;
    }
    const selectedItems = cartItems.filter(
      (ci) => selectedCartIds.includes(ci.id) && !isItemCurrentlyRented(ci),
    );

    if (selectedItems.length === 0) {
      alert("Selected items are currently rented out and cannot be rented.");
      return;
    }

    if (selectedItems.length === 1) {
      const targetItem = selectedItems[0];
      setRentModalItem(targetItem);
      setRentStartDate(targetItem.startDate || "");
      setRentEndDate(targetItem.endDate || "");
      setRentQuantity(targetItem.quantity || 1);
      return;
    }

    for (const item of selectedItems) {
      const s = item.startDate ? new Date(item.startDate) : new Date();
      const e = item.endDate
        ? new Date(item.endDate)
        : new Date(Date.now() + 86400000);
      const diffDays = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
      const numPrice = Number(item.price) || 0;
      const numQty = Number(item.quantity) || 1;
      const itemPriceType = item.priceType || item.price_type || "day";
      const total =
        itemPriceType === "day"
          ? numPrice * numQty * diffDays
          : numPrice * numQty;

      const payload = {
        itemId: item.itemId || item.item_id || item.id,
        buyerId: userId,
        sellerId: item.sellerId || item.user_id,
        startDate: item.startDate || new Date().toISOString().split("T")[0],
        endDate:
          item.endDate ||
          new Date(Date.now() + 86400000).toISOString().split("T")[0],
        quantity: numQty,
        totalPrice: total,
        status: "Pending",
      };

      try {
        await fetch(`${API_URL}/api/rent-requests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {}

      const localReq = {
        id: Date.now() + Math.random(),
        ...payload,
        createdAt: new Date().toISOString(),
        itemTitle: item.title || item.itemTitle,
        itemImage: item.image || item.image_url,
        itemPrice: numPrice,
        priceType: itemPriceType,
        sellerName: item.sellerName || "Owner",
      };

      try {
        const saved = JSON.parse(
          localStorage.getItem("rent_hub_requests") || "[]",
        );
        localStorage.setItem(
          "rent_hub_requests",
          JSON.stringify([localReq, ...saved]),
        );
      } catch {}

      handleRemoveFromCart(item.id);
    }

    fetchBuyerRequests();
    setSuccessModalTitle(`${selectedItems.length} selected item(s)`);
    setShowSuccessModal(true);
  };

  const handleCartRentSubmit = async (e) => {
    e.preventDefault();
    if (!rentModalItem) return;

    if (isItemCurrentlyRented(rentModalItem)) {
      alert("This item is currently rented out and cannot be rented.");
      return;
    }

    if (!rentStartDate || !rentEndDate) {
      alert("Please select rental start and end dates.");
      return;
    }

    const s = new Date(rentStartDate);
    const eDate = new Date(rentEndDate);
    const diffDays = Math.max(
      1,
      Math.ceil((eDate - s) / (1000 * 60 * 60 * 24)),
    );
    const numPrice = Number(rentModalItem.price) || 0;
    const numQty = Number(rentQuantity) || 1;
    const itemPriceType =
      rentModalItem.priceType || rentModalItem.price_type || "day";
    const calculatedTotal =
      itemPriceType === "day"
        ? numPrice * numQty * diffDays
        : numPrice * numQty;

    const requestPayload = {
      itemId: rentModalItem.itemId || rentModalItem.item_id || rentModalItem.id,
      buyerId: userId,
      sellerId: rentModalItem.sellerId || rentModalItem.user_id,
      startDate: rentStartDate,
      endDate: rentEndDate,
      quantity: numQty,
      totalPrice: calculatedTotal,
      status: "Pending",
    };

    let created = null;
    try {
      const res = await fetch(`${API_URL}/api/rent-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success !== false || data.requestId)) {
        created = {
          id: data.requestId || data.request?.id || Date.now(),
          ...requestPayload,
          createdAt: data.request?.createdAt || new Date().toISOString(),
          itemTitle: rentModalItem.title || rentModalItem.itemTitle,
          itemImage: rentModalItem.image || rentModalItem.image_url,
          itemPrice: numPrice,
          priceType: itemPriceType,
          sellerName:
            rentModalItem.sellerName || rentModalItem.userName || "Item Owner",
          sellerPhone:
            rentModalItem.sellerPhone || rentModalItem.phone_no || "",
        };
      }
    } catch (err) {
      console.warn("API request failed, persisting locally:", err);
    }

    if (!created) {
      created = {
        id: Date.now(),
        ...requestPayload,
        createdAt: new Date().toISOString(),
        itemTitle: rentModalItem.title || rentModalItem.itemTitle,
        itemImage: rentModalItem.image || rentModalItem.image_url,
        itemPrice: numPrice,
        priceType: itemPriceType,
        sellerName:
          rentModalItem.sellerName || rentModalItem.userName || "Item Owner",
        sellerPhone: rentModalItem.sellerPhone || rentModalItem.phone_no || "",
      };
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem("rent_hub_requests") || "[]",
      );
      const filtered = saved.filter((r) => String(r.id) !== String(created.id));
      localStorage.setItem(
        "rent_hub_requests",
        JSON.stringify([created, ...filtered]),
      );
      window.dispatchEvent(new Event("rent_requests_updated"));
    } catch {}

    if (rentModalItem.id) {
      handleRemoveFromCart(rentModalItem.id);
    }

    setRequests((prev) => [
      created,
      ...prev.filter((r) => String(r.id) !== String(created.id)),
    ]);
    const sentTitle = created.itemTitle;
    setRentModalItem(null);
    setRentStartDate("");
    setRentEndDate("");
    setRentQuantity(1);
    setSuccessModalTitle(sentTitle);
    setShowSuccessModal(true);
    return true;
  };

  // -------------------------------------------------------------
  // STATUS UPDATE HANDLERS
  // -------------------------------------------------------------
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/items/status/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((it) =>
            String(it.id) === String(itemId)
              ? { ...it, available: newStatus }
              : it,
          ),
        );

        if (newStatus === "Available") {
          setRequests((prev) => {
            const updated = prev.map((r) =>
              String(r.itemId || r.item_id) === String(itemId) &&
              r.status?.toLowerCase() === "rented"
                ? { ...r, status: "Completed" }
                : r,
            );
            try {
              localStorage.setItem(
                "rent_hub_requests",
                JSON.stringify(updated),
              );
            } catch {}
            return updated;
          });
        }

        window.dispatchEvent(new Event("rent_requests_updated"));
        window.dispatchEvent(new Event("items_updated"));
        window.dispatchEvent(new Event("storage"));
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating item status.");
    }
  };

  const [returningItemId, setReturningItemId] = useState(null);

  const handleReturnItem = async (rentedItem) => {
    if (!rentedItem) return;
    const itemId = rentedItem.itemId || rentedItem.id;
    const reqId = rentedItem.requestId;

    setReturningItemId(String(itemId || reqId));

    // 1. Optimistic instant state update
    // Restore item availability in inventory state
    setItems((prev) =>
      prev.map((it) =>
        String(it.id) === String(itemId)
          ? { ...it, available: "Available" }
          : it,
      ),
    );

    // Update requests to Completed so item leaves rented lists (for both shop & customer)
    setRequests((prev) => {
      const updated = prev.map((r) => {
        const isMatch =
          (reqId && String(r.id) === String(reqId)) ||
          (itemId && String(r.itemId || r.item_id) === String(itemId));
        return isMatch && r.status?.toLowerCase() === "rented"
          ? { ...r, status: "Completed" }
          : r;
      });
      try {
        localStorage.setItem("rent_hub_requests", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      // 2. Call backend APIs to restore availability and complete the rental request
      const calls = [];
      if (itemId) {
        calls.push(
          fetch(`${API_URL}/api/items/status/${itemId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ available: "Available" }),
          }).catch((err) => console.warn("Item status update warning:", err)),
        );
      }
      if (reqId) {
        calls.push(
          fetch(`${API_URL}/api/rent-requests/${reqId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Completed" }),
          }).catch((err) =>
            console.warn("Request status update warning:", err),
          ),
        );
      }

      await Promise.all(calls);

      // 3. Dispatch events to notify other views (Home, Profile, Item Details)
      window.dispatchEvent(new Event("items_updated"));
      window.dispatchEvent(new Event("rent_requests_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error returning item:", err);
    } finally {
      setReturningItemId(null);
    }
  };

  const handleRequestAction = async (
    reqId,
    newStatus,
    verificationData = null,
  ) => {
    const isRemoval =
      newStatus?.toLowerCase() === "declined" ||
      newStatus?.toLowerCase() === "cancelled";

    const targetReq = requests.find((r) => String(r.id) === String(reqId));
    const targetItemId = targetReq?.itemId || targetReq?.item_id;

    // 1. Instantly update React state and localStorage FIRST so UI changes on single click immediately!
    setRequests((prev) => {
      const updated = isRemoval
        ? prev.filter((r) => String(r.id) !== String(reqId))
        : prev.map((r) =>
            String(r.id) === String(reqId)
              ? {
                  ...r,
                  status: newStatus,
                  ...(verificationData
                    ? { verification: verificationData }
                    : {}),
                }
              : r,
          );
      try {
        localStorage.setItem("rent_hub_requests", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (newStatus?.toLowerCase() === "rented") {
      if (targetItemId) {
        setItems((prev) =>
          prev.map((it) =>
            String(it.id) === String(targetItemId)
              ? { ...it, available: "Rented Out" }
              : it,
          ),
        );
      }
    }

    // 2. Sync to backend asynchronously
    setUpdatingReqId(reqId);
    try {
      if (isRemoval) {
        await fetch(`${API_URL}/api/rent-requests/${reqId}`, {
          method: "DELETE",
        }).catch(() => null);
        await fetch(`${API_URL}/api/rent-requests/${reqId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }).catch(() => null);
      } else if (newStatus?.toLowerCase() === "rented" && verificationData) {
        // Dedicated Handover Verification Endpoint
        await fetch(`${API_URL}/api/rent-requests/${reqId}/handover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verificationData),
        });
      } else {
        await fetch(`${API_URL}/api/rent-requests/${reqId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (newStatus?.toLowerCase() === "rented" && targetItemId) {
          try {
            await fetch(`${API_URL}/api/items/status/${targetItemId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ available: "Rented Out" }),
            });
          } catch (e) {}
        }
      }

      // 3. Dispatch events AFTER backend has completed
      window.dispatchEvent(new Event("rent_requests_updated"));
      window.dispatchEvent(new Event("items_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Backend status update error:", e);
    } finally {
      setUpdatingReqId(null);
    }
  };

  // -------------------------------------------------------------
  // RENTED ITEMS DERIVED LISTS
  // -------------------------------------------------------------
  const ownedRentedOut = items
    .filter(
      (item) =>
        item.available === "Rented Out" ||
        item.available === 0 ||
        item.available === "0",
    )
    .map((item) => {
      const activeReq =
        requests.find((r) => {
          const isItemMatch = String(r.itemId || r.item_id) === String(item.id);
          const isOwner =
            Number(r.sellerId || r.seller_id) === Number(userId) ||
            Number(r.buyerId || r.buyer_id) !== Number(userId);
          const isConfirmed =
            r.status?.toLowerCase() === "rented" ||
            r.status?.toLowerCase() === "approved";
          return isItemMatch && isOwner && isConfirmed;
        }) ||
        requests.find((r) => {
          const isItemMatch = String(r.itemId || r.item_id) === String(item.id);
          const isOwner =
            Number(r.sellerId || r.seller_id) === Number(userId) ||
            Number(r.buyerId || r.buyer_id) !== Number(userId);
          return isItemMatch && isOwner;
        }) ||
        requests.find((r) => String(r.itemId || r.item_id) === String(item.id));

      return {
        uniqueKey: `item-${item.id}`,
        id: item.id,
        itemId: item.id,
        title: item.title,
        image: item.image,
        category: item.category,
        price: item.price,
        priceType: item.priceType,
        available: item.available,
        rentType: "sented-out",
        isInventoryItem: true,
        renterId: activeReq
          ? activeReq.buyerId || activeReq.buyer_id || activeReq.requesterId
          : null,
        renterName: activeReq
          ? activeReq.requesterName ||
            activeReq.buyerName ||
            activeReq.buyer_name ||
            "Customer"
          : null,
        renterPhone: activeReq
          ? activeReq.requesterPhone ||
            activeReq.buyerPhone ||
            activeReq.buyer_phone
          : null,
        renterEmail: activeReq
          ? activeReq.requesterEmail ||
            activeReq.buyerEmail ||
            activeReq.buyer_email
          : null,
        renterCity: activeReq
          ? activeReq.requesterCity ||
            activeReq.buyerCity ||
            activeReq.buyer_city ||
            activeReq.requesterAddress
          : null,
        startDate: activeReq?.startDate || activeReq?.start_date,
        endDate: activeReq?.endDate || activeReq?.end_date,
        totalPrice: activeReq?.totalPrice,
        requestStatus: activeReq?.status,
        createdAt:
          activeReq?.createdAt ||
          activeReq?.created_at ||
          item.updated_at ||
          item.created_at,
        requestId: activeReq?.id || item.id,
      };
    });

  const seenSentedOutItemIds = new Set(
    ownedRentedOut.map((it) => String(it.id)),
  );
  const receivedReqRentedOut = requests
    .filter((r) => {
      const isOwner = !(
        Number(r.buyerId || r.buyer_id) === Number(userId) ||
        (!r.sellerId && !r.seller_id) ||
        r.reqType === "sent"
      );
      const isConfirmed = r.status?.toLowerCase() === "rented";
      if (!isOwner || !isConfirmed) return false;

      const itemKey = String(r.itemId || r.item_id || r.id);
      if (seenSentedOutItemIds.has(itemKey)) {
        return false;
      }
      seenSentedOutItemIds.add(itemKey);
      return true;
    })
    .map((r) => ({
      uniqueKey: `req-${r.id}`,
      id: r.itemId || r.item_id || r.id,
      itemId: r.itemId || r.item_id,
      requestId: r.id,
      title: r.itemTitle || "Rented Item",
      image: r.itemImage,
      category: "Rented Out",
      price:
        r.itemPrice || (r.totalPrice ? r.totalPrice / (r.quantity || 1) : 0),
      priceType: r.priceType || "day",
      available: "Rented Out",
      rentType: "sented-out",
      isInventoryItem: false,
      renterId: r.buyerId || r.buyer_id || r.requesterId,
      renterName: r.requesterName || r.buyerName || r.buyer_name || "Customer",
      renterPhone: r.requesterPhone || r.buyerPhone || r.buyer_phone,
      renterEmail: r.requesterEmail || r.buyerEmail || r.buyer_email,
      renterCity:
        r.requesterCity || r.buyerCity || r.buyer_city || r.requesterAddress,
      startDate: r.startDate || r.start_date,
      endDate: r.endDate || r.end_date,
      totalPrice: r.totalPrice,
      requestStatus: r.status,
      createdAt: r.createdAt || r.created_at,
    }));

  const getSortTimestamp = (it) => {
    const d =
      it.updatedAt ||
      it.updated_at ||
      it.createdAt ||
      it.created_at ||
      it.startDate;
    const timeVal = d ? new Date(d).getTime() : 0;
    const idVal = Number(it.requestId || it.id || 0);
    return isNaN(timeVal) || timeVal === 0 ? idVal : timeVal;
  };

  const sentedOutList = [...ownedRentedOut, ...receivedReqRentedOut].sort(
    (a, b) =>
      getSortTimestamp(b) - getSortTimestamp(a) ||
      Number(b.requestId || b.id || 0) - Number(a.requestId || a.id || 0),
  );

  const seenRentedInItemIds = new Set();
  const rentedInList = requests
    .filter((r) => {
      const isBuyer =
        Number(r.buyerId || r.buyer_id) === Number(userId) ||
        (!r.sellerId && !r.seller_id) ||
        r.reqType === "sent";
      const isConfirmed =
        r.status?.toLowerCase() === "rented" ||
        r.status === "Approved" ||
        r.status?.toLowerCase() === "approved";
      if (!isBuyer || !isConfirmed) return false;

      const itemKey = String(r.itemId || r.item_id || r.id);
      if (seenRentedInItemIds.has(itemKey)) {
        return false;
      }
      seenRentedInItemIds.add(itemKey);
      return true;
    })
    .map((r) => ({
      uniqueKey: `rented-in-${r.id}`,
      id: r.itemId || r.item_id || r.id,
      itemId: r.itemId || r.item_id,
      requestId: r.id,
      title: r.itemTitle || "Rented Item",
      image: r.itemImage,
      category: "Rented In",
      price: r.itemPrice,
      priceType: r.priceType,
      rentType: "rented-in",
      isInventoryItem: false,
      sellerId: r.sellerId || r.seller_id || r.userId || r.user_id,
      sellerName: r.sellerName || r.seller_name || r.userName || "Shop Owner",
      sellerPhone: r.sellerPhone || r.seller_phone || r.userPhone || r.phone_no,
      sellerEmail: r.sellerEmail || r.seller_email || r.userEmail || r.email,
      sellerCity:
        r.sellerCity || r.seller_city || r.sellerAddress || r.nearestCity,
      startDate: r.startDate || r.start_date,
      endDate: r.endDate || r.end_date,
      quantity: r.quantity,
      totalPrice: r.totalPrice,
      requestStatus: r.status,
      createdAt: r.createdAt || r.created_at,
    }))
    .sort(
      (a, b) =>
        getSortTimestamp(b) - getSortTimestamp(a) ||
        Number(b.requestId || b.id || 0) - Number(a.requestId || a.id || 0),
    );

  const allRentedItems = [...sentedOutList, ...rentedInList];
  const allRentedCount = allRentedItems.length;

  const displayedRentedItems =
    isFromBusinessHub || rentedSubTab === "sented-out"
      ? sentedOutList
      : rentedInList;

  // -------------------------------------------------------------
  // FIXED NAVIGATION TABS HEADER (Rent Requests -> Rented Items -> Rent Items Cart)
  // -------------------------------------------------------------
  const tabsConfig = [
    {
      key: "rent-requests",
      label: "Rent Requests",
      icon: <Inbox size={17} />,
      count: isFromBusinessHub
        ? requests.filter(
            (r) =>
              !(
                Number(r.buyerId || r.buyer_id) === Number(userId) ||
                (!r.sellerId && !r.seller_id) ||
                r.reqType === "sent"
              ) &&
              r.status?.toLowerCase() !== "declined" &&
              r.status?.toLowerCase() !== "cancelled" &&
              r.status?.toLowerCase() !== "rented",
          ).length
        : requests.filter(
            (r) =>
              r.status?.toLowerCase() !== "declined" &&
              r.status?.toLowerCase() !== "cancelled" &&
              r.status?.toLowerCase() !== "rented",
          ).length,
    },
    {
      key: "rented-items",
      label: "Rented Items",
      icon: <Clock size={17} />,
      count: isFromBusinessHub ? sentedOutList.length : allRentedCount,
    },
    {
      key: "rent-cart",
      label: "Rent Items Cart",
      icon: <ShoppingCart size={17} />,
      count: cartItems.length,
    },
  ];

  return (
    <div className="my-items-page">
      <div className="my-items-container">
        {/* Navigation Tabs (Fixed Order) */}
        <div className="my-items-tabs">
          {tabsConfig.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`my-items-tab-btn ${
                activeTab === tab.key ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="my-items-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: MY ITEMS (INVENTORY) */}
        {activeTab === "my-items" && (
          <InventoryItemsTab
            items={items}
            loading={loading}
            error={error}
            onStatusChange={handleStatusChange}
            onRetry={fetchMyItems}
            API_URL={API_URL}
          />
        )}

        {/* TAB 2: RENTED ITEMS */}
        {activeTab === "rented-items" && (
          <RentedItemsTab
            displayedRentedItems={displayedRentedItems}
            rentedSubTab={rentedSubTab}
            setRentedSubTab={setRentedSubTab}
            allRentedCount={allRentedCount}
            sentedOutCount={sentedOutList.length}
            rentedInCount={rentedInList.length}
            loading={loading}
            onStatusChange={handleStatusChange}
            onReturnItem={handleReturnItem}
            returningItemId={returningItemId}
            onNavigateTab={(tab) => setActiveTab(tab)}
            API_URL={API_URL}
            hideRentedIn={isFromBusinessHub}
          />
        )}

        {/* TAB 3: RENT REQUESTS */}
        {activeTab === "rent-requests" && (
          <RentRequestsTab
            requests={requests}
            requestFilter={requestFilter}
            setRequestFilter={setRequestFilter}
            userId={userId}
            loadingRequests={loadingRequests}
            updatingReqId={updatingReqId}
            onAction={handleRequestAction}
            API_URL={API_URL}
            hideSentByMe={isFromBusinessHub}
          />
        )}

        {/* TAB 4: RENT CART */}
        {activeTab === "rent-cart" && (
          <RentCartTab
            cartItems={cartItems}
            loadingCart={loadingCart}
            errorCart={errorCart}
            selectedCartIds={selectedCartIds}
            totalSelectedPrice={totalSelectedPrice}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onRemoveFromCart={handleRemoveFromCart}
            onRentNow={handleRentNow}
            onRetry={fetchCartItems}
          />
        )}
      </div>

      {/* SINGLE ITEM RENT REQUEST MODAL */}
      {rentModalItem && (
        <RentRequestForm
          isOpen={!!rentModalItem}
          onClose={() => {
            setRentModalItem(null);
            setRentStartDate("");
            setRentEndDate("");
            setRentQuantity(1);
          }}
          handleRequestSubmit={handleCartRentSubmit}
          startDate={rentStartDate}
          setStartDate={setRentStartDate}
          endDate={rentEndDate}
          setEndDate={setRentEndDate}
          quantity={rentQuantity}
          setQuantity={setRentQuantity}
          available={10}
          priceType={rentModalItem.priceType || "day"}
          price={rentModalItem.price || 0}
          itemTitle={rentModalItem.title}
        />
      )}

      {/* RENT REQUEST SUCCESS MODAL */}
      {showSuccessModal && (
        <RentRequestSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onShowRequests={() => {
            setShowSuccessModal(false);
            setActiveTab("rent-requests");
            setRequestFilter("sent");
          }}
          itemTitle={successModalTitle}
        />
      )}
    </div>
  );
}
