import express from "express";
import { z } from "zod";
import pool, { query } from "../db.js";
import auth from "../middleware/auth.js";
import { verifyToken } from "../utils/jwt.js";
import { markLessonCompleted } from "../utils/progress.js";

const router = express.Router();

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string().min(1),
        position: z.coerce.number().int().optional(),
        options: z
          .array(
            z.object({
              text: z.string().min(1),
              isCorrect: z.boolean().optional()
            })
          )
          .min(2)
      })
    )
    .min(1)
});

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      optionId: z.string().uuid()
    })
  )
});

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

async function ensureCanEditCourse(user, courseId) {
  if (user.role === "ADMIN") return true;
  const res = await query("select teacher_id from courses where id = $1", [courseId]);
  if (!res.rowCount) return false;
  return res.rows[0].teacher_id === user.id;
}

// GET /api/lessons/:lessonId/quiz (public)
router.get("/lessons/:lessonId/quiz", async (req, res) => {
  try {
    let requester = null;
    const h = req.headers.authorization;
    if (h && h.startsWith("Bearer ")) {
      try {
        const payload = verifyToken(h.slice(7));
        requester = { id: payload.sub, role: payload.role };
      } catch (_) {
        requester = null;
      }
    }

    const meta = await getLessonMeta(req.params.lessonId);
    const quizRes = await query(
      "select id from lesson_quizzes where lesson_id = $1",
      [req.params.lessonId]
    );
    if (!quizRes.rowCount) {
      return res.json({ quiz: null });
    }

    const quizId = quizRes.rows[0].id;
    const questionsRes = await query(
      `select id, text, position
       from quiz_questions
       where quiz_id = $1
       order by position asc, id asc`,
      [quizId]
    );
    const optionsRes = await query(
      `select id, question_id, text, is_correct
       from quiz_options
       where question_id = any($1::uuid[])
       order by id`,
      [questionsRes.rows.map((q) => q.id)]
    );

    const optionsByQuestion = optionsRes.rows.reduce((acc, opt) => {
      if (!acc[opt.question_id]) acc[opt.question_id] = [];
      const includeCorrect =
        requester &&
        meta &&
        (requester.role === "ADMIN" || requester.id === meta.teacher_id);
      acc[opt.question_id].push(
        includeCorrect
          ? { id: opt.id, text: opt.text, isCorrect: opt.is_correct }
          : { id: opt.id, text: opt.text }
      );
      return acc;
    }, {});

    const quiz = {
      id: quizId,
      questions: questionsRes.rows.map((q) => ({
        id: q.id,
        text: q.text,
        position: q.position,
        options: optionsByQuestion[q.id] || []
      }))
    };

    res.json({ quiz });
  } catch (err) {
    console.error("quiz fetch error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/lessons/:lessonId/quiz (create/replace)
router.post("/lessons/:lessonId/quiz", auth, async (req, res) => {
  const lessonId = req.params.lessonId;
  const parsed = quizSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  try {
    const meta = await getLessonMeta(lessonId);
    if (!meta) return res.status(404).json({ message: "Lesson not found" });
    const canEdit = await ensureCanEditCourse(req.user, meta.course_id);
    if (!canEdit) return res.status(403).json({ message: "Forbidden" });

    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("delete from lesson_quizzes where lesson_id = $1", [lessonId]);
      const quizInsert = await client.query(
        `insert into lesson_quizzes (lesson_id) values ($1) returning id`,
        [lessonId]
      );
      const quizId = quizInsert.rows[0].id;

      for (const [idx, q] of parsed.data.questions.entries()) {
        if (!Array.isArray(q.options)) {
          throw new Error("options array is required for each question");
        }
        const questionInsert = await client.query(
          `insert into quiz_questions (quiz_id, text, position)
           values ($1, $2, coalesce($3::int, $4)) returning id`,
          [quizId, q.text, q.position, idx]
        );
        const questionId = questionInsert.rows[0].id;
        let hasCorrect = false;
        for (const opt of q.options) {
          const isCorrect = !!opt.isCorrect;
          if (isCorrect) hasCorrect = true;
          await client.query(
            `insert into quiz_options (question_id, text, is_correct)
             values ($1, $2, $3)`,
            [questionId, opt.text, isCorrect]
          );
        }
        if (!hasCorrect) {
          throw new Error("Each question must have at least one correct option");
        }
      }

      await client.query("commit");
      res.status(201).json({ success: true });
    } catch (err) {
      await client.query("rollback");
      if (err.message?.includes("at least one correct option")) {
        return res.status(400).json({ message: err.message });
      }
      console.error("quiz create error", err);
      res.status(400).json({ message: err.message || "Invalid quiz data" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("quiz create outer error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/lessons/:lessonId/quiz/submit
router.post("/lessons/:lessonId/quiz/submit", async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  try {
    let requester = null;
    const h = req.headers.authorization;
    if (h && h.startsWith("Bearer ")) {
      try {
        const payload = verifyToken(h.slice(7));
        requester = { id: payload.sub, role: payload.role };
      } catch (_) {
        requester = null;
      }
    }

    const quizRes = await query(
      "select id from lesson_quizzes where lesson_id = $1",
      [req.params.lessonId]
    );
    if (!quizRes.rowCount) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    const quizId = quizRes.rows[0].id;
    const optionsRes = await query(
      `select qo.id, qo.question_id, qo.is_correct
       from quiz_options qo
       join quiz_questions qq on qq.id = qo.question_id
       where qq.quiz_id = $1`,
      [quizId]
    );

    const questionOptionMap = new Map();
    const correctByQuestion = new Map();
    for (const row of optionsRes.rows) {
      if (!questionOptionMap.has(row.question_id)) {
        questionOptionMap.set(row.question_id, new Set());
      }
      questionOptionMap.get(row.question_id).add(row.id);

      if (row.is_correct) {
        if (!correctByQuestion.has(row.question_id)) {
          correctByQuestion.set(row.question_id, new Set());
        }
        correctByQuestion.get(row.question_id).add(row.id);
      }
    }

    const totalQuestions = questionOptionMap.size;
    let correctCount = 0;

    for (const ans of parsed.data.answers) {
      const options = questionOptionMap.get(ans.questionId);
      if (!options) continue; // skip answers to unknown questions
      if (!options.has(ans.optionId)) continue; // skip option not in question
      const correctSet = correctByQuestion.get(ans.questionId) || new Set();
      if (correctSet.has(ans.optionId)) {
        correctCount += 1;
      }
    }

    const response = { totalQuestions, correctCount };

    if (
      requester &&
      totalQuestions > 0 &&
      correctCount === totalQuestions
    ) {
      try {
        await markLessonCompleted(requester.id, req.params.lessonId);
      } catch (progressErr) {
        console.error("progress update error", progressErr);
      }
    }

    res.json(response);
  } catch (err) {
    console.error("quiz submit error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
