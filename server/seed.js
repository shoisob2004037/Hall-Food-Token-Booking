const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("./models/User")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err))

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@university.edu" })

    if (adminExists) {
      console.log("Admin user already exists")
      mongoose.connection.close()
      return
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("admin123", salt)

    const admin = new User({
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      studentId: "ADMIN001",
      roll: "ADMIN001",
      balance: 1000,
      isAdmin: true,
    })

    await admin.save()
    console.log("Admin user created successfully")
    mongoose.connection.close()
  } catch (err) {
    console.error("Error creating admin:", err)
    mongoose.connection.close()
  }
}

createAdmin()
