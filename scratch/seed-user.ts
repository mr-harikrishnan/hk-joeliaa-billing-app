import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://vasanthshakthivel007:Vasanth%402005@cluster0.p78z3.mongodb.net/joeliaa-billing?retryWrites=true&w=majority&appName=Cluster0";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = 'joeliaa@gmail.com';
    const password = 'Joeliaa@24680';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Delete existing if any to ensure clean state
    await mongoose.connection.db.collection('users').deleteOne({ email });
    
    // Insert fresh
    await mongoose.connection.db.collection('users').insertOne({
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    console.log("Admin user joeliaa@gmail.com seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
