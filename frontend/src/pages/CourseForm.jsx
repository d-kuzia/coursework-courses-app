import { useState } from "react";

export default function CourseForm({ initialData, onSubmit, submitLabel = "Зберегти" }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({ title, description });
    } catch (err) {
      setError(err.message || "Помилка збереження");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card stack">
      {error && <div className="alert">{error}</div>}
      <div className="stack">
        <label className="label">Назва</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="stack">
        <label className="label">Опис</label>
        <textarea
          className="input textarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button className="button" disabled={loading}>
        {loading ? "Збереження..." : submitLabel}
      </button>
    </form>
  );
}
