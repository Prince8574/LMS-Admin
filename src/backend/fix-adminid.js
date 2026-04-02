require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('learnverse');

  const orphanAdminId = new ObjectId('69bff0e9ebd7933d5b2b08da');
  const princeKumarId = new ObjectId('69c409bfe25dfe08f0f88081');

  const result = await db.collection('courses').updateMany(
    { adminId: orphanAdminId },
    { $set: { adminId: princeKumarId } }
  );

  console.log(`Updated ${result.modifiedCount} orphan courses → assigned to Prince Kumar`);
  await client.close();
}

main().catch(console.error);
