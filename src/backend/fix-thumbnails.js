require('dotenv').config();
const { connectDB, getDB } = require('./config/db');

async function fixThumbnails() {
  try {
    await connectDB();
    const db = getDB();
    
    const defaultThumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
    
    // Update all courses that don't have a thumbnail
    const result = await db.collection('courses').updateMany(
      { 
        $or: [
          { thumbnail: { $exists: false } },
          { thumbnail: '' },
          { thumbnail: null }
        ]
      },
      { 
        $set: { thumbnail: defaultThumbnail }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} courses with default thumbnail`);
    
    // Show sample courses
    const courses = await db.collection('courses').find({}).limit(3).toArray();
    console.log('\n📸 Sample courses:');
    courses.forEach((c, i) => {
      console.log(`${i + 1}. ${c.title}`);
      console.log(`   Thumbnail: ${c.thumbnail}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixThumbnails();
