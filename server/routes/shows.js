import express from 'express';
import Show from '../models/Show.js';

const router = express.Router();

// Get shows with optional filters
router.get('/', async (req, res) => {
  try {
    const { movieId, theaterId } = req.query;
    const filter = { isActive: true };
    if (movieId) filter.movie = movieId;
    if (theaterId) filter.theater = theaterId;

    const shows = await Show.find(filter)
      .populate('movie')
      .populate('theater')
      .sort({ showDate: 1, showTime: 1 });

    res.json({ success: true, shows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load shows' });
  }
});

// Get single show by ID
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theater');
      
    if (!show || !show.isActive) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.json({ success: true, show });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch show details' });
  }
});

export default router;
