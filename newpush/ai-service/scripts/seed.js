require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Group = require('../src/models/Group');
const Expense = require('../src/models/Expense');
const Settlement = require('../src/models/Settlement');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/splitwise';

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected');

  // 1) نظّف كل شيء
  console.log('🧹 Clearing old data...');
  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    Expense.deleteMany({}),
    Settlement.deleteMany({})
  ]);

  // 2) المستخدمون (نفس mockData: 1-10)
  console.log('👥 Creating users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await User.insertMany([
    { username: 'أحمد',  email: 'ahmed@test.com',  password: passwordHash },
    { username: 'ليلى',  email: 'laila@test.com',  password: passwordHash },
    { username: 'محمد',  email: 'mohamed@test.com', password: passwordHash },
    { username: 'سارة',  email: 'sara@test.com',   password: passwordHash },
    { username: 'يوسف',  email: 'youssef@test.com', password: passwordHash },
    { username: 'كريم',  email: 'karim@test.com',  password: passwordHash },
    { username: 'ندى',   email: 'nada@test.com',   password: passwordHash },
    { username: 'عمر',   email: 'omar@test.com',   password: passwordHash },
    { username: 'فاطمة', email: 'fatima@test.com', password: passwordHash },
    { username: 'يوسف2', email: 'youssef2@test.com', password: passwordHash }
  ]);

  const [ahmed, laila, mohamed, sara, youssef, karim, nada, omar, fatima, youssef2] = users;

  // مستخدمون إضافيون (أعضاء في المجموعات)
  const extras = await User.insertMany([
    { username: 'مريم',  email: 'mariam@test.com',  password: passwordHash },
    { username: 'خالد',  email: 'khaled@test.com',  password: passwordHash },
    { username: 'هاجر',  email: 'hajar@test.com',   password: passwordHash },
    { username: 'سلمى',  email: 'salma@test.com',   password: passwordHash },
    { username: 'أمين',  email: 'amine@test.com',   password: passwordHash },
    { username: 'ياسين', email: 'yassine@test.com', password: passwordHash },
    { username: 'حميد',  email: 'hamid@test.com',   password: passwordHash },
    { username: 'علي',   email: 'ali@test.com',     password: passwordHash },
    { username: 'حمزة',  email: 'hamza@test.com',   password: passwordHash },
    { username: 'سعاد',  email: 'souad@test.com',   password: passwordHash }
  ]);

  const [mariam, khaled, hajar, salma, amine, yassine, hamid, ali, hamza, souad] = extras;

  console.log(`✅ Created ${users.length + extras.length} users`);

  // 3) المجموعات
  console.log('📁 Creating groups...');

  const gMarrakech = await Group.create({
    groupName: 'رحلة مراكش',
    owner: ahmed._id,
    members: [ahmed._id, sara._id, youssef._id]
  });

  const gFriends = await Group.create({
    groupName: 'أصدقاء الحي',
    owner: ahmed._id,
    members: [ahmed._id, youssef._id, mariam._id, khaled._id]
  });

  const gGraduation = await Group.create({
    groupName: 'مشروع التخرج',
    owner: ahmed._id,
    members: [ahmed._id, sara._id, youssef._id, mariam._id]
  });

  const gWork = await Group.create({
    groupName: 'العمل',
    owner: ahmed._id,
    members: [ahmed._id, khaled._id, sara._id]
  });

  const gDorm = await Group.create({
    groupName: 'سكن الطلبة',
    owner: laila._id,
    members: [laila._id, karim._id]
  });

  const gUniTrip = await Group.create({
    groupName: 'رحلة الجامعة',
    owner: laila._id,
    members: [laila._id, karim._id, nada._id, amine._id]
  });

  console.log('✅ Created 6 groups');

  // 4) المصاريف (مختصرة — استخدم بيانات mockData الكاملة إن أردت)
  console.log('💸 Creating expenses...');

  const expenses = [
    // رحلة مراكش
    { description: 'عشاء جماعي', amount: 45, payer: ahmed._id, participants: [ahmed._id, sara._id, youssef._id], group: gMarrakech._id, date: new Date('2026-09-01') },
    { description: 'بنزين السيارة', amount: 20, payer: youssef._id, participants: [ahmed._id, sara._id, youssef._id], group: gMarrakech._id, date: new Date('2026-09-03') },
    { description: 'فندق الليلة الأولى', amount: 180, payer: sara._id, participants: [ahmed._id, sara._id, youssef._id], group: gMarrakech._id, date: new Date('2026-09-04') },
    { description: 'غداء', amount: 75, payer: ahmed._id, participants: [ahmed._id, sara._id, youssef._id], group: gMarrakech._id, date: new Date('2026-09-04') },

    // أصدقاء الحي
    { description: 'شراء طعام', amount: 120, payer: ahmed._id, participants: [ahmed._id, youssef._id, mariam._id, khaled._id], group: gFriends._id, date: new Date('2026-09-08') },
    { description: 'مشروبات', amount: 65, payer: mariam._id, participants: [ahmed._id, youssef._id, mariam._id, khaled._id], group: gFriends._id, date: new Date('2026-09-08') },
    { description: 'ألعاب', amount: 80, payer: khaled._id, participants: [ahmed._id, youssef._id, mariam._id, khaled._id], group: gFriends._id, date: new Date('2026-09-09') },

    // مشروع التخرج
    { description: 'اشتراك الإنترنت', amount: 200, payer: ahmed._id, participants: [ahmed._id, sara._id, youssef._id, mariam._id], group: gGraduation._id, date: new Date('2026-09-01') },
    { description: 'طباعة الوثائق', amount: 85, payer: mariam._id, participants: [ahmed._id, sara._id, youssef._id, mariam._id], group: gGraduation._id, date: new Date('2026-09-05') },
    { description: 'استضافة المشروع', amount: 150, payer: youssef._id, participants: [ahmed._id, sara._id, youssef._id, mariam._id], group: gGraduation._id, date: new Date('2026-09-10') },

    // العمل
    { description: 'غداء العمل', amount: 55, payer: ahmed._id, participants: [ahmed._id, khaled._id, sara._id], group: gWork._id, date: new Date('2026-09-03') },
    { description: 'قهوة المكتب', amount: 25, payer: sara._id, participants: [ahmed._id, khaled._id, sara._id], group: gWork._id, date: new Date('2026-09-04') },

    // سكن الطلبة
    { description: 'إيجار شقة الجامعة', amount: 300, payer: laila._id, participants: [laila._id, karim._id], group: gDorm._id, date: new Date('2026-08-15') },
    { description: 'فاتورة الكهرباء', amount: 60, payer: karim._id, participants: [laila._id, karim._id], group: gDorm._id, date: new Date('2026-08-20') },

    // رحلة الجامعة
    { description: 'رحلة الرباط', amount: 180, payer: laila._id, participants: [laila._id, karim._id, nada._id, amine._id], group: gUniTrip._id, date: new Date('2026-09-01') },
    { description: 'الفندق', amount: 400, payer: karim._id, participants: [laila._id, karim._id, nada._id, amine._id], group: gUniTrip._id, date: new Date('2026-09-01') }
  ];

  await Expense.insertMany(expenses);
  console.log(`✅ Created ${expenses.length} expenses`);

  // 5) التسويات
  console.log('🤝 Creating settlements...');

  const settlements = [
    { fromUser: sara._id, toUser: ahmed._id, group: gMarrakech._id, amount: 15 },
    { fromUser: youssef._id, toUser: ahmed._id, group: gMarrakech._id, amount: 8.33 },
    { fromUser: ahmed._id, toUser: sara._id, group: gMarrakech._id, amount: 20 },
    { fromUser: youssef._id, toUser: ahmed._id, group: gFriends._id, amount: 30 },
    { fromUser: mariam._id, toUser: ahmed._id, group: gFriends._id, amount: 18.75 },
    { fromUser: sara._id, toUser: ahmed._id, group: gGraduation._id, amount: 25 },
    { fromUser: youssef._id, toUser: ahmed._id, group: gGraduation._id, amount: 35 },
    { fromUser: khaled._id, toUser: ahmed._id, group: gWork._id, amount: 25 },
    { fromUser: karim._id, toUser: laila._id, group: gDorm._id, amount: 120 },
    { fromUser: karim._id, toUser: laila._id, group: gUniTrip._id, amount: 140 }
  ];

  await Settlement.insertMany(settlements);
  console.log(`✅ Created ${settlements.length} settlements`);

  // 6) ملخص
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('✅ SEED COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log(`Users:       ${users.length + extras.length}`);
  console.log(`Groups:      6`);
  console.log(`Expenses:    ${expenses.length}`);
  console.log(`Settlements: ${settlements.length}`);
  console.log('');
  console.log('Test users (password: password123):');
  console.log('  1. ahmed@test.com   (أحمد)  → 4 groups');
  console.log('  2. laila@test.com   (ليلى)  → 2 groups');
  console.log('  3. mohamed@test.com (محمد)  → 0 groups');
  console.log('');
  console.log('User IDs for MOCK_AUTH:');
  users.forEach((u, i) => console.log(`  ${i + 1} → ${u.username} (${u._id})`));
  console.log('═══════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});