import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, ShoppingBag, Clock, Package, ArrowRight } from "lucide-react";

export default function BusinessQuickOperations() {
  const { t } = useTranslation();

  const operations = [
    {
      to: "/add-item",
      icon: <Plus size={20} />,
      title: t("businessHub.addNewItem", "Add New Item"),
      desc: t("businessHub.addNewItemDesc", "Upload photos, set rates & stock"),
    },
    {
      to: "/my-items?tab=rent-requests&filter=received&from=business-hub",
      icon: <ShoppingBag size={20} />,
      title: t("businessHub.rentalRequests", "Rental Requests"),
      desc: t(
        "businessHub.rentalRequestsDesc",
        "Review customer booking requests"
      ),
    },
    {
      to: "/my-items?tab=rented-items&subtab=sented-out&from=business-hub",
      icon: <Clock size={20} />,
      title: t("businessHub.activeRentedItems", "Active Rented Items"),
      desc: t(
        "businessHub.activeRentedItemsDesc",
        "Track return dates & item status"
      ),
    },
    {
      to: "/my-items?tab=my-items",
      icon: <Package size={20} />,
      title: t("businessHub.fullInventory", "Full Inventory"),
      desc: t(
        "businessHub.fullInventoryDesc",
        "Edit prices, availability & details"
      ),
    },
  ];

  return (
    <div id="quick-operations" className="business-actions-section">
      <div className="section-heading-row">
        <h3>{t("businessHub.quickOperations", "Quick Operations")}</h3>
      </div>

      <div className="business-actions-grid">
        {operations.map((op) => (
          <Link key={op.to} to={op.to} className="action-card">
            <div className="action-icon">{op.icon}</div>
            <div className="action-info">
              <h4>{op.title}</h4>
              <p>{op.desc}</p>
            </div>
            <ArrowRight size={18} className="action-arrow" />
          </Link>
        ))}
      </div>
    </div>
  );
}
