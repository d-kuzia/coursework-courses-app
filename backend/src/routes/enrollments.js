import express from "express";
import PDFDocument from "pdfkit";
import { transliterate as toLatin } from "transliteration";
import { query } from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /api/courses/:id/enroll
router.post("/courses/:id/enroll", auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await query(
      "select id, teacher_id from courses where id = $1",
      [courseId]
    );
    if (!course.rowCount) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    if (
      course.rows[0].teacher_id &&
      course.rows[0].teacher_id === req.user.id
    ) {
      return res.status(403).json({ message: "Ви викладаєте цей курс" });
    }

    const existing = await query(
      "select * from enrollments where user_id = $1 and course_id = $2",
      [req.user.id, courseId]
    );
    if (existing.rowCount) {
      return res.json({ enrollment: existing.rows[0], alreadyEnrolled: true });
    }

    const result = await query(
      `insert into enrollments (user_id, course_id)
       values ($1, $2)
       returning *`,
      [req.user.id, courseId]
    );
    res
      .status(201)
      .json({ enrollment: result.rows[0], alreadyEnrolled: false });
  } catch (err) {
    console.error("enroll error", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// GET /api/my-courses
router.get("/my-courses", auth, async (req, res) => {
  try {
    const result = await query(
      `select e.id as enrollment_id,
              e.status,
              e.progress,
              e.created_at,
              e.updated_at,
              c.id as course_id,
              c.title,
              c.description,
              c.teacher_id,
              u.name as teacher_name,
              (select count(*) from modules m where m.course_id = c.id) as module_count,
              (select count(*)
               from lessons l
               join modules m on m.id = l.module_id
               where m.course_id = c.id) as lesson_count,
              (select count(*)
               from lesson_quizzes lq
               join lessons l on l.id = lq.lesson_id
               join modules m on m.id = l.module_id
               where m.course_id = c.id) as quiz_count
       from enrollments e
       join courses c on c.id = e.course_id
       left join users u on u.id = c.teacher_id
       where e.user_id = $1
       order by e.created_at desc`,
      [req.user.id]
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error("my courses error", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// GET /api/profile/stats
router.get("/profile/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalCoursesRes = await query(
      "select count(*)::int as cnt from enrollments where user_id = $1",
      [userId]
    );
    const totalCourses = totalCoursesRes.rows[0]?.cnt || 0;

    const completedCoursesRes = await query(
      "select count(*)::int as cnt from enrollments where user_id = $1 and progress = 100",
      [userId]
    );
    const completedCourses = completedCoursesRes.rows[0]?.cnt || 0;

    const totalLessonsRes = await query(
      `select count(*)::int as cnt
       from lessons l
       join modules m on m.id = l.module_id
       join enrollments e on e.course_id = m.course_id
       where e.user_id = $1`,
      [userId]
    );
    const totalLessons = totalLessonsRes.rows[0]?.cnt || 0;

    const completedLessonsRes = await query(
      `select count(*)::int as cnt
       from lesson_progress lp
       join enrollments e on e.id = lp.enrollment_id
       where e.user_id = $1`,
      [userId]
    );
    const completedLessons = completedLessonsRes.rows[0]?.cnt || 0;

    const avgProgressRes = await query(
      `select coalesce(avg(progress)::int, 0) as avg_progress
       from enrollments
       where user_id = $1`,
      [userId]
    );
    const avgProgress = avgProgressRes.rows[0]?.avg_progress || 0;

    res.json({
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
      avgProgress,
    });
  } catch (err) {
    console.error("profile stats error", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// GET /api/courses/:id/certificate
router.get("/courses/:id/certificate", auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const enrollmentRes = await query(
      `select e.progress,
              e.updated_at,
              c.title as course_title,
              u.name as user_name
       from enrollments e
       join courses c on c.id = e.course_id
       join users u on u.id = e.user_id
       where e.user_id = $1 and e.course_id = $2`,
      [req.user.id, courseId]
    );

    if (!enrollmentRes.rowCount) {
      return res.status(404).json({ message: "Запис не знайдено" });
    }

    const enrollment = enrollmentRes.rows[0];
    if (enrollment.progress < 100) {
      return res.status(403).json({ message: "Курс ще не завершено" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 64 });
    const userName =
      toLatin(enrollment.user_name || "Student").trim() || "Student";
    const courseTitle =
      toLatin(enrollment.course_title || "Course").trim() || "Course";

    const safeTitle = courseTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `certificate-${safeTitle || "course"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    const completedAt = enrollment.updated_at
      ? new Date(enrollment.updated_at)
      : new Date();
    const formattedDate = completedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#111827")
      .text("Certificate of Completion", { align: "center" });

    doc.moveDown(2);

    doc
      .font("Helvetica")
      .fontSize(16)
      .fillColor("#374151")
      .text("This certifies that", { align: "center" });

    doc.moveDown(1);

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#111827")
      .text(userName, { align: "center" });

    doc.moveDown(1.5);

    doc
      .font("Helvetica")
      .fontSize(16)
      .fillColor("#374151")
      .text("has successfully completed the course", { align: "center" });

    doc.moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#111827")
      .text(courseTitle, { align: "center" });

    doc.moveDown(2);

    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#374151")
      .text(`Date: ${formattedDate}`, { align: "center" });

    doc
      .moveDown(2)
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#6b7280")
      .text("Generated by Coursework Courses App", { align: "center" });

    doc.end();
  } catch (err) {
    console.error("certificate generation error", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

export default router;
