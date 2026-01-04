import mongoose from "mongoose";

const Schema = mongoose.Schema;

let Reservation = new Schema({
  cabinId: {
    type: Schema.Types.ObjectId,
    ref: 'CabinModel',
    required: true
  },
  touristId: {
    type: Schema.Types.ObjectId,
    ref: 'UserModel',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  adults: {
    type: Number,
    required: true,
    min: 1
  },
  children: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  additionalRequests: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
    ownerComment: { 
    type: String,
    maxlength: 500
  }
});

export default mongoose.model("ReservationModel", Reservation, "reservations");