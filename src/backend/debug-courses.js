require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learnverse');

  // Check admins
  const admins = await db.collection('admins').find({}, { projection: { password: 0 } }).toArray();
  console.log('\n=== ADMINS ===');
  admins.forEach(a => console.log(`  ID: ${a._id} | Name: ${a.name} | Email: ${a.email}`));

  // Check courses
  const courses = await db.collection('courses').find({}).toArray();
  console.log(`\n=== COURSES (total: ${courses.length}) ===`);
  courses.forEach(c => console.log(`  ID: ${c._id} | Title: ${c.title} | adminId: ${c.adminId || 'NOT SET'}`));

  // Check how many courses have no adminId
  const noAdminId = courses.filter(c => !c.adminId);
  console.log(`\n=== Courses WITHOUT adminId: ${noAdminId.length} ===`);

  await client.close();
}

main().catch(console.error);
