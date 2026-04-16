import dbConnect from '../lib/db';
import User from '../models/User';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  await dbConnect();
  
  const existingUser = await User.findOne({ email: 'admin@joeliaa.com' });
  if (existingUser) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = new User({
    email: 'admin@joeliaa.com',
    password: hashedPassword,
    name: 'Joeliaa Admin',
  });

  await admin.save();
  console.log('Admin user seeded successfully');
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
