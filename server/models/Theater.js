import mongoose from 'mongoose';

const pricesSchema = new mongoose.Schema(
  {
    standard: { type: Number, default: 150, min: [0, 'Standard price cannot be negative'] },
    premium: { type: Number, default: 250, min: [0, 'Premium price cannot be negative'] },
    recliner: { type: Number, default: 400, min: [0, 'Recliner price cannot be negative'] },
  },
  { _id: false }
);

const rowSchema = new mongoose.Schema(
  {
    rowLabel: { type: String, required: true },
    leftSeats: { type: Number, required: true, min: 0 },
    rightSeats: { type: Number, required: true, min: 0 },
    aisleGap: { type: Number, default: 2, min: 0 },
    tier: { type: String, enum: ['standard', 'premium', 'recliner'], default: 'standard' },
  },
  { _id: false }
);

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true,
      maxlength: [120, 'Theater name cannot exceed 120 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [220, 'Location cannot exceed 220 characters'],
    },
    layoutConfig: {
      type: [rowSchema],
      default: [],
    },
    prices: {
      type: pricesSchema,
      default: () => ({ standard: 150, premium: 250, recliner: 400 }),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// No longer pre-calculating simple seatsPerRow since each row can be different.

const Theater = mongoose.model('Theater', theaterSchema);
export default Theater;
