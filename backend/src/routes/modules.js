import express from "express";
import { z } from "zod";
import { query } from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const moduleCreateSchema = z.object({
  title: z.string().min(1).max(255),
  position: z.number().int().optional()
});

const moduleUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  position: z.number().int().optional()
});

async function getCourseForModule(moduleId) {
  const res = await query(
    `select m.course_id, c.teacher_id
     from modules m
     join courses c on c.id = m.course_id
     where m.id = $1`,
    [moduleId]
  );
  return res.rows[0];
}

async function ensureCanEditCourse(user, courseId) {
  if (user.role === "ADMIN") return true;
  const res = await query("select teacher_id from courses where id = $1", [courseId]);
  if (!res.rowCount) return false;
  return res.rows[0].teacher_id === user.id;
}

// POST /api/courses/:courseId/modules
router.post("/courses/:courseId/modules", auth, async (req, res) => {
  const courseId = req.params.courseId;
  const parsed = moduleCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  try {
    const canEdit = await ensureCanEditCourse(req.user, courseId);
    if (!canEdit) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, position } = parsed.data;
    const result = await query(
      `insert into modules (course_id, title, position)
       values ($1, $2, coalesce($3, 0))
       returning *`,
      [courseId, title, position]
    );
    res.status(201).json({ module: result.rows[0] });
  } catch (err) {
    console.error("module create error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/modules/:id
router.put("/modules/:id", auth, async (req, res) => {
  const parsed = moduleUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  try {
    const meta = await getCourseForModule(req.params.id);
    if (!meta) return res.status(404).json({ message: "Not found" });
    const canEdit = await ensureCanEditCourse(req.user, meta.course_id);
    if (!canEdit) return res.status(403).json({ message: "Forbidden" });

    const fields = [];
    const values = [];
    let idx = 1;
    if (parsed.data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(parsed.data.title);
    }
    if (parsed.data.position !== undefined) {
      fields.push(`position = $${idx++}`);
      values.push(parsed.data.position);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    values.push(req.params.id);
    const sql = `update modules set ${fields.join(
      ", "
    )}, updated_at = now() where id = $${idx} returning *`;
    const result = await query(sql, values);
    res.json({ module: result.rows[0] });
  } catch (err) {
    console.error("module update error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/modules/:id
router.delete("/modules/:id", auth, async (req, res) => {
  try {
    const meta = await getCourseForModule(req.params.id);
    if (!meta) return res.status(404).json({ message: "Not found" });
    const canEdit = await ensureCanEditCourse(req.user, meta.course_id);
    if (!canEdit) return res.status(403).json({ message: "Forbidden" });

    await query("delete from modules where id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("module delete error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
