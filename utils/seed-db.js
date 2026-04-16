// ============================================================
// JOELIAA Billing App — Standalone Database Seeder
// Run: node utils/seed-db.js
// ============================================================

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// ── Schemas ──────────────────────────────────────────────────

const MenuItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    unit:     { type: String, default: 'pcs' },
    image:    { type: String },
    available:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
const User     = mongoose.models.User     || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// ── Seed Data (from JOELIAA menu flyer) ─────────────────────

const menuItems = [
  // Traditional Sweets
  { name: 'Ulunthu Laddu (4 pcs)',       category: 'Traditional Sweets',  price: 50,  unit: 'box', available: true },
  { name: 'Pacha Payaru Laddu (4 pcs)',  category: 'Traditional Sweets',  price: 50,  unit: 'box', available: true },
  { name: 'Verkadalai Laddu (4 pcs)',    category: 'Traditional Sweets',  price: 50,  unit: 'box', available: true },
  { name: 'Sweet Paniyaram (6 pcs)',     category: 'Traditional Sweets',  price: 55,  unit: 'box', available: true },
  // Chocolate Specials
  { name: 'Chocolate Grapes (5 pcs)',                        category: 'Chocolate Specials', price: 45, unit: 'box', available: true },
  { name: 'Pomegranate Candy (3 pcs)',                       category: 'Chocolate Specials', price: 60, unit: 'box', available: true },
  { name: 'Chocolate Mini Bar - Seeds & Nuts (4 pcs)',       category: 'Chocolate Specials', price: 55, unit: 'box', available: true },
  { name: 'Nutri Mini Choco Bar (4 pcs)',                    category: 'Chocolate Specials', price: 50, unit: 'box', available: true },
  // Ragi Brownies
  { name: 'Ragi Brownie Plain - Mini',                                    category: 'Ragi Brownies', price: 50, unit: 'pcs', available: true },
  { name: 'Ragi Brownie with Nuts & Thenga Thuruval',                     category: 'Ragi Brownies', price: 70, unit: 'pcs', available: true },
  { name: 'Ragi Brownie with White Chocolate',                            category: 'Ragi Brownies', price: 70, unit: 'pcs', available: true },
  { name: 'Ragi Brownie with Dark Chocolate',                             category: 'Ragi Brownies', price: 60, unit: 'pcs', available: true },
  { name: 'Ragi Brownie with Milk Chocolate',                             category: 'Ragi Brownies', price: 60, unit: 'pcs', available: true },
  { name: 'Triple Chocolate Ragi Brownie (White, Milk, Dark)',            category: 'Ragi Brownies', price: 80, unit: 'pcs', available: true },
  { name: 'Perk Stuffed Ragi Brownie',                                    category: 'Ragi Brownies', price: 70, unit: 'pcs', available: true },
  { name: 'KitKat Stuffed Ragi Brownie',                                  category: 'Ragi Brownies', price: 70, unit: 'pcs', available: true },
  // Cake Specials
  { name: 'Rose Milk Tres Leches Cake', category: 'Cake Specials', price: 70, unit: 'box', available: true },
  { name: 'Milk Tres Leches Cake',      category: 'Cake Specials', price: 70, unit: 'box', available: true },
];

const categories = [
  { name: 'Traditional Sweets', order: 1 },
  { name: 'Chocolate Specials', order: 2 },
  { name: 'Ragi Brownies',       order: 3 },
  { name: 'Cake Specials',       order: 4 },
];

const adminUser = {
  email: 'joeliaa@gmail.com',
  password: 'Joeliaa@24680',
};

// ── Main Seeder ───────────────────────────────────────────────

async function seed() {
  console.log('\n🔌 Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('✅ MongoDB Connection Successful!\n');

    // Clear existing collections
    console.log('🗑️  Clearing existing data...');
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    console.log('   → Collections cleared.\n');

    // Seed Categories
    console.log('📂 Seeding categories...');
    await Category.insertMany(categories);
    console.log(`   → ${categories.length} categories inserted.\n`);

    // Seed Menu Items
    console.log('🍬 Seeding menu items...');
    await MenuItem.insertMany(menuItems);
    console.log(`   → ${menuItems.length} menu items inserted.\n`);

    // Seed Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    await User.create({ email: adminUser.email, password: hashedPassword });
    console.log(`   → Admin user created: ${adminUser.email}\n`);

    console.log('🎉 Database seeded successfully!');
    console.log('━'.repeat(40));
    console.log(`  Email    : ${adminUser.email}`);
    console.log(`  Password : ${adminUser.password}`);
    console.log(`  Menu Items: ${menuItems.length}`);
    console.log(`  Categories: ${categories.length}`);
    console.log('━'.repeat(40));
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB Disconnected. Done!');
  }
}

seed();
