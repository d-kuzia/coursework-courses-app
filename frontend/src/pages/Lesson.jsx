import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLesson, getQuiz, saveQuiz, submitQuiz } from "../api/lessons";
import { useAuth } from "../context/AuthContext";

function getYouTubeEmbed(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
  } catch {
    return null;
  }
  return url;
}

function makeEmptyQuiz() {
  return {
    questions: [
      {
        text: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false }
        ]
      }
    ]
  };
}

function cloneDraft(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function quizToDraft(quiz) {
  if (!quiz) return makeEmptyQuiz();
  return {
    questions: (quiz.questions || []).map((q) => {
      let hasCorrect = false;
      const opts = (q.options || []).map((o) => {
        const isCorrect = Boolean(o.isCorrect) && !hasCorrect;
        if (isCorrect) hasCorrect = true;
        return { text: o.text, isCorrect };
      });
      if (!hasCorrect && opts.length) {
        opts[0].isCorrect = true;
      }
      return { text: q.text, options: opts.length ? opts : makeEmptyQuiz().questions[0].options };
    })
  };
}

export default function Lesson() {
  const { id } = useParams();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizDraft, setQuizDraft] = useState(makeEmptyQuiz());
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizError, setQuizError] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizSaveError, setQuizSaveError] = useState("");
  const [editingQuiz, setEditingQuiz] = useState(false);

  useEffect(() => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setQuiz(null);
    Promise.all([getLesson(id), getQuiz(id)])
      .then(([lessonData, quizData]) => {
        setLesson(lessonData.lesson);
        setQuiz(quizData.quiz);
        setQuizDraft(quizToDraft(quizData.quiz));
      })
      .catch((err) => setError(err.message || "Не вдалося завантажити"))
      .finally(() => setLoading(false));
  }, [id]);

  const embedUrl = useMemo(() => getYouTubeEmbed(lesson?.video_url), [lesson]);

  const canEditQuiz =
    user &&
    lesson &&
    (user.role === "ADMIN" || user.role === "TEACHER") &&
    user.id === lesson.course_teacher_id;

  function onChangeAnswer(questionId, optionId) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmitQuiz() {
    if (!quiz) return;
    setQuizError("");
    setQuizLoading(true);
    try {
      const payload = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId
      }));
      const res = await submitQuiz(id, payload);
      setResult(res);
    } catch (err) {
      setQuizError(err.message || "Не вдалося перевірити");
    } finally {
      setQuizLoading(false);
    }
  }

  function updateQuestion(idx, field, value) {
    setQuizDraft((prev) => {
      const next = cloneDraft(prev);
      next.questions[idx][field] = value;
      return next;
    });
  }

  function updateOption(qIdx, oIdx, field, value) {
    setQuizDraft((prev) => {
      const next = cloneDraft(prev);
      next.questions[qIdx].options[oIdx][field] = value;
      return next;
    });
  }

  function addQuestion() {
    setQuizDraft((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), ...makeEmptyQuiz().questions]
    }));
  }

  function removeQuestion(idx) {
    setQuizDraft((prev) => {
      const next = cloneDraft(prev);
      next.questions.splice(idx, 1);
      return next;
    });
  }

  function addOption(qIdx) {
    setQuizDraft((prev) => {
      const next = cloneDraft(prev);
      next.questions[qIdx].options.push({ text: "", isCorrect: false });
      return next;
    });
  }

  function removeOption(qIdx, oIdx) {
    setQuizDraft((prev) => {
      const next = cloneDraft(prev);
      next.questions[qIdx].options.splice(oIdx, 1);
      if (!next.questions[qIdx].options.length) {
        next.questions[qIdx].options = makeEmptyQuiz().questions[0].options;
      }
      if (!next.questions[qIdx].options.some((opt) => opt.isCorrect)) {
        next.questions[qIdx].options[0].isCorrect = true;
      }
      return next;
    });
  }

  function setCorrectOption(qIdx, oIdx) {
    setQuizDraft((prev) => {
      const next = cloneDraft(prev);
      next.questions[qIdx].options = next.questions[qIdx].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === oIdx
      }));
      return next;
    });
  }

  async function handleSaveQuiz(e) {
    e.preventDefault();
    setQuizSaveError("");
    setQuizSaving(true);
    try {
      for (const q of quizDraft.questions) {
        if (!q.text.trim()) throw new Error("У кожного питання має бути текст");
        if (!q.options || q.options.length < 2) throw new Error("Мінімум 2 варіанти на питання");
        if (!q.options.some((o) => o.isCorrect)) throw new Error("У кожного питання має бути правильний варіант");
      }

      const payload = {
        questions: quizDraft.questions.map((q, idx) => ({
          text: q.text,
          position: idx + 1,
          options: q.options.map((o) => ({
            text: o.text,
            isCorrect: !!o.isCorrect
          }))
        }))
      };
      await saveQuiz(id, payload);
      const refreshed = await getQuiz(id);
      setQuiz(refreshed.quiz);
      setEditingQuiz(false);
    } catch (err) {
      setQuizSaveError(err.message || "Не вдалося зберегти тест");
    } finally {
      setQuizSaving(false);
    }
  }

  if (loading) return <div className="card">Завантаження...</div>;
  if (error) return <div className="card alert">{error}</div>;
  if (!lesson) return <div className="card">Урок не знайдено</div>;

  return (
    <div className="stack-lg">
      <div className="card stack">
        <div className="flex-between">
          <div className="stack">
            <p className="muted" style={{ fontSize: 13 }}>
              <Link to={`/courses/${lesson.course_id}`}>До курсу: {lesson.course_title}</Link>
              {" / "}
              {lesson.module_title}
            </p>
            <h1 className="title" style={{ marginBottom: 4 }}>
              {lesson.title}
            </h1>
          </div>
        </div>
        {lesson.content && (
          <p className="subtitle" style={{ whiteSpace: "pre-line" }}>
            {lesson.content}
          </p>
        )}
        {embedUrl && (
          <div className="video-wrapper" style={{ marginTop: 16 }}>
            <iframe
              width="100%"
              height="360"
              src={embedUrl}
              title="Lesson video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      <div className="card stack">
        <div className="flex-between">
          <h2 className="title" style={{ fontSize: 18 }}>
            Тест
          </h2>
          {canEditQuiz && (
            <div className="flex" style={{ gap: 8 }}>
              <button
                className="button button-ghost"
                onClick={() => {
                  setEditingQuiz((v) => !v);
                  setQuizSaveError("");
                  setQuizDraft(quizToDraft(quiz));
                }}
              >
                {editingQuiz ? "Скасувати" : quiz ? "Редагувати тест" : "Створити тест"}
              </button>
            </div>
          )}
        </div>

        {editingQuiz && (
          <form className="stack" onSubmit={handleSaveQuiz}>
            {quizSaveError && <div className="alert">{quizSaveError}</div>}
            {quizDraft.questions.map((q, idx) => (
              <div key={idx} className="card stack">
                <div className="flex-between">
                  <div className="title" style={{ fontSize: 16 }}>
                    Питання {idx + 1}
                  </div>
                  {quizDraft.questions.length > 1 && (
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => removeQuestion(idx)}
                    >
                      Видалити
                    </button>
                  )}
                </div>
                <input
                  className="input"
                  placeholder="Текст питання"
                  value={q.text}
                  onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                  required
                />
                <div className="stack">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={opt.isCorrect}
                        onChange={() => setCorrectOption(idx, oIdx)}
                        title="Правильна відповідь"
                      />
                      <input
                        className="input"
                        placeholder="Текст варіанту"
                        value={opt.text}
                        onChange={(e) => updateOption(idx, oIdx, "text", e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          className="button button-ghost"
                          onClick={() => removeOption(idx, oIdx)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => addOption(idx)}
                  >
                    Додати варіант
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="button button-ghost" onClick={addQuestion}>
              Додати питання
            </button>
            <button className="button" type="submit" disabled={quizSaving}>
              {quizSaving ? "Збереження..." : "Зберегти тест"}
            </button>
          </form>
        )}

        {!editingQuiz && !quiz && <div className="muted">У цього уроку ще немає тесту.</div>}

        {!editingQuiz && quiz && (
          <div className="stack">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="card stack">
                <div className="title" style={{ fontSize: 16 }}>
                  {idx + 1}. {q.text}
                </div>
                <div className="stack">
                  {q.options.map((opt) => (
                    <label
                      key={opt.id}
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt.id}
                        checked={answers[q.id] === opt.id}
                        onChange={() => onChangeAnswer(q.id, opt.id)}
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {quizError && <div className="alert">{quizError}</div>}
            <button className="button" onClick={handleSubmitQuiz} disabled={quizLoading}>
              {quizLoading ? "Перевірка..." : "Перевірити результат"}
            </button>
            {result && (
              <div
                className={`alert${
                  result.correctCount === result.totalQuestions ? " success" : ""
                }`}
              >
                Правильних відповідей: {result.correctCount} / {result.totalQuestions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
