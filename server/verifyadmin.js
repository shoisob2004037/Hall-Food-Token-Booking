const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for verification"))
  .catch((err) => console.error("MongoDB connection error:", err))

const verifyAdmin = async () => {
  try {
    // Get the users collection directly to bypass any model middleware
    const usersCollection = mongoose.connection.collection("users")

    // Find the admin user
    const admin = await usersCollection.findOne({ email: "admin@university.edu" })

    if (!admin) {
      console.log("Admin user not found!")
      mongoose.connection.close()
      return
    }

    console.log("Admin user found:", {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      studentId: admin.studentId,
      isAdmin: admin.isAdmin,
      passwordLength: admin.password ? admin.password.length : 0,
    })

    // Create a new hashed password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("admin123", salt)

    // Update the admin password directly in the database
    await usersCollection.updateOne({ email: "admin@university.edu" }, { $set: { password: hashedPassword } })

    console.log("Admin password has been reset to 'admin123'")
    console.log("Please try logging in again with these credentials")

    mongoose.connection.close()
  } catch (err) {
    console.error("Error verifying admin:", err)
    mongoose.connection.close()
  }
}

verifyAdmin()
