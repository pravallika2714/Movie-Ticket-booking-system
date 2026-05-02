import express from 'express';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const parseList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeMoviePayload = (body) => ({
  title: body.title,
  description: body.description,
  duration: Number(body.duration),
  genre: parseList(body.genre),
  language: body.language || 'English',
  rating: body.rating === '' || body.rating == null ? 0 : Number(body.rating),
  poster: body.poster || '',
  trailer: body.trailer || '',
  releaseDate: body.releaseDate || undefined,
  director: body.director || '',
  cast: Array.isArray(body.cast) ? body.cast : [],
  status: body.status || 'now_showing',
  isActive: body.isActive === false || body.isActive === 'false' ? false : true,
});

const normalizeTheaterPayload = (body) => {
  return {
    name: body.name,
    location: body.location,
    layoutConfig: Array.isArray(body.layoutConfig) ? body.layoutConfig : [],
    prices: {
      standard: Number(body.standardPrice ?? body.standard ?? 150),
      premium: Number(body.premiumPrice ?? body.premium ?? 250),
      recliner: Number(body.reclinerPrice ?? body.recliner ?? 400),
    },
    isActive: body.isActive === false || body.isActive === 'false' ? false : true,
  };
};

router.use(protect, adminOnly);

router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load movies' });
  }
});

router.post('/movies', async (req, res) => {
  try {
    const movie = await Movie.create(normalizeMoviePayload(req.body));
    res.status(201).json({ success: true, movie });
  } catch (error) {
    console.error("Movie Validation Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      normalizeMoviePayload(req.body),
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({ success: true, movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/theaters', async (req, res) => {
  try {
    const theaters = await Theater.find().sort({ createdAt: -1 });
    res.json({ success: true, theaters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load theaters' });
  }
});

router.post('/theaters', async (req, res) => {
  try {
    const theater = await Theater.create(normalizeTheaterPayload(req.body));
    res.status(201).json({ success: true, theater });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/theaters/:id', async (req, res) => {
  try {
    const theater = await Theater.findByIdAndUpdate(
      req.params.id,
      normalizeTheaterPayload(req.body),
      { new: true, runValidators: true }
    );

    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }

    res.json({ success: true, theater });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/theaters/:id', async (req, res) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }
    res.json({ success: true, message: 'Theater deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/shows', async (req, res) => {
  try {
    const shows = await Show.find()
      .populate('movie', 'title')
      .populate('theater', 'name location')
      .sort({ showDate: -1, showTime: -1 });
    res.json({ success: true, shows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load shows' });
  }
});

router.post('/shows', async (req, res) => {
  try {
    const { movie, theater, showDate, showTime } = req.body;
    if (!movie || !theater || !showDate || !showTime) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const show = await Show.create({ movie, theater, showDate, showTime });
    await show.populate('movie', 'title');
    await show.populate('theater', 'name');
    res.status(201).json({ success: true, show });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/shows/:id', async (req, res) => {
  try {
    const { movie, theater, showDate, showTime } = req.body;
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      { movie, theater, showDate, showTime },
      { new: true, runValidators: true }
    )
    .populate('movie', 'title')
    .populate('theater', 'name');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.json({ success: true, show });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/shows/:id', async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.json({ success: true, message: 'Show deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
