import express from "express";
import { z } from "zod";
import { query } from "../db.js";
import auth from "../middleware/auth.js";
import { verifyToken } from "../utils/jwt.js";
import { markLessonCompleted } from "../utils/progress.js";

const router = express.Router();

const lessonCreateSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  position: z.number().int().optional()
});

const lessonUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  position: z.number().int().optional()
});

async function ensureCanEditCourse(user, courseId) {
  if (user.role === "ADMIN") return true;
  const res = await query("select teacher_id from courses where id = $1", [courseId]);
  if (!res.rowCount) return false;
  return res.rows[0].teacher_id === user.id;
}

async function getModuleMeta(moduleId) {
  const res = await query(
    `select m.id, m.course_id, c.teacher_id
     from modules m
     join courses c on c.id = m.course_id
     where m.id = $1`,
    [moduleId]
  );
  return res.rows[0];
}

async function getLessonMeta(lessonId) {
  const res = await query(
    `select l.id, l.module_id, m.course_id, c.teacher_id
     from lessons l
     join modules m on m.id = l.module_id
     join courses c on c.id = m.course_id
     where l.id = $1`,
    [lessonId]
  );
  return res.rows[0];
}

// POST /api/modules/:moduleId/lessons
router.post("/modules/:moduleId/lessons", auth, async (req, res) => {
  const moduleId = req.params.moduleId;
  const parsed = lessonCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  try {
    const meta = await getModuleMeta(moduleId);
    if (!meta) return res.status(404).json({ message: "Module not found" });
    const canEdit = await ensureCanEditCourse(req.user, meta.course_id);
    if (!canEdit) return res.status(403).json({ message: "Forbidden" });

    const { title, content, videoUrl, position } = parsed.data;
    const result = await query(
      `insert into lessons (module_id, title, content, video_url, position)
       values ($1, $2, $3, $4, coalesce($5, 0))
       returning *`,
      [moduleId, title, content || null, videoUrl || null, position]
    );
    res.status(201).json({ lesson: result.rows[0] });
  } catch (err) {
    console.error("lesson create error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/lessons/:id (public)
router.get("/lessons/:id", async (req, res) => {
  try {
    let requester = null;
    const h = req.headers.authorization;
    if (h && h.startsWith("Bearer ")) {
      try {
        const payload = verifyToken(h.slice(7));
        requester = { id: payload.sub, role: payload.role };
      } catch {
        requester = null;
      }
    }

    const result = await query(
      `select l.id,
              l.title,
              l.content,
              l.video_url,
              l.module_id,
              l.position,
              l.created_at,
              l.updated_at,
              m.title as module_title,
              m.course_id,
              c.title as course_title,
              c.teacher_id as course_teacher_id
       from lessons l
       join modules m on m.id = l.module_id
       join courses c on c.id = m.course_id
       where l.id = $1`,
      [req.params.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Not found" });
    }
    const lesson = result.rows[0];

    if (requester && requester.role === "USER") {
      markLessonCompleted(requester.id, lesson.id).catch((err) =>
        console.error("mark lesson complete error", err)
      );
    }

    res.json({ lesson });
  } catch (err) {
    console.error("lesson detail error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/lessons/:id
router.put("/lessons/:id", auth, async (req, res) => {
  const parsed = lessonUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  try {
    const meta = await getLessonMeta(req.params.id);
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
    if (parsed.data.content !== undefined) {
      fields.push(`content = $${idx++}`);
      values.push(parsed.data.content);
    }
    if (parsed.data.videoUrl !== undefined) {
      fields.push(`video_url = $${idx++}`);
      values.push(parsed.data.videoUrl);
    }
    if (parsed.data.position !== undefined) {
      fields.push(`position = $${idx++}`);
      values.push(parsed.data.position);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    values.push(req.params.id);
    const sql = `update lessons set ${fields.join(
      ", "
    )}, updated_at = now() where id = $${idx} returning *`;
    const result = await query(sql, values);
    res.json({ lesson: result.rows[0] });
  } catch (err) {
    console.error("lesson update error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/lessons/:id
router.delete("/lessons/:id", auth, async (req, res) => {
  try {
    const meta = await getLessonMeta(req.params.id);
    if (!meta) return res.status(404).json({ message: "Not found" });
    const canEdit = await ensureCanEditCourse(req.user, meta.course_id);
    if (!canEdit) return res.status(403).json({ message: "Forbidden" });

    await query("delete from lessons where id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("lesson delete error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
