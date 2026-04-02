require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('learnverse');

  const courses = await db.collection('courses').find({}).project({ title: 1, thumbnail: 1, instructor: 1, adminId: 1 }).toArray();
  console.log('\n=== COURSE THUMBNAIL & INSTRUCTOR DATA ===');
  courses.forEach(c => {
    console.log(`\nTitle: ${c.title}`);
    console.log(`  thumbnail: "${c.thumbnail}"`);
    console.log(`  instructor: ${JSON.stringify(c.instructor)}`);
    console.log(`  adminId: ${c.adminId}`);
  });

  // Check upload route - what URL format is being saved
  console.log('\n=== UPLOAD DIR FILES ===');
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).slice(-5);
    console.log('Last 5 uploads:', files);
  } else {
    console.log('uploads dir not found');
  }

  await client.close();
}
main().catch(console.error);
