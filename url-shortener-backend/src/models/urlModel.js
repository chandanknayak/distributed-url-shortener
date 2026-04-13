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
    customAlias: {
      type: String,
      unique: true,
      sparse: true // Allows multiple null/undefined values but enforces uniqueness for actual strings
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // Optional, so anonymous users can still generate links if we allow it somewhere
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