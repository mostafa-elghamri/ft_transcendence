require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const dataSource = require('../src/dataSource');

async function test() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db(process.env.MONGODB_DB_NAME);

  // جد Aidix
  const aidix = await db.collection('users').findOne({ username: 'Aidix' });
  console.log('Aidix _id:', aidix._id.toString());

  // 1) كل المجموعات
  const allDocs = await dataSource.loadUserDocuments(db, aidix._id);
  console.log('\n=== ALL DOCS (' + allDocs.length + ') ===');
  allDocs.forEach((d, i) => console.log((i + 1) + '. ' + d));

  // 2) مجموعة واحدة
  const akhour = await db.collection('groups').findOne({ groupName: 'Akhour Trip' });
  const groupDocs = await dataSource.loadGroupDocuments(db, aidix._id, akhour._id);
  console.log('\n=== AKHOUR TRIP (' + groupDocs.length + ') ===');
  groupDocs.forEach((d, i) => console.log((i + 1) + '. ' + d));

  // 3) اختبار forbidden
  const karim = await db.collection('users').findOne({ username: 'Karim' });
  const summerTrip = await db.collection('groups').findOne({ groupName: 'Summer Trip' });
  try {
    await dataSource.loadGroupDocuments(db, karim._id, summerTrip._id);
    console.log('\n❌ Karim should NOT access Summer Trip');
  } catch (e) {
    console.log('\n✅ Karim blocked from Summer Trip:', e.message);
  }

  await client.close();
}

test().catch(console.error);