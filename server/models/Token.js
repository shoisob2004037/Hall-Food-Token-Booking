const mongoose = require("mongoose")

const TokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  lunch: {
    type: Boolean,
    default: false,
  },
  dinner: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create a compound index to ensure a user can only have one token per date
TokenSchema.index({ user: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Token", TokenSchema)
