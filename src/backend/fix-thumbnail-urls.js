require('dotenv').config();
const { connectDB, getDB } = require('./config/db');
const path = require('path');
const fs = require('fs');

async function fixThumbnailUrls() {
  try {
    await connectDB();
    const db = getDB();
    
    // Get all courses with localhost:5000 thumbnails
    const courses = await db.collection('courses').find({
      thumbnail: { $regex: 'localhost:5000' }
    }).toArray();
    
    console.log(`\n📸 Found ${courses.length} courses with admin server URLs\n`);
    
    const adminUploadsDir = path.join(__dirname, 'uploads');
    const studentUploadsDir = path.join(__dirname, '../../../student-panel/src/backend/uploads');
    
    // Ensure student uploads dir exists
    if (!fs.existsSync(studentUploadsDir)) {
      fs.mkdirSync(studentUploadsDir, { recursive: true });
    }
    
    let copied = 0;
    let updated = 0;
    
    for (const course of courses) {
      try {
        // Extract filename from URL
        const filename = course.thumbnail.split('/uploads/').pop();
        const adminFile = path.join(adminUploadsDir, filename);
        const studentFile = path.join(studentUploadsDir, filename);
        
        // Copy file if exists and not already in student uploads
        if (fs.existsSync(adminFile) && !fs.existsSync(studentFile)) {
          fs.copyFileSync(adminFile, studentFile);
          copied++;
          console.log(`✓ Copied: ${filename}`);
        }
        
        // Update URL to use relative path (works for both servers)
        const newUrl = `/uploads/${filename}`;
        await db.collection('courses').updateOne(
          { _id: course._id },
          { $set: { thumbnail: newUrl } }
        );
        updated++;
        
      } catch (err) {
        console.error(`✗ Error processing ${course.title}:`, err.message);
      }
    }
    
    console.log(`\n✅ Summary:`);
    console.log(`   Files copied: ${copied}`);
    console.log(`   URLs updated: ${updated}`);
    
    // Show updated courses
    const updatedCourses = await db.collection('courses').find({}).limit(3).toArray();
    console.log('\n📋 Sample courses after update:');
    updatedCourses.forEach((c, i) => {
      console.log(`${i + 1}. ${c.title}`);
      console.log(`   Thumbnail: ${c.thumbnail}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixThumbnailUrls();
