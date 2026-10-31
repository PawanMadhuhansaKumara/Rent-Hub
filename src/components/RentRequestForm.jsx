export default function RentRequestForm({
  handleRequestSubmit,
  minDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  quantity,
  setQuantity,
  available,
  priceType,
  price,
}) {
  return (
    <form className="rent-request-form" onSubmit={handleRequestSubmit}>
      <div className="request-form-heading">
        <span className="request-form-icon">✓</span>
        <div>
          <h2>Rental Request</h2>
          <p>Choose your preferred rental dates.</p>
        </div>
      </div>

      <label htmlFor="startDate">Rental Start Date</label>
      <input
        id="startDate"
        type="date"
        min={minDate}
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          if (endDate && e.target.value > endDate) {
            setEndDate("");
          }
        }}
        required
      />

      <label htmlFor="endDate">Rental End Date</label>
      <input
        id="endDate"
        type="date"
        min={startDate || minDate}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
      />

      <label htmlFor="quantity">Quantity</label>
      <input
        id="quantity"
        type="number"
        min="1"
        max={available}
        value={quantity}
        onChange={(e) => {
          const value = Number(e.target.value);
          setQuantity(value > available ? available : value);
        }}
        required
      />

      <div className="request-price-summary">
        <span>Price per {priceType}</span>
        <strong>
          LKR{" "}
          {price.toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </strong>
      </div>

      <button type="submit" className="submit-request-button">
        Submit Request →
      </button>

      <p className="request-note">
        This is a demo form. Your request is not saved to the database yet.
      </p>
    </form>
  );
}
