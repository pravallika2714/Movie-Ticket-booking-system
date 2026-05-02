import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater reference is required'],
    },
    showDate: {
      type: Date,
      required: [true, 'Show date is required'],
    },
    showTime: {
      type: String,
      required: [true, 'Show time is required (e.g., 10:30 AM)'],
      trim: true,
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
    expireAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// TTL Index to automatically delete the show document when the 'expireAt' date is reached
showSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save hook to calculate expireAt based on showDate and showTime
showSchema.pre('save', function (next) {
  if (this.isModified('showDate') || this.isModified('showTime')) {
    try {
      // Create date from the stored showDate
      const expireDate = new Date(this.showDate);
      
      // showTime is expected as "HH:mm" (e.g. "11:50" or "09:30")
      if (this.showTime && this.showTime.includes(':')) {
        const [hours, minutes] = this.showTime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          expireDate.setHours(hours, minutes, 0, 0);
          this.expireAt = expireDate;
        }
      }
    } catch (err) {
      console.error('Failed to calculate expireAt:', err);
    }
  }
  next();
});

const Show = mongoose.model('Show', showSchema);
export default Show;
