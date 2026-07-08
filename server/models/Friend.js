const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, { timestamps: true });

// Prevent duplicate requests between the same two users
friendSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model('Friend', friendSchema);
