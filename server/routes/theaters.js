import express from 'express';
import Theater from '../models/Theater.js';

const router = express.Router();

router.get('/active', async (req, res) => {
  try {
    const theater = await Theater.findOne({ isActive: true }).sort({ updatedAt: -1, createdAt: -1 });

    if (!theater) {
      return res.json({
        success: true,
        theater: {
          name: 'Default Hall',
          location: 'Main Complex',
          totalRows: 8,
          leftSeats: 5,
          rightSeats: 5,
          aisleGap: 2,
          recliners: 2,
          premiumRows: 3,
          seatsPerRow: 10,
        },
      });
    }

    res.json({ success: true, theater });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load theater layout' });
  }
});

export default router;
