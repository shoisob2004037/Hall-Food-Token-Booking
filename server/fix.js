const mongoose = require("mongoose")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

const fixDatabase = async () => {
  try {
    // Get the users collection
    const usersCollection = mongoose.connection.collection("users")

    // Get all indexes
    const indexes = await usersCollection.indexes()
    console.log("Current indexes:", indexes)

    // Drop all indexes except _id
    for (const index of indexes) {
      if (index.name !== "_id_") {
        console.log(`Dropping index: ${index.name}`)
        await usersCollection.dropIndex(index.name)
      }
    }

    console.log("All indexes except _id have been dropped")

    // Recreate the necessary indexes
    console.log("Recreating necessary indexes...")
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await usersCollection.createIndex({ studentId: 1 }, { unique: true })
    await usersCollection.createIndex({ roll: 1 }, { sparse: true }) // sparse index allows null values

    console.log("Database indexes have been fixed")
    mongoose.connection.close()
  } catch (err) {
    console.error("Error fixing database:", err)
    mongoose.connection.close()
  }
}

fixDatabase()
