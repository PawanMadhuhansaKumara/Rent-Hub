
import React from "react";
import "./CategorySlider.css";

const categories = [
  "All",
  "Tools",
  "Electronics",
  "Vehicles",
  "Furniture",
  "Sports",
  "Camping",
  "Other"
];

function CategorySlider({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="category-slider">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategorySlider;
