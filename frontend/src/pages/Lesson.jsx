import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getLesson, getQuiz, saveQuiz, submitQuiz } from "../api/lessons";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";

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
  const { t } = useI18n();

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
      .catch((err) => setError(err.message || t("lessons.loadError")))
      .finally(() => setLoading(false));
  }, [id, t]);

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
      setQuizError(err.message || t("lessons.checkError"));
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
        if (!q.text.trim()) throw new Error(t("lessons.validation.textRequired"));
        if (!q.options || q.options.length < 2) throw new Error(t("lessons.validation.optionMin"));
        if (!q.options.some((o) => o.isCorrect)) {
          throw new Error(t("lessons.validation.correctRequired"));
        }
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
      setQuizSaveError(err.message || t("lessons.saveQuizError"));
    } finally {
      setQuizSaving(false);
    }
  }

  if (loading) return <div className="card">{t("common.loading")}</div>;
  if (error) return <div className="card alert">{error}</div>;
  if (!lesson) return <div className="card">{t("lessons.notFound")}</div>;

  return (
    <div className="stack-lg">
      <div className="card lesson-crumb">
        <p className="lesson-crumb-eyebrow">
          {t("nav.courses")} / {t("courseDetails.modulesTitle")}
        </p>
        <div className="lesson-crumb-links">
          <Link
            to={`/courses/${lesson.course_id}`}
            className="lesson-crumb-link"
            aria-label={t("lessons.backToCourse", { title: lesson.course_title })}
          >
            {lesson.course_title}
          </Link>
          <span className="lesson-crumb-divider">/</span>
          <span className="lesson-crumb-module">{lesson.module_title}</span>
        </div>
      </div>
      <div className="card stack">
        <div className="flex-between">
          <div className="stack">
            <h1 className="title" style={{ marginBottom: 4 }}>
              {lesson.title}
            </h1>
          </div>
        </div>
        {lesson.content && (
          <div className="lesson-content">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
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
            {t("lessons.quizTitle")}
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
                {editingQuiz
                  ? t("common.cancel")
                  : quiz
                    ? t("lessons.editQuiz")
                    : t("lessons.createQuiz")}
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
                    {t("lessons.questionTitle", { index: idx + 1 })}
                  </div>
                  {quizDraft.questions.length > 1 && (
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => removeQuestion(idx)}
                    >
                      {t("common.delete")}
                    </button>
                  )}
                </div>
                <input
                  className="input"
                  placeholder={t("lessons.questionPlaceholder")}
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
                        title={t("lessons.correctAnswer")}
                      />
                      <input
                        className="input"
                        placeholder={t("lessons.optionPlaceholder")}
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
                    {t("lessons.addOption")}
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="button button-ghost" onClick={addQuestion}>
              {t("lessons.addQuestion")}
            </button>
            <button className="button" type="submit" disabled={quizSaving}>
              {quizSaving ? t("lessons.savingQuiz") : t("lessons.saveQuiz")}
            </button>
          </form>
        )}

        {!editingQuiz && !quiz && <div className="muted">{t("lessons.noQuiz")}</div>}

        {!editingQuiz && quiz && (
          <div className="stack">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="card stack">
                <div className="title" style={{ fontSize: 16 }}>
                  {idx + 1}. {q.text}
                </div>
                <div className="stack quiz-options">
                  {q.options.map((opt, optionIndex) => {
                    const selected = answers[q.id] === opt.id;
                    const optionLabel = String.fromCharCode(65 + optionIndex);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`quiz-option${selected ? " selected" : ""}`}
                        onClick={() => onChangeAnswer(q.id, opt.id)}
                        aria-pressed={selected}
                      >
                        <span className="quiz-option-marker">{optionLabel}</span>
                        <span className="quiz-option-text">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {quizError && <div className="alert">{quizError}</div>}
            <button className="button" onClick={handleSubmitQuiz} disabled={quizLoading}>
              {quizLoading ? t("lessons.submittingQuiz") : t("lessons.submitQuiz")}
            </button>
            {result && (
              <div
                className={`alert alert-flat${
                  result.correctCount === result.totalQuestions ? " success" : " error"
                }`}
              >
                {t("lessons.resultSummary", {
                  correct: result.correctCount,
                  total: result.totalQuestions
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
