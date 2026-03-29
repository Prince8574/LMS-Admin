const { MongoClient } = require("mongodb");
MongoClient.connect("mongodb://localhost:27017").then(c => {
  c.db("learnverse").collection("courses")
    .updateMany({ status: "published" }, { $set: { isPublished: true } })
    .then(r => { console.log("Updated:", r.modifiedCount); c.close(); });
});
