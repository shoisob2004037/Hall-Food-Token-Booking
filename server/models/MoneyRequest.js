const mongoose = require("mongoose")

const moneyRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad"],
      required: true,
    },
    paymentNumber: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
    paymentPhotoUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

const MoneyRequest = mongoose.models.MoneyRequest || mongoose.model("MoneyRequest", moneyRequestSchema)

module.exports = MoneyRequest
