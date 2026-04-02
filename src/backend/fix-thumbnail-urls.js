require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('learnverse');

  const courses = await db.collection('courses').find({ thumbnail: /localhost:5001/ }).toArray();
  console.log(`Found ${courses.length} courses with 5001 thumbnail URLs`);

  for (const c of courses) {
    const newUrl = c.thumbnail.replace('localhost:5001', 'localhost:5000');
    await db.collection('courses').updateOne(
      { _id: c._id },
      { $set: { thumbnail: newUrl } }
    );
    console.log(`Fixed: ${c.title} → ${newUrl}`);
  }

  console.log('Done!');
  await client.close();
}
main().catch(console.error);
