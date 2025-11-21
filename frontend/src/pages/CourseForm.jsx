import { useState } from "react";
import { useI18n } from "../hooks/useI18n";

export default function CourseForm({ initialData, onSubmit, submitLabel }) {
  const { t } = useI18n();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resolvedSubmitLabel = submitLabel ?? t("common.save");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({ title, description });
    } catch (err) {
      setError(err.message || t("common.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card stack">
      {error && <div className="alert">{error}</div>}
      <div className="stack">
        <label className="label">{t("courseForm.nameLabel")}</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="stack">
        <label className="label">{t("courseForm.descriptionLabel")}</label>
        <textarea
          className="input textarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button className="button" disabled={loading}>
        {loading ? t("common.saving") : resolvedSubmitLabel}
      </button>
    </form>
  );
}
