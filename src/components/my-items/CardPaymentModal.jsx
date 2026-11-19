import React, { useState } from 'react';

/**
 * Mock Card payment modal.
 * Simply shows a "Processing..." button and calls the backend with payment_method='card'.
 */
export default function CardPaymentModal({ onClose, onSuccess, requestId }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    setProcessing(true);
    const mockTransactionRef = `CARD-${Date.now()}`;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/rent-requests/${requestId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'card', transaction_ref: mockTransactionRef }),
      });
      if (res.ok) onSuccess();
      else throw new Error('Payment API error');
    } catch (e) {
      setError('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Pay with Card (Mock)</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button className="req-btn" onClick={handlePay} disabled={processing}>
            {processing ? 'Processing...' : 'Pay'}
          </button>
          <button className="req-btn req-btn-cancel" onClick={onClose} disabled={processing}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
