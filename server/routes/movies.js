import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

// Get all active movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movies' });
  }
});

// Get single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, isActive: true });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, movie });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movie' });
  }
});

export default router;
