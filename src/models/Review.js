import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profession: { type: String, required: true },
    comment: { type: String, required: true },
    contact: { type: String, required: true }, // Mobile or Email (Private)
    rating: { type: Number, required: true, min: 1, max: 5 },
    isApproved: { type: Boolean, default: true }, // Auto-approve for now
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);