require('dotenv').config();
const mongoose = require('mongoose');
const { loadUserDocuments } = require('../src/dataSource');
const User = require('../src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/splitwise');

  const ahmed = await User.findOne({ username: 'أحمد' });
  console.log('Testing for:', ahmed.username, ahmed._id);

  const docs = await loadUserDocuments(ahmed._id.toString());

  console.log(`\n📄 Got ${docs.length} documents:\n`);
  docs.forEach((d, i) => console.log(`${i + 1}. ${d}\n`));

  await mongoose.disconnect();
}

test().catch(console.error);