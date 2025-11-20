import { query } from "../db.js";

export async function markLessonCompleted(userId, lessonId) {
  const metaRes = await query(
    `select l.id, m.course_id
     from lessons l
     join modules m on m.id = l.module_id
     where l.id = $1`,
    [lessonId]
  );
  if (!metaRes.rowCount) return;
  const meta = metaRes.rows[0];

  const enrollmentRes = await query(
    "select id from enrollments where user_id = $1 and course_id = $2",
    [userId, meta.course_id]
  );
  if (!enrollmentRes.rowCount) return;
  const enrollmentId = enrollmentRes.rows[0].id;

  const inserted = await query(
    `insert into lesson_progress (enrollment_id, lesson_id)
     values ($1, $2)
     on conflict (enrollment_id, lesson_id) do nothing
     returning id`,
    [enrollmentId, lessonId]
  );
  if (!inserted.rowCount) return;

  const completedRes = await query(
    "select count(*)::int as cnt from lesson_progress where enrollment_id = $1",
    [enrollmentId]
  );
  const totalRes = await query(
    `select count(*)::int as cnt
     from lessons l
     join modules m on m.id = l.module_id
     where m.course_id = $1`,
    [meta.course_id]
  );
  const completed = completedRes.rows[0].cnt;
  const total = totalRes.rows[0].cnt || 0;
  if (!total) return;

  const progress = Math.min(100, Math.round((completed / total) * 100));
  await query("update enrollments set progress = $1 where id = $2", [
    progress,
    enrollmentId
  ]);
}
