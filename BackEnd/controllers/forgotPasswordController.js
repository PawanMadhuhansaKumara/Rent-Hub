const bcrypt = require('bcrypt');
const db = require('../config/db');
const { twilioClient, formatE164Number, formatWhatsAppNumber } = require('../utils/twilio');

// 1. SEND OTP TO PHONE (SMS & WHATSAPP)
exports.sendOtp = async (req, res) => {
  const { phone_no } = req.body;

  if (!phone_no || !phone_no.trim()) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }

  const cleanPhone = phone_no.trim();

  try {
    // 1. Verify user exists with this phone number
    const [userRows] = await db.execute(
      'SELECT user_id, full_name, phone_no FROM users_details WHERE phone_no = ?',
      [cleanPhone]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this phone number.'
      });
    }

    // 2. Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Expiration time: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Invalidate any previous unused OTPs for this phone number
    await db.execute(
      'UPDATE password_resets SET is_used = TRUE WHERE phone_no = ? AND is_used = FALSE',
      [cleanPhone]
    );

    // 5. Save OTP to database
    await db.execute(
      'INSERT INTO password_resets (phone_no, otp_code, expires_at) VALUES (?, ?, ?)',
      [cleanPhone, otpCode, expiresAt]
    );

    let sentViaSms = false;
    let sentViaWhatsApp = false;
    const formattedPhone = formatE164Number(cleanPhone);

    // 6. Send standard SMS text message directly to the phone number if TWILIO_PHONE_NUMBER is configured
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
          body: `Rent-Hub Verification Code: ${otpCode}. Valid for 10 minutes. Do not share this code.`
        });
        sentViaSms = true;
        console.log(`📩 SMS OTP sent successfully to ${formattedPhone}`);
      } catch (smsErr) {
        console.error('❌ Twilio SMS Error:', smsErr.message);
      }
    }

    // 7. Also send via WhatsApp if TWILIO_WHATSAPP_NUMBER is configured
    if (twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: formatWhatsAppNumber(cleanPhone),
          body: `Rent-Hub Verification Code: *${otpCode}*\n\nThis code is valid for 10 minutes. Do not share this code with anyone.`
        });
        sentViaWhatsApp = true;
        console.log(`📲 WhatsApp OTP sent successfully to ${cleanPhone}`);
      } catch (twErr) {
        console.error('❌ Twilio WhatsApp Error:', twErr.message);
      }
    }

    // Always log OTP to server console for testing/development
    console.log(`🔑 [DEV CONSOLE OTP] For Phone ${cleanPhone} (${formattedPhone}) -> OTP: ${otpCode}`);

    let userNotice = 'Verification code generated! (Dev Mode: Check backend console)';
    if (sentViaSms && sentViaWhatsApp) {
      userNotice = 'Verification code sent to your Phone (SMS) and WhatsApp.';
    } else if (sentViaSms) {
      userNotice = 'Verification code sent via SMS to your phone.';
    } else if (sentViaWhatsApp) {
      userNotice = 'Verification code sent to your WhatsApp number.';
    }

    res.status(200).json({
      success: true,
      sentViaSms,
      sentViaWhatsApp,
      message: userNotice
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending OTP.' });
  }
};

// 2. VERIFY OTP
exports.verifyOtp = async (req, res) => {
  const { phone_no, otp_code } = req.body;

  if (!phone_no || !otp_code) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP code are required.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, expires_at, is_used FROM password_resets WHERE phone_no = ? AND otp_code = ? AND is_used = FALSE ORDER BY id DESC LIMIT 1',
      [phone_no.trim(), otp_code.trim()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This code has expired. Please request a new one.' });
    }

    res.status(200).json({ success: true, message: 'Code verified successfully.' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
};

// 3. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { phone_no, otp_code, new_password } = req.body;

  if (!phone_no || !otp_code || !new_password) {
    return res.status(400).json({ success: false, message: 'Phone number, OTP code, and new password are required.' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  try {
    const [otpRows] = await db.execute(
      'SELECT id, expires_at, is_used FROM password_resets WHERE phone_no = ? AND otp_code = ? AND is_used = FALSE ORDER BY id DESC LIMIT 1',
      [phone_no.trim(), otp_code.trim()]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    if (new Date(otpRows[0].expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This code has expired. Please request a new one.' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    await db.execute(
      'UPDATE users_details SET password_hash = ? WHERE phone_no = ?',
      [password_hash, phone_no.trim()]
    );

    await db.execute(
      'UPDATE password_resets SET is_used = TRUE WHERE id = ?',
      [otpRows[0].id]
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error while resetting password.' });
  }
};
