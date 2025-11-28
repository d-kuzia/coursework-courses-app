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
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
    const search = (req.query.search || "").trim();
    const offset = (page - 1) * limit;

    const params = [];
    let whereClause = "";
    let paramIndex = 1;

    if (search) {
      params.push(`%${search}%`);
      whereClause = `where c.title ilike $${paramIndex} or c.description ilike $${paramIndex}`;
      paramIndex++;
    }

    // Count total
    const countResult = await query(
      `select count(*) as total from courses c ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated results
    const queryParams = [...params, limit, offset];
    const result = await query(
      `select c.id,
              c.title,
              c.description,
              c.teacher_id,
              c.created_at,
              c.updated_at,
              u.name as teacher_name,
              (select count(*) from modules m where m.course_id = c.id) as module_count,
              (select count(*)
               from lessons l
               join modules m on m.id = l.module_id
               where m.course_id = c.id) as lesson_count
       from courses c
       left join users u on u.id = c.teacher_id
       ${whereClause}
       order by c.created_at desc
       limit $${paramIndex} offset $${paramIndex + 1}`,
      queryParams
    );

    res.json({
      courses: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
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
              u.name as teacher_name,
              (select count(*) from modules m where m.course_id = c.id) as module_count,
              (select count(*)
               from lessons l
               join modules m on m.id = l.module_id
               where m.course_id = c.id) as lesson_count
       from courses c
       left join users u on u.id = c.teacher_id
       where c.id = $1`,
      [req.params.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Not found" });
    }
    const modulesRes = await query(
      `select id, course_id, title, position, created_at, updated_at
       from modules
       where course_id = $1
       order by position asc, created_at asc`,
      [req.params.id]
    );
    const lessonsRes = await query(
      `select l.id,
              l.module_id,
              l.title,
              l.position,
              l.created_at,
              l.updated_at
       from lessons l
       join modules m on m.id = l.module_id
       where m.course_id = $1
       order by l.position asc, l.created_at asc`,
      [req.params.id]
    );

    const modules = modulesRes.rows.map((m) => ({ ...m, lessons: [] }));
    const moduleMap = new Map(modules.map((m) => [m.id, m]));
    for (const lesson of lessonsRes.rows) {
      const mod = moduleMap.get(lesson.module_id);
      if (mod) {
        mod.lessons.push(lesson);
      }
    }

    res.json({ course: { ...result.rows[0], modules } });
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
