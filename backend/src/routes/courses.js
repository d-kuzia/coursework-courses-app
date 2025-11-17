import express from "express";
import { z } from "zod";
import { query } from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const courseCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional()
});

const courseUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional()
});

function ensureTeacherOrAdmin(user) {
  return user.role === "ADMIN" || user.role === "TEACHER";
}

// GET /api/courses (public)
router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `select c.id,
              c.title,
              c.description,
              c.teacher_id,
              c.created_at,
              c.updated_at,
              u.name as teacher_name
       from courses c
       left join users u on u.id = c.teacher_id
       order by c.created_at desc`
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error("courses list error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/courses/:id (public)
router.get("/:id", async (req, res) => {
  try {
    const result = await query(
      `select c.id,
              c.title,
              c.description,
              c.teacher_id,
              c.created_at,
              c.updated_at,
              u.name as teacher_name
       from courses c
       left join users u on u.id = c.teacher_id
       where c.id = $1`,
      [req.params.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ course: result.rows[0] });
  } catch (err) {
    console.error("course detail error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/courses (role: TEACHER/ADMIN)
router.post("/", auth, async (req, res) => {
  if (!ensureTeacherOrAdmin(req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const parsed = courseCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  try {
    const { title, description } = parsed.data;
    const result = await query(
      `insert into courses (title, description, teacher_id)
       values ($1, $2, $3)
       returning *`,
      [title, description || null, req.user.id]
    );
    res.status(201).json({ course: result.rows[0] });
  } catch (err) {
    console.error("course create error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/courses/:id (role: owner or admin)
router.put("/:id", auth, async (req, res) => {
  const parsed = courseUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  try {
    const id = req.params.id;
    const existing = await query(
      "select teacher_id from courses where id = $1",
      [id]
    );
    if (!existing.rowCount) {
      return res.status(404).json({ message: "Not found" });
    }
    const isOwner = existing.rows[0].teacher_id === req.user.id;
    if (!(isOwner || req.user.role === "ADMIN")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (parsed.data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(parsed.data.title);
    }
    if (parsed.data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(parsed.data.description);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    values.push(id);
    const sql = `update courses set ${fields.join(
      ", "
    )}, updated_at = now() where id = $${idx} returning *`;
    const result = await query(sql, values);
    res.json({ course: result.rows[0] });
  } catch (err) {
    console.error("course update error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/courses/:id (role: owner or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await query(
      "select teacher_id from courses where id = $1",
      [id]
    );
    if (!existing.rowCount) {
      return res.status(404).json({ message: "Not found" });
    }
    const isOwner = existing.rows[0].teacher_id === req.user.id;
    if (!(isOwner || req.user.role === "ADMIN")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await query("delete from courses where id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("course delete error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
