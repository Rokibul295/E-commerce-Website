const mongoose = require('mongoose');
<<<<<<< HEAD
=======
const bcrypt = require('bcryptjs');
>>>>>>> origin/main

const userSchema = new mongoose.Schema({
  name: {
    type: String,
<<<<<<< HEAD
    required: true
=======
    required: true,
    trim: true
>>>>>>> origin/main
  },
  email: {
    type: String,
    required: true,
<<<<<<< HEAD
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['seller', 'buyer', 'admin'],
    default: 'seller'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'deactivated'],
    default: 'pending'
=======
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
>>>>>>> origin/main
  }
}, {
  timestamps: true
});

<<<<<<< HEAD
=======
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

>>>>>>> origin/main
module.exports = mongoose.model('User', userSchema);

