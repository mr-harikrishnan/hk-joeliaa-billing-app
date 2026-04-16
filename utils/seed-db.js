// ============================================================
// JOELIAA Billing App — Standalone Database Seeder (v2: Category IDs)
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

const CategorySchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const MenuItemSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
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

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
const User     = mongoose.models.User     || mongoose.model('User', UserSchema);

// ── Raw Data ─────────────────────

const rawCategories = [
  { name: 'Traditional Sweets', order: 1 },
  { name: 'Chocolate Specials', order: 2 },
  { name: 'Ragi Brownies',       order: 3 },
  { name: 'Cake Specials',       order: 4 },
];

const rawMenuItems = [
  // Traditional Sweets
  { name: 'Ulunthu Laddu (4 pcs)',       categoryName: 'Traditional Sweets',  price: 50,  unit: 'box' },
  { name: 'Pacha Payaru Laddu (4 pcs)',  categoryName: 'Traditional Sweets',  price: 50,  unit: 'box' },
  { name: 'Verkadalai Laddu (4 pcs)',    categoryName: 'Traditional Sweets',  price: 50,  unit: 'box' },
  { name: 'Sweet Paniyaram (6 pcs)',     categoryName: 'Traditional Sweets',  price: 55,  unit: 'box' },
  
  // Chocolate Specials
  { name: 'Chocolate Grapes (5 pcs)',                        categoryName: 'Chocolate Specials', price: 45, unit: 'box' },
  { name: 'Pomegranate Candy (3 pcs)',                       categoryName: 'Chocolate Specials', price: 60, unit: 'box' },
  { name: 'Chocolate Mini Bar - Seeds & Nuts (4 pcs)',       categoryName: 'Chocolate Specials', price: 55, unit: 'box' },
  { name: 'Nutri Mini Choco Bar (4 pcs)',                    categoryName: 'Chocolate Specials', price: 50, unit: 'box' },
  
  // Ragi Brownies
  { name: 'Ragi Brownie Plain - Mini',                                    categoryName: 'Ragi Brownies', price: 50, unit: 'pcs' },
  { name: 'Ragi Brownie with Nuts & Thenga Thuruval',                     categoryName: 'Ragi Brownies', price: 70, unit: 'pcs' },
  { name: 'Ragi Brownie with White Chocolate',                            categoryName: 'Ragi Brownies', price: 70, unit: 'pcs' },
  { name: 'Ragi Brownie with Dark Chocolate',                             categoryName: 'Ragi Brownies', price: 60, unit: 'pcs' },
  { name: 'Ragi Brownie with Milk Chocolate',                             categoryName: 'Ragi Brownies', price: 60, unit: 'pcs' },
  { name: 'Triple Chocolate Ragi Brownie (White, Milk, Dark)',            categoryName: 'Ragi Brownies', price: 80, unit: 'pcs' },
  { name: 'Perk Stuffed Ragi Brownie',                                    categoryName: 'Ragi Brownies', price: 70, unit: 'pcs' },
  { name: 'KitKat Stuffed Ragi Brownie',                                  categoryName: 'Ragi Brownies', price: 70, unit: 'pcs' },
  
  // Cake Specials
  { name: 'Rose Milk Tres Leches Cake', categoryName: 'Cake Specials', price: 70, unit: 'box' },
  { name: 'Milk Tres Leches Cake',      categoryName: 'Cake Specials', price: 70, unit: 'box' },
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

    // 1. Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      MenuItem.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
    ]);
    console.log('   → Collections cleared.\n');

    // 2. Seed Categories
    console.log('📂 Seeding categories...');
    const createdCategories = await Category.insertMany(rawCategories);
    console.log(`   → ${createdCategories.length} categories inserted.\n`);

    // 3. Create Name-to-ID Map
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // 4. Map Menu Items to Category IDs
    console.log('🍬 Seeding menu items with Category IDs...');
    const mappedMenuItems = rawMenuItems.map(item => ({
      name: item.name,
      price: item.price,
      unit: item.unit,
      category: categoryMap[item.categoryName],
      available: true
    }));

    await MenuItem.insertMany(mappedMenuItems);
    console.log(`   → ${mappedMenuItems.length} menu items inserted.\n`);

    // 5. Seed Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    await User.create({ email: adminUser.email, password: hashedPassword });
    console.log(`   → Admin user created: ${adminUser.email}\n`);

    console.log('🎉 Database seeded successfully with ID-based linking!');
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB Disconnected. Done!');
  }
}

seed();
