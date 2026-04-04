require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('learnverse');

  const students = await db.collection('users')
    .find({ role: 'student' })
    .project({ password: 0 })
    .toArray();

  console.log(`\n=== STUDENTS (${students.length}) ===`);
  students.forEach(s => {
    console.log(`\nName: ${s.name} | Email: ${s.email}`);
    console.log(`  status: ${s.status} | plan: ${s.plan}`);
    console.log(`  enrolledCourses: ${JSON.stringify(s.enrolledCourses?.length || s.enrolledCourses)}`);
    console.log(`  completedCourses: ${JSON.stringify(s.completedCourses?.length || 0)}`);
    console.log(`  totalSpent: ${s.totalSpent} | avgProgress: ${s.avgProgress}`);
    console.log(`  lastActive: ${s.lastActive}`);
    console.log(`  grades: ${s.grades?.length || 0}`);
  });

  // Check enrollments collection
  const enrollments = await db.collection('enrollments').find({}).toArray();
  console.log(`\n=== ENROLLMENTS (${enrollments.length}) ===`);
  enrollments.slice(0, 5).forEach(e => {
    console.log(`  student: ${e.student || e.userId} | course: ${e.course || e.courseId} | progress: ${e.progress}`);
  });

  await client.close();
}
main().catch(console.error);
