import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, maxLength: 2047 },
  email: { type: String, required: true, maxLength: 2047 },
  phone: { type: Number, required: true, maxLength: 10 },
  password: { type: String, required: true, maxLength: 2047 },
  visitHistory: { type: Array, required: true, maxLength: 2047 },
  preferredKeyword: { type: Array, required: true, maxLength: 2047 },
});

export const User = mongoose.model("users", userSchema);
