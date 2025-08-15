import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["student", "hr", "company", "admin"], default: "student" },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export default models.User || model("User", UserSchema);
