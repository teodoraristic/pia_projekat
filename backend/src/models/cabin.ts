import mongoose from "mongoose";

const Schema = mongoose.Schema;

let Cabin = new Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  services: [{
    type: String
  }],
  priceSummer: {
    type: Number,
    required: true
  },
  priceWinter: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  images: [{
    type: String
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'UserModel',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedUntil: {
    type: Date
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
    lastThreeRatings: [{
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: 'ReservationModel'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("CabinModel", Cabin, "cabins");