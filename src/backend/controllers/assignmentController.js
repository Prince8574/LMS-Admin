const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const { generateCertificate, generateCertificateId } = require("../services/certificateService");

const col = () => getDB().collection("assignments");
const submissionsCol = () => getDB().collection("submissions");  // matches Mongoose Submission model
const usersCol = () => getDB().collection("users");

// GET /api/assignments  — list with search/filter/pagination
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, priority } = req.query;
    const q = { isActive: { $ne: false } };
    if (search)   q.$or = [{ title: new RegExp(search, "i") }, { courseName: new RegExp(search, "i") }];
    if (type)     q.type = type;
    if (priority) q.priority = priority;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await col().countDocuments(q);
    const data  = await col().find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).toArray();

    res.json({ success: true, total, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/assignments/:id
exports.getOne = async (req, res) => {
  try {
    const a = await col().findOne({ _id: new ObjectId(req.params.id) });
    if (!a) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: a });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/assignments
exports.create = async (req, res) => {
  try {
    const doc = {
      ...req.body,
      dueDate:   req.body.dueDate ? new Date(req.body.dueDate) : null,
      maxScore:  Number(req.body.maxScore) || Number(req.body.points) || 100,
      isActive:  true,
      createdBy: req.admin?.id || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await col().insertOne(doc);
    res.status(201).json({ success: true, data: { ...doc, _id: result.insertedId } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/assignments/:id
exports.update = async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    if (update.dueDate) update.dueDate = new Date(update.dueDate);
    if (update.points)  update.points  = Number(update.points);
    delete update._id;

    const result = await col().findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: update },
      { returnDocument: "after" }
    );
    if (!result) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/assignments/:id  — soft delete
exports.remove = async (req, res) => {
  try {
    await col().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/assignments/submissions - Get all submissions
exports.getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const q = {};
    
    if (status && status !== 'all') q.status = status;
    if (search) {
      q.$or = [
        { assignmentTitle: new RegExp(search, "i") },
        { courseName: new RegExp(search, "i") }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await submissionsCol().countDocuments(q);
    
    // Get submissions with student details
    const submissions = await submissionsCol()
      .aggregate([
        { $match: q },
        {
          $lookup: {
            from: "users",
            localField: "student",   // Mongoose field name
            foreignField: "_id",
            as: "student"
          }
        },
        { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            assignmentId: 1,
            assignmentTitle: 1,
            courseName: 1,
            submissionText: 1,
            submissionUrl: 1,
            status: 1,
            score: 1,
            maxScore: 1,
            feedback: 1,
            submittedAt: 1,
            gradedAt: 1,
            certificateId: 1,
            "student.name": 1,
            "student.email": 1
          }
        },
        { $sort: { submittedAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) }
      ])
      .toArray();

    res.json({ success: true, total, data: submissions });
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/assignments/:id/grade - Grade submission and generate certificate
exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params; // submission ID
    const { score, feedback, maxScore } = req.body;

    // Validate score
    if (score === undefined || score === null) {
      return res.status(400).json({ success: false, message: "Score is required" });
    }

    // Get submission
    const submission = await submissionsCol().findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Get student details
    const student = await usersCol().findOne({ _id: submission.student });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Get assignment details for maxScore
    const assignment = await col().findOne({ _id: submission.assignmentId });
    const finalMaxScore = maxScore || assignment?.maxScore || 100;

    // Generate certificate
    const certificateId = generateCertificateId();
    const certCourseName = submission.courseName || assignment?.courseName || assignment?.course || '';
    const certAssignTitle = submission.assignmentTitle || assignment?.title || 'Assignment';
    const certificatePath = await generateCertificate({
      studentName: student.name,
      courseName: certCourseName,
      assignmentTitle: certAssignTitle,
      score: Number(score),
      maxScore: finalMaxScore,
      completionDate: new Date(),
      certificateId
    });

    // Update submission with grade and certificate
    const updatedSubmission = await submissionsCol().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          score: Number(score),
          maxScore: finalMaxScore,
          feedback: feedback || "",
          status: "graded",
          gradedAt: new Date(),
          certificateId,
          certificatePath,
          updatedAt: new Date()
        } 
      },
      { returnDocument: "after" }
    );

    // Update student's grades array
    await usersCol().updateOne(
      { _id: submission.student },
      { 
        $push: { 
          grades: {
            assignmentId:    submission.assignment || submission.assignmentId,
            assignmentTitle: submission.assignmentTitle || assignment?.title || '',
            courseName:      submission.courseName || assignment?.courseName || assignment?.course || '',
            score:           Number(score),
            maxScore:        finalMaxScore,
            percentage:      ((Number(score) / finalMaxScore) * 100).toFixed(2),
            certificateId,
            certificatePath,
            gradedAt:        new Date()
          }
        }
      }
    );

    res.json({ 
      success: true, 
      message: "Assignment graded and certificate generated successfully",
      data: updatedSubmission 
    });
  } catch (err) {
    console.error("Error grading submission:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
