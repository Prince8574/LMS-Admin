const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { studentProtect } = require("../middleware/studentAuth");

router.use(studentProtect);

// GET /api/users/profile
router.get("/profile", async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/users/profile
router.put("/profile", async (req, res) => {
  try {
    const db = getDB();
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.password;
    delete updates._id;

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(req.user.id) },
      { $set: updates },
      { returnDocument: "after", projection: { password: 0 } }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/users/wishlist/:id
router.post("/wishlist/:id", async (req, res) => {
  try {
    const db = getDB();
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      { $addToSet: { wishlist: req.params.id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/users/wishlist/:id
router.delete("/wishlist/:id", async (req, res) => {
  try {
    const db = getDB();
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      { $pull: { wishlist: req.params.id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/users/wishlist
router.get("/wishlist", async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { wishlist: 1 } }
    );
    res.json({ success: true, data: user?.wishlist || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
