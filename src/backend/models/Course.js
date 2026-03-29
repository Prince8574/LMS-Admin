const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const COLLECTION = "courses";

// Sanitize helpers
const toArray = v => {
  if (Array.isArray(v)) return v.filter(x => x && String(x).trim());
  if (typeof v === "string") return v.split(",").map(s => s.trim()).filter(Boolean);
  return [];
};

const toInstructor = v => {
  if (!v || typeof v === "string") return { name: "Admin", initials: "AD" };
  if (typeof v === "object" && v.name) return { id: v.id || null, name: v.name, initials: v.initials || "AD" };
  return { name: "Admin", initials: "AD" };
};

const toCurriculum = v => {
  if (!Array.isArray(v)) return [];
  return v.map(sec => ({
    id:      sec.id,
    title:   sec.title || "",
    open:    sec.open ?? true,
    lessons: Array.isArray(sec.lessons) ? sec.lessons.map(l => ({
      id:       l.id,
      type:     l.type || "video",
      title:    l.title || "",
      dur:      l.dur || "—",
      free:     l.free ?? false,
      videoUrl: l.videoUrl || "",
      docUrl:   l.docUrl   || "",
      content:  l.content  || "",
    })) : [],
  }));
};

const sanitize = (data) => ({
  title:         String(data.title || "").trim(),
  subtitle:      String(data.subtitle || "").trim(),
  description:   String(data.description || "").trim(),
  category:      String(data.category || "Development"),
  level:         String(data.level || "Beginner"),
  language:      String(data.language || "Hindi + English"),
  support:       String(data.support || "Community"),
  price:         parseFloat(data.price) || 0,
  originalPrice: parseFloat(data.originalPrice) || 0,
  duration:      String(data.duration || "—"),
  thumbnail:     String(data.thumbnail || ""),
  promoVideoUrl: String(data.promoVideoUrl || ""),
  tags:          toArray(data.tags || data.skills),
  outcomes:      toArray(data.outcomes),
  instructor:    toInstructor(data.instructor),
  curriculum:    toCurriculum(data.curriculum),
  quiz:          data.quiz || null,
  assignment:    data.assignment || null,
  mediaType:     String(data.mediaType || "video"),
  certificate:   data.certificate  ?? true,
  lifetime:      data.lifetime     ?? true,
  downloadable:  data.downloadable ?? true,
  previewVideo:  data.previewVideo ?? true,
  status:        String(data.status || "draft"),
  isPublished:   data.status === "published" || data.isPublished === true,
  badge:         String(data.badge || "New"),
  emoji:         String(data.emoji || "📘"),
  accent:        String(data.accent || "#7c2fff"),
  accentGlow:    String(data.accentGlow || "rgba(124,47,255,.28)"),
  bg:            String(data.bg || "linear-gradient(135deg,#0a0f1a,#1a0533)"),
});

async function createCourse(data) {
  const db = getDB();
  const doc = {
    ...sanitize(data),
    enrolledStudents: 0,
    revenue:          "—",
    rating:           0,
    adminId:          new ObjectId(data.adminId),
    createdAt:        new Date(),
    updatedAt:        new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function getAllCourses(filter = {}) {
  const db = getDB();
  return db.collection(COLLECTION).find(filter).sort({ createdAt: -1 }).toArray();
}

async function getCourseById(id) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function updateCourse(id, updates) {
  const db = getDB();
  const clean = {
    ...sanitize(updates),
    updatedAt: new Date(),
  };
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: clean },
    { returnDocument: "after" }
  );
  return result;
}

async function deleteCourse(id) {
  const db = getDB();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
}

async function togglePublish(id, isPublished) {
  const db = getDB();
  return db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isPublished, status: isPublished ? "published" : "draft", updatedAt: new Date() } },
    { returnDocument: "after" }
  );
}

async function getCourseStats() {
  const db = getDB();
  const [total, published, draft, review] = await Promise.all([
    db.collection(COLLECTION).countDocuments(),
    db.collection(COLLECTION).countDocuments({ status: "published" }),
    db.collection(COLLECTION).countDocuments({ status: "draft" }),
    db.collection(COLLECTION).countDocuments({ status: "review" }),
  ]);
  return { total, published, draft, review };
}

module.exports = { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse, togglePublish, getCourseStats };
