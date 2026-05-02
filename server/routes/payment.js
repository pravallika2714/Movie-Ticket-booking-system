import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/authMiddleware.js';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

const router = express.Router();

// Initialize Razorpay conditionally (to avoid crashes if keys are not set initially)
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured in environment variables.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Route: POST /api/payment/create-order
// Desc: Create a Razorpay order and a pending booking
router.post('/create-order', protect, async (req, res) => {
  try {
    const { showId, seats, amount } = req.body;

    if (!showId || !seats || !seats.length || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required booking details' });
    }

    const show = await Show.findById(showId).populate('movie').populate('theater');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Check if seats are already booked
    const alreadyBooked = seats.some((seat) => show.bookedSeats.includes(seat));
    if (alreadyBooked) {
      return res.status(400).json({ success: false, message: 'One or more selected seats are already booked' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id';
    const isMockMode = keyId === 'your_razorpay_key_id' || !process.env.RAZORPAY_KEY_SECRET;

    let orderId = `order_mock_${Date.now()}`;
    let order = { id: orderId, amount: parseInt(amount) * 100, currency: 'INR' };

    if (!isMockMode) {
      const razorpay = getRazorpayInstance();
      const options = {
        amount: parseInt(amount) * 100, // Amount is in currency subunits (paise)
        currency: 'INR',
        receipt: `rcpt_${req.user.id.slice(-4)}_${Date.now().toString().slice(-8)}`,
      };
      order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // Create pending booking in database
    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      showSnapshot: {
        movieTitle: show.movie?.title,
        moviePoster: show.movie?.poster,
        movieFormat: show.movie?.format,
        movieLanguage: show.movie?.language,
        theaterName: show.theater?.name,
        theaterLocation: show.theater?.location,
        showDate: show.showDate,
        showTime: show.showTime
      },
      seats: seats,
      amount: amount,
      status: 'pending',
      razorpayOrderId: orderId,
      bookingCode: 'BKG' + crypto.randomBytes(3).toString('hex').toUpperCase() + Date.now().toString().slice(-4),
    });

    // Mark seats as 'payment_locked' in memory cache
    if (global.lockedSeats) {
      let showLocks = global.lockedSeats.get(showId);
      if (!showLocks) {
        showLocks = new Map();
        global.lockedSeats.set(showId, showLocks);
      }
      seats.forEach(seatId => {
        showLocks.set(seatId, { socketId: 'api', status: 'payment_locked', timestamp: Date.now() });
      });
    }

    res.json({
      success: true,
      order,
      bookingId: booking._id,
      keyId, 
      isMockMode
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

// Route: POST /api/payment/verify
// Desc: Verify payment signature, confirm booking, and lock seats
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, message: 'Missing payment signature details' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id';
    const isMockMode = keyId === 'your_razorpay_key_id' || !process.env.RAZORPAY_KEY_SECRET;

    let isAuthentic = false;

    if (isMockMode) {
       // Auto-succeed in mock mode
       isAuthentic = true;
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
      // 1. Update Booking Status
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking record not found' });
      }

      booking.status = 'confirmed';
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpaySignature = razorpay_signature;
      await booking.save();

      // 2. Lock the seats in the Show model
      const show = await Show.findById(booking.show);
      if (show) {
        // Prevent duplicate appending
        const newSeats = booking.seats.filter(seat => !show.bookedSeats.includes(seat));
        show.bookedSeats.push(...newSeats);
        await show.save();
      }

      res.json({ success: true, bookingId: booking._id, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed (Invalid Signature)',
      });
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Route: GET /api/payment/my-bookings
// Desc: Get all bookings for the logged-in user
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id, status: 'confirmed' })
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title format language poster' },
          { path: 'theater', select: 'name location' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
