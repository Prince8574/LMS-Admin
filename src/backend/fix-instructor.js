require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('learnverse');

  // Fix all courses where instructor name is "Admin"
  const admins = await db.collection('admins').find({}).toArray();
  
  for (const admin of admins) {
    const initials = admin.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const result = await db.collection('courses').updateMany(
      { adminId: admin._id, 'instructor.name': 'Admin' },
      { $set: { instructor: { id: admin._id, name: admin.name, initials } } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Fixed ${result.modifiedCount} courses for admin: ${admin.name}`);
    }
  }
  
  console.log('Done!');
  await client.close();
}
main().catch(console.error);
