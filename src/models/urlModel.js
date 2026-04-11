import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    longUrl: {
      type: String,
      required: true
    },

    clickCount: {
      type: Number,
      default: 0
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    expiresAt: {
      type: Date
    }
  }
);

export default mongoose.model("Url", urlSchema);