import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const users = [
  {
    name: "Krushna Nagare",
    mobile: "9322681386",
    password: "Krushna@701",
  },
  {
    name: "Pranav Dharrao",
    mobile: "7887564035",
    password: "Pranav@701",
  },
  {
    name: "rohit khalate",
    mobile: "9359444589",
    password: "Rohit@701",
  },
  {
    name: "UtKumar Utkarsh",
    mobile: "6280537896",
    password: "Utkarsh@701",
  },
  {
    name: "Sameer Dewangan",
    mobile: "6265211448",
    password: "Sameer@701",
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.DB);

    // Prevent duplicate seeding
    await User.deleteMany();

    await User.insertMany(users);

    console.log("✅ 5 flat users created successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
