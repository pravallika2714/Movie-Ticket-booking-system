import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1200, 'Description cannot exceed 1200 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    genre: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [10, 'Rating cannot exceed 10'],
    },
    poster: {
      type: String,
      default: '',
      trim: true,
    },
    trailer: {
      type: String,
      default: '',
      trim: true,
    },
    releaseDate: {
      type: Date,
    },
    director: {
      type: String,
      default: '',
      trim: true,
    },
    cast: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'ended'],
      default: 'now_showing',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
