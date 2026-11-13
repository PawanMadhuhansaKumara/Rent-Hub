const db = require('../config/db');

// Ensure reviews table exists
const initReviewsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        item_id INT NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        comment TEXT NULL,
        seller_reply TEXT NULL,
        seller_reply_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_rental_review (request_id)
      )
    `;
    await db.execute(query);
  } catch (err) {
    console.warn("Reviews table init warning:", err.message);
  }
};

initReviewsTable();

// Real notifications helper
const sendNotification = async ({
  userId,
  title,
  message,
  type = "review_received",
  itemId = null,
  requestId = null,
  imageUrl = null,
  linkUrl = null,
}) => {
  if (!userId || !title || !message) return;
  try {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, item_id, request_id, image_url, link_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
    `;
    await db.execute(query, [
      userId,
      title,
      message,
      type,
      itemId,
      requestId,
      imageUrl,
      linkUrl,
    ]);
  } catch (err) {
    console.warn("Could not send review notification:", err.message);
  }
};

// Helper to recalculate and sync seller rating
const updateSellerRatingStats = async (sellerId) => {
  try {
    const [stats] = await db.execute(
      `SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS count FROM reviews WHERE seller_id = ?`,
      [sellerId]
    );
    const avgRating = stats.length > 0 && stats[0].count > 0 ? Number(stats[0].avg_rating) : 0.00;
    await db.execute(
      `UPDATE users_details SET user_rating = ? WHERE user_id = ?`,
      [avgRating, sellerId]
    );
  } catch (statsErr) {
    console.warn("Could not update user_rating in users_details:", statsErr.message);
  }
};

// 1. CREATE REVIEW (Submit Rating and Comment)
exports.createReview = async (req, res) => {
  const {
    requestId,
    itemId,
    buyerId,
    sellerId,
    rating,
    comment = ""
  } = req.body;

  const request_id = requestId || req.body.request_id;
  const item_id = itemId || req.body.item_id;
  const buyer_id = buyerId || req.body.buyer_id;
  const seller_id = sellerId || req.body.seller_id;
  const numRating = parseFloat(rating);

  if (!request_id || !item_id || !buyer_id || !seller_id || isNaN(numRating)) {
    return res.status(400).json({
      success: false,
      message: "request_id, item_id, buyer_id, seller_id, and a valid rating are required."
    });
  }

  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1.0 and 5.0 stars."
    });
  }

  try {
    await initReviewsTable();

    // 1. Verify rental request exists
    const [requestRows] = await db.execute(
      `SELECT r.*, i.title AS item_title, i.image_url AS item_image, b.full_name AS buyer_name
       FROM rent_requests r
       LEFT JOIN items i ON r.item_id = i.id
       LEFT JOIN users_details b ON r.buyer_id = b.user_id
       WHERE r.id = ?`,
      [request_id]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found."
      });
    }

    const rental = requestRows[0];

    // 2. Check if a review already exists for this rental request
    const [existing] = await db.execute(
      `SELECT id FROM reviews WHERE request_id = ?`,
      [request_id]
    );

    if (existing.length > 0) {
      const existingId = existing[0].id;
      const trimmedComment = comment ? comment.trim() : null;
      await db.execute(
        `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?`,
        [numRating, trimmedComment, existingId]
      );
      await updateSellerRatingStats(seller_id);
      return res.status(200).json({
        success: true,
        message: "Review updated successfully!",
        reviewId: existingId,
        review: {
          id: existingId,
          requestId: request_id,
          itemId: item_id,
          buyerId: buyer_id,
          sellerId: seller_id,
          rating: numRating,
          comment: trimmedComment,
        },
      });
    }

    // 3. Insert review
    const insertQuery = `
      INSERT INTO reviews (request_id, item_id, buyer_id, seller_id, rating, comment, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.execute(insertQuery, [
      request_id,
      item_id,
      buyer_id,
      seller_id,
      numRating,
      comment ? comment.trim() : null
    ]);

    // 4. Update seller's user_rating & reviews_count in users_details
    await updateSellerRatingStats(seller_id);

    // 5. Send notification to seller
    try {
      const buyerName = rental.buyer_name || "A customer";
      const itemTitle = rental.item_title || "your item";
      await sendNotification({
        userId: seller_id,
        title: "New Review Received ⭐",
        message: `${buyerName} rated "${itemTitle}" ${numRating} stars: "${comment ? comment.substring(0, 50) : 'Great experience!'}"`,
        type: "review_received",
        itemId: item_id,
        requestId: request_id,
        imageUrl: rental.item_image,
        linkUrl: `/profile/${seller_id}`,
      });
    } catch (notifErr) {
      console.warn("Notification error:", notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      reviewId: result.insertId,
      rating: numRating,
      comment
    });

  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit review: " + error.message
    });
  }
};

// 2. GET REVIEWS FOR SELLER / SHOP (Profile page)
exports.getSellerReviews = async (req, res) => {
  const sellerId = req.params.sellerId;

  try {
    await initReviewsTable();

    // Fetch review statistics
    const [statsRows] = await db.execute(
      `SELECT 
        COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating,
        COUNT(*) AS total_reviews
       FROM reviews 
       WHERE seller_id = ?`,
      [sellerId]
    );

    // Fetch individual reviews with buyer info & item info
    const query = `
      SELECT 
        r.id,
        r.request_id AS requestId,
        r.item_id AS itemId,
        r.buyer_id AS buyerId,
        r.seller_id AS sellerId,
        r.rating,
        r.comment,
        DATE_FORMAT(r.created_at, '%Y-%m-%dT%H:%i:%s.000Z') AS createdAt,
        r.seller_reply AS sellerReply,
        DATE_FORMAT(r.seller_reply_at, '%Y-%m-%dT%H:%i:%s.000Z') AS sellerReplyAt,
        u.full_name AS buyerName,
        u.profile_pic_url AS buyerPic,
        u.nearest_city AS buyerCity,
        i.title AS itemTitle,
        i.image_url AS itemImage,
        i.price AS itemPrice,
        i.price_type AS priceType
      FROM reviews r
      LEFT JOIN users_details u ON r.buyer_id = u.user_id
      LEFT JOIN items i ON r.item_id = i.id
      WHERE r.seller_id = ?
      ORDER BY r.created_at DESC
    `;

    const [reviews] = await db.execute(query, [sellerId]);

    const avgRating = statsRows.length > 0 ? parseFloat(statsRows[0].avg_rating) : 0;
    const totalReviews = statsRows.length > 0 ? parseInt(statsRows[0].total_reviews) : 0;

    res.status(200).json({
      success: true,
      avgRating,
      totalReviews,
      reviews
    });

  } catch (error) {
    console.error("Get Seller Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller reviews: " + error.message,
      avgRating: 0,
      totalReviews: 0,
      reviews: []
    });
  }
};

// 3. GET REVIEWS FOR SPECIFIC ITEM (Item Details page)
exports.getItemReviews = async (req, res) => {
  const itemId = req.params.itemId;

  try {
    await initReviewsTable();

    const [statsRows] = await db.execute(
      `SELECT 
        COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating,
        COUNT(*) AS total_reviews
       FROM reviews 
       WHERE item_id = ?`,
      [itemId]
    );

    const query = `
      SELECT 
        r.id,
        r.request_id AS requestId,
        r.item_id AS itemId,
        r.buyer_id AS buyerId,
        r.seller_id AS sellerId,
        r.rating,
        r.comment,
        DATE_FORMAT(r.created_at, '%Y-%m-%dT%H:%i:%s.000Z') AS createdAt,
        r.seller_reply AS sellerReply,
        DATE_FORMAT(r.seller_reply_at, '%Y-%m-%dT%H:%i:%s.000Z') AS sellerReplyAt,
        u.full_name AS buyerName,
        u.profile_pic_url AS buyerPic,
        u.nearest_city AS buyerCity,
        s.full_name AS sellerName,
        s.profile_pic_url AS sellerPic
      FROM reviews r
      LEFT JOIN users_details u ON r.buyer_id = u.user_id
      LEFT JOIN users_details s ON r.seller_id = s.user_id
      WHERE r.item_id = ?
      ORDER BY r.created_at DESC
    `;

    const [reviews] = await db.execute(query, [itemId]);

    const avgRating = statsRows.length > 0 ? parseFloat(statsRows[0].avg_rating) : 0;
    const totalReviews = statsRows.length > 0 ? parseInt(statsRows[0].total_reviews) : 0;

    res.status(200).json({
      success: true,
      avgRating,
      totalReviews,
      reviews
    });

  } catch (error) {
    console.error("Get Item Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch item reviews: " + error.message,
      avgRating: 0,
      totalReviews: 0,
      reviews: []
    });
  }
};

// 4. CHECK IF A RENTAL HAS BEEN REVIEWED
exports.checkRentalReviewed = async (req, res) => {
  const requestId = req.params.requestId;

  try {
    await initReviewsTable();
    const [rows] = await db.execute(
      `SELECT id, rating, comment, created_at FROM reviews WHERE request_id = ?`,
      [requestId]
    );

    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        hasReviewed: true,
        review: rows[0]
      });
    }

    res.status(200).json({
      success: true,
      hasReviewed: false,
      review: null
    });
  } catch (error) {
    console.error("Check Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check review status."
    });
  }
};

// 5. POST / UPDATE SELLER REPLY
exports.replyReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  const { sellerId, reply } = req.body;

  if (!reviewId || !sellerId || !reply || !reply.trim()) {
    return res.status(400).json({
      success: false,
      message: "reviewId, sellerId, and a valid reply text are required."
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT r.*, i.title AS item_title, i.image_url AS item_image, s.full_name AS seller_name
       FROM reviews r
       LEFT JOIN items i ON r.item_id = i.id
       LEFT JOIN users_details s ON r.seller_id = s.user_id
       WHERE r.id = ?`,
      [reviewId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    const review = rows[0];

    // Authorization check: only the seller of this review can reply
    if (Number(review.seller_id) !== Number(sellerId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reply to this review."
      });
    }

    const trimmedReply = reply.trim();
    const updateQuery = `
      UPDATE reviews
      SET seller_reply = ?, seller_reply_at = NOW()
      WHERE id = ?
    `;
    await db.execute(updateQuery, [trimmedReply, reviewId]);

    // Send real notification to buyer
    try {
      const shopName = review.seller_name || "The shop";
      const itemTitle = review.item_title || "your rental item";
      await sendNotification({
        userId: review.buyer_id,
        title: "Shop Replied to Your Review 💬",
        message: `${shopName} replied to your review on "${itemTitle}": "${trimmedReply.substring(0, 60)}${trimmedReply.length > 60 ? '...' : ''}"`,
        type: "seller_reply",
        itemId: review.item_id,
        requestId: review.request_id,
        imageUrl: review.item_image,
        linkUrl: `/item/${review.item_id}`,
      });
    } catch (notifErr) {
      console.warn("Could not send reply notification:", notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Reply posted successfully!",
      sellerReply: trimmedReply,
      sellerReplyAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reply Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to post reply: " + error.message,
    });
  }
};

// 6. DELETE SELLER REPLY
exports.deleteReply = async (req, res) => {
  const reviewId = req.params.reviewId;
  const sellerId = req.body.sellerId || req.query.sellerId;

  if (!reviewId || !sellerId) {
    return res.status(400).json({
      success: false,
      message: "reviewId and sellerId are required."
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT seller_id FROM reviews WHERE id = ?`,
      [reviewId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (Number(rows[0].seller_id) !== Number(sellerId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this reply."
      });
    }

    await db.execute(
      `UPDATE reviews SET seller_reply = NULL, seller_reply_at = NULL WHERE id = ?`,
      [reviewId]
    );

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully."
    });
  } catch (error) {
    console.error("Delete Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete reply: " + error.message,
    });
  }
};

// 7. UPDATE REVIEW (Buyer edits their rating and comment)
exports.updateReview = async (req, res) => {
  const reviewId = req.params.id;
  const { buyerId, rating, comment = "" } = req.body;
  const buyer_id = buyerId || req.body.buyer_id;
  const numRating = parseFloat(rating);

  if (!reviewId || !buyer_id || isNaN(numRating)) {
    return res.status(400).json({
      success: false,
      message: "reviewId, buyerId, and a valid rating are required."
    });
  }

  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1.0 and 5.0 stars."
    });
  }

  try {
    let [rows] = await db.execute(`SELECT * FROM reviews WHERE id = ?`, [reviewId]);
    if (rows.length === 0) {
      // Fallback: check if the reviewId was passed as request_id
      [rows] = await db.execute(`SELECT * FROM reviews WHERE request_id = ?`, [reviewId]);
    }
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    const review = rows[0];
    const actualReviewId = review.id;
    if (Number(review.buyer_id) !== Number(buyer_id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this review."
      });
    }

    const trimmedComment = comment ? comment.trim() : null;
    await db.execute(
      `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?`,
      [numRating, trimmedComment, actualReviewId]
    );

    // Recalculate seller stats
    await updateSellerRatingStats(review.seller_id);

    res.status(200).json({
      success: true,
      message: "Review updated successfully!",
      reviewId: Number(actualReviewId),
      rating: numRating,
      comment: trimmedComment,
    });
  } catch (error) {
    console.error("Update Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review: " + error.message,
    });
  }
};

// 8. DELETE REVIEW (Buyer deletes their review)
exports.deleteReview = async (req, res) => {
  const reviewId = req.params.id;
  const buyerId = req.body?.buyerId || req.query?.buyerId;

  if (!reviewId || !buyerId) {
    return res.status(400).json({
      success: false,
      message: "reviewId and buyerId are required."
    });
  }

  try {
    let [rows] = await db.execute(`SELECT * FROM reviews WHERE id = ?`, [reviewId]);
    if (rows.length === 0) {
      [rows] = await db.execute(`SELECT * FROM reviews WHERE request_id = ?`, [reviewId]);
    }
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    const review = rows[0];
    const actualReviewId = review.id;
    if (Number(review.buyer_id) !== Number(buyerId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review."
      });
    }

    await db.execute(`DELETE FROM reviews WHERE id = ?`, [actualReviewId]);

    // Recalculate seller stats
    await updateSellerRatingStats(review.seller_id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
      reviewId: Number(actualReviewId),
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review: " + error.message,
    });
  }
};
