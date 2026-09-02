import { memo, useState } from "react";
import { overrideDraw } from "../../../api/syncRunsApi";

function parseNumbers(input) {
  if (!input) return undefined;
  return input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const DrawOverrideForm = memo(({ category, onSuccess }) => {
  const [postId, setPostId] = useState("");
  const [midday, setMidday] = useState("");
  const [evening, setEvening] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [audit, setAudit] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setAudit(null);
    try {
      const result = await overrideDraw(parseInt(postId, 10), {
        midday_winnings: parseNumbers(midday),
        evening_winnings: parseNumbers(evening),
      });
      setAudit(result.run?.details || null);
      onSuccess?.(result);
    } catch (err) {
      setError(err.message || "Override failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Override draw (post #{postId || "?"})</h4>
      {error && (
        <div className="p-3 rounded-lg border-l-4 bg-red-50 border-red-500 text-red-900 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Post ID</label>
        <input
          type="number"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Midday numbers (space-separated)</label>
        <input
          type="text"
          value={midday}
          onChange={(e) => setMidday(e.target.value)}
          placeholder="e.g. 05 10 15 20 25"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Evening numbers (space-separated)</label>
        <input
          type="text"
          value={evening}
          onChange={(e) => setEvening(e.target.value)}
          placeholder="e.g. 01 02 03 04 05"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <p className="text-xs text-gray-500">
        Provide at least one of midday/evening. Server-side validator (IngestionValidator) enforces per-game rules.
        Category: <code className="px-1 bg-gray-100 rounded">{category || "?"}</code>
      </p>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !postId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Applying..." : "Apply override"}
        </button>
      </div>

      {audit && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
          <div className="font-semibold text-gray-700">Audit</div>
          <div>Before midday: {JSON.stringify(audit.before?.midday_winnings)}</div>
          <div>After midday: {JSON.stringify(audit.after?.midday_winnings)}</div>
          <div>Before evening: {JSON.stringify(audit.before?.evening_winnings)}</div>
          <div>After evening: {JSON.stringify(audit.after?.evening_winnings)}</div>
        </div>
      )}
    </form>
  );
});

DrawOverrideForm.displayName = "DrawOverrideForm";
export default DrawOverrideForm;