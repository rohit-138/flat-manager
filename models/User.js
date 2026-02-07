import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
    },

    password: {
      type: String,
      required: true,
      minlength: 4,
    },
  },
  { timestamps: true }
);

// Plain password comparison
UserSchema.methods.comparePassword = function (enteredPassword) {
  return enteredPassword === this.password;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
