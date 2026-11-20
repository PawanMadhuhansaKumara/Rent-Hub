
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Boxes,
  Wrench,
  Smartphone,
  Camera,
  Car,
  Armchair,
  Dumbbell,
  Tent,
  Tag,
} from "lucide-react";
import "./CategorySlider.css";

const categories = [
  { name: "All", label: "All Items", icon: Boxes },
  { name: "Tools", label: "Tools", icon: Wrench },
  { name: "Electronics", label: "Electronics", icon: Smartphone },
  { name: "Cameras", label: "Cameras", icon: Camera },
  { name: "Vehicles", label: "Vehicles", icon: Car },
  { name: "Furniture", label: "Furniture", icon: Armchair },
  { name: "Sports", label: "Sports", icon: Dumbbell },
  { name: "Camping", label: "Camping", icon: Tent },
  { name: "Other", label: "Other", icon: Tag },
];

function CategorySlider({ selectedCategory, setSelectedCategory, itemCounts = {} }) {
  const { t } = useTranslation();
  return (
    <div className="category-slider">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const count = itemCounts[cat.name];
        return (
          <button
            key={cat.name}
            type="button"
            className={`category-btn ${
              selectedCategory === cat.name ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            <Icon size={16} className="category-icon" />
            <span>{t(`categories.${cat.name.toLowerCase()}`, cat.label)}</span>
            {count !== undefined && count > 0 && (
              <span className="category-count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CategorySlider;
