const mongoose = require('mongoose');
require('dotenv/config');

const User = require('./src/models/Schemas/User');
const Group = require('./src/models/Schemas/Group');
const Expense = require('./src/models/Schemas/Expenses');

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected to MongoDB');

  let you = await User.findOne();
  if (!you) {
    console.log('❌ No user found. Create one via /signup first.');
    process.exit(1);
  }
  console.log('✅ Using user:', you.username, '(' + you.email + ')');

  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash('password123', 10);

  let yassine = await User.findOne({ email: 'yassine@test.com' });
  if (!yassine) {
    yassine = await User.create({
      username: 'Yassine',
      email: 'yassine@test.com',
      password: hash
    });
  }

  let omar = await User.findOne({ email: 'omar@test.com' });
  if (!omar) {
    omar = await User.create({
      username: 'Omar',
      email: 'omar@test.com',
      password: hash
    });
  }

  let hamza = await User.findOne({ email: 'hamza@test.com' });
  if (!hamza) {
    hamza = await User.create({
      username: 'Hamza',
      email: 'hamza@test.com',
      password: hash
    });
  }
  console.log('✅ Extra users ready');

  await Group.deleteMany({});
  await Expense.deleteMany({});
  console.log('🧹 Cleaned groups + expenses');

  // ⚠️ NEW SCHEMA: name, createdBy, members: [{ userId, role }]
  const gAkchour = await Group.create({
    name: 'Akchour Trip',
    description: 'رحلة تكشور',
    createdBy: you._id,
    members: [
      { userId: you._id,     role: 'owner'  },
      { userId: yassine._id, role: 'member' },
      { userId: omar._id,    role: 'member' },
      { userId: hamza._id,   role: 'member' }
    ]
  });

  const gCasa = await Group.create({
    name: 'Casa Weekend',
    description: 'ويكاند كازا',
    createdBy: you._id,
    members: [
      { userId: you._id,     role: 'owner'  },
      { userId: yassine._id, role: 'member' },
      { userId: omar._id,    role: 'member' }
    ]
  });
  console.log('✅ Groups created');

  await Expense.insertMany([
    {
      group: gAkchour._id,
      payer: yassine._id,
      participants: [you._id, yassine._id, omar._id, hamza._id],
      amount: 400,
      description: 'Food - Tagine',
      date: new Date()
    },
    {
      group: gAkchour._id,
      payer: you._id,
      participants: [you._id, yassine._id, omar._id, hamza._id],
      amount: 200,
      description: 'Transport - Taxi',
      date: new Date()
    },
    {
      group: gAkchour._id,
      payer: omar._id,
      participants: [you._id, yassine._id, omar._id, hamza._id],
      amount: 150,
      description: 'Snacks',
      date: new Date()
    },
    {
      group: gCasa._id,
      payer: you._id,
      participants: [you._id, yassine._id, omar._id],
      amount: 300,
      description: 'Dinner - Pizza',
      date: new Date()
    },
    {
      group: gCasa._id,
      payer: omar._id,
      participants: [you._id, yassine._id, omar._id],
      amount: 120,
      description: 'Coffee',
      date: new Date()
    }
  ]);
  console.log('✅ Expenses created');

  console.log('');
  console.log('===== RESULT =====');
  console.log('Users:    ' + await User.countDocuments());
  console.log('Groups:   ' + await Group.countDocuments());
  console.log('Expenses: ' + await Expense.countDocuments());
  console.log('');
  console.log('Your user:');
  console.log('   Email:    ' + you.email);
  console.log('');
  console.log('Group IDs:');
  console.log('   Akchour: ' + gAkchour._id);
  console.log('   Casa:    ' + gCasa._id);

  process.exit(0);
}

seed().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});