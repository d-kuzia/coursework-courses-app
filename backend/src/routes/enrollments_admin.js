import express from "express";
import { query } from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

async function canManageCourse(user, courseId) {
  if (user.role === "ADMIN") return true;
  const res = await query("select teacher_id from courses where id = $1", [courseId]);
  if (!res.rowCount) return false;
  return res.rows[0].teacher_id === user.id;
}

router.get("/courses/:id/enrollments", auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const allowed = await canManageCourse(req.user, courseId);
    if (!allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await query(
      `select e.id,
              e.status,
              e.progress,
              e.created_at,
              u.id as user_id,
              u.name,
              u.email,
              u.role
       from enrollments e
       join users u on u.id = e.user_id
       where e.course_id = $1
       order by e.created_at desc`,
      [courseId]
    );

    res.json({ enrollments: result.rows });
  } catch (err) {
    console.error("course enrollments error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
