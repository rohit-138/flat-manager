import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // names match GPay creator exactly
    },
password: {
      type: String,
      required: true,
      minlength: 4,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔑 NEW FIELD
    last_uploaded_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
