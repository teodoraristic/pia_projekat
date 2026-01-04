import mongoose from "mongoose";

const Schema = mongoose.Schema;

let User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['M', 'Ž'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: 'assets/default-profile.png'
  },
  creditCard: {
    type: String
  },
  role: {
    type: String,
    enum: ['tourist', 'owner', 'admin'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  registrationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("UserModel", User, "users");