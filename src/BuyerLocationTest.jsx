
import React, { useState } from "react";
import BuyerLocationPicker from "./components/BuyerLocationPicker";

function BuyerLocationTest() {
  const [isOpen, setIsOpen] = useState(true);
  const [buyerLocation, setBuyerLocation] = useState(null);

  return (
    <div style={{ padding: "25px" }}>
      <h2>Buyer Location Test</h2>

      <button onClick={() => setIsOpen(true)}>
        Select Buyer Location
      </button>

      {buyerLocation && (
        <div style={{ marginTop: "20px" }}>
          <h3>Selected Location</h3>

          <p>{buyerLocation.locationName}</p>

          <p>
            Latitude: {buyerLocation.latitude}
          </p>

          <p>
            Longitude: {buyerLocation.longitude}
          </p>
        </div>
      )}

      <BuyerLocationPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onLocationSelect={setBuyerLocation}
      />
    </div>
  );
}

export default BuyerLocationTest;
