const express = require('express');
const router = express.Router();

// NOTE: ඔබේ index.js එකේ db connection එක export කර ඇති ආකාරයට මෙහි require කරගන්න.
// උදාහරණයක් ලෙස: const db = require('../index'); හෝ const db = require('../config/db');
const db = require('../index'); 

// RENT REQUEST COMPLETE / ITEM RETURNED ROUTE (Percentage-based)
router.put('/rent-requests/:id/complete', async (req, res) => {
  const requestId = req.params.id;

  try {
    // 1. Rent request එක සහ buyer ගේ විස්තර සෙවීම
    const [reqs] = await db.execute('SELECT * FROM rent_requests WHERE id = ?', [requestId]);
    if (reqs.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const rentReq = reqs[0];
    const buyerId = rentReq.buyer_id || rentReq.buyerId;

    // 2. Request status එක Completed ලෙස වෙනස් කිරීම
    await db.execute('UPDATE rent_requests SET status = "Completed" WHERE id = ?', [requestId]);

    // 3. User ගේ වත්මන් Trust Score සහ Rental Limit ලබා ගැනීම
    const [users] = await db.execute('SELECT trust_score, rental_limit FROM users_details WHERE user_id = ?', [buyerId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User details not found' });
    }

    const user = users[0];
    const currentScore = Number(user.trust_score || 1);
    const currentLimit = Number(user.rental_limit || 1000.00);

    // 4. ප්‍රතිශතය අනුව අලුත් සීමාව ගණනය කිරීම (උදා: සෑම සාර්ථක රෙන්ට් එකකටම +25% ක වැඩිවීමක්)
    const percentageIncrease = 0.25; // 25%
    const newLimit = currentLimit + (currentLimit * percentageIncrease);
    const newScore = currentScore + 1;

    // 5. Database එක Update කිරීම
    await db.execute(
      'UPDATE users_details SET trust_score = ?, rental_limit = ? WHERE user_id = ?',
      [newScore, newLimit, buyerId]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Rental completed successfully! Trust score & limit updated.',
      new_trust_score: newScore,
      new_rental_limit: newLimit 
    });
  } catch (error) {
    console.error('Complete Rental Error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;