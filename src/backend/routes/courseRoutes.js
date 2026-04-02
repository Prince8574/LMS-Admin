const express  = require("express");
const router   = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { create, getAll, getOne, update, remove, publish, stats } = require("../controllers/courseController");

router.get("/stats",                    protect, stats);
router.get("/",                         protect, getAll);
router.get("/:id",                      getOne);
router.post("/",                        protect, create);
router.put("/:id",                      protect, update);
router.delete("/:id",                   protect, remove);
router.patch("/:id/publish",            protect, publish);

module.exports = router;
