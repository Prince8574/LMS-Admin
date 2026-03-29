const { MongoClient } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017").then(async client => {
  const db = client.db("learnverse");
  const courses = await db.collection("courses").find({}).toArray();
  
  for (const c of courses) {
    const updates = {};
    
    // Fix tags
    if (!Array.isArray(c.tags)) {
      updates.tags = typeof c.tags === "string" ? c.tags.split(",").map(s => s.trim()).filter(Boolean) : [];
    }
    // Fix outcomes
    if (!Array.isArray(c.outcomes)) {
      updates.outcomes = typeof c.outcomes === "string" ? c.outcomes.split(/\n|,/).map(s => s.trim()).filter(Boolean) : [];
    }
    // Fix curriculum
    if (!Array.isArray(c.curriculum)) {
      updates.curriculum = [];
    }
    // Fix instructor
    if (typeof c.instructor === "string") {
      updates.instructor = { name: "Admin", initials: "AD" };
    }
    // Fix isPublished
    if (c.status === "published" && !c.isPublished) {
      updates.isPublished = true;
    }
    
    if (Object.keys(updates).length > 0) {
      await db.collection("courses").updateOne({ _id: c._id }, { $set: updates });
      console.log(`Fixed: ${c.title}`);
    }
  }
  
  console.log("Done!");
  client.close();
});
