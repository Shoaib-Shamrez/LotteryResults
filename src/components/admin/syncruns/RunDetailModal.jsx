import { memo, useState, useEffect } from "react";
import { getRun, retryRun } from "../../../api/syncRunsApi";
import DrawOverrideForm from "./DrawOverrideForm";

function fmt(s) {
  if (!s) return "—";
  return new Date(s).toLocaleString();
}

const RunDetailModal = memo(({ run, onClose, onChanged }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    if (!run) return;
    setLoading(true);
    setError("");
    getRun(run.id)
      .then((data) => setDetail(data))
      .catch((err) => setError(err.message || "Failed to load run"))
      .finally(() => setLoading(false));
  }, [run]);

  const handleRetry = async () => {
    setActionError("");
    setActionMessage("");
    try {
      const result = await retryRun(run.id);
      setActionMessage(`Retry created run #${result.runId}`);
      onChanged?.();
    } catch (err) {
      setActionError(err.message || "Retry failed");
    }
  };

  if (!run) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Sync Run #{run.id}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {loading && <div className="text-sm text-gray-600">Loading run details…</div>}
          {error && (
            <div className="p-3 rounded-lg border-l-4 bg-red-50 border-red-500 text-red-900 text-sm">
              {error}
            </div>
          )}
          {actionError && (
            <div className="p-3 rounded-lg border-l-4 bg-red-50 border-red-500 text-red-900 text-sm">
              {actionError}
            </div>
          )}
          {actionMessage && (
            <div className="p-3 rounded-lg border-l-4 bg-green-50 border-green-500 text-green-900 text-sm">
              {actionMessage}
            </div>
          )}

          {detail?.run && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <dl className="grid grid-cols-2 gap-2">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900">{detail.run.category}</dd>
                <dt className="text-gray-500">Trigger</dt>
                <dd className="text-gray-900">{detail.run.triggered_by}</dd>
                <dt className="text-gray-500">Date range</dt>
                <dd className="text-gray-900">
                  {detail.run.start_date || "—"} → {detail.run.end_date || "—"}
                </dd>
                <dt className="text-gray-500">Started</dt>
                <dd className="text-gray-900">{fmt(detail.run.start_time)}</dd>
                <dt className="text-gray-500">Ended</dt>
                <dd className="text-gray-900">{fmt(detail.run.end_time)}</dd>
                <dt className="text-gray-500">Success</dt>
                <dd className="text-gray-900">{String(detail.run.success)}</dd>
                {detail.run.message && (
                  <>
                    <dt className="text-gray-500">Message</dt>
                    <dd className="text-gray-900">{detail.run.message}</dd>
                  </>
                )}
              </dl>
            </div>
          )}

          {detail?.logs?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Linked sync_logs ({detail.logs.length})
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Success</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Duration</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detail.logs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-3 py-2">#{log.id}</td>
                        <td className="px-3 py-2">{log.sync_date}</td>
                        <td className="px-3 py-2">{log.category}</td>
                        <td className="px-3 py-2">{String(log.success)}</td>
                        <td className="px-3 py-2">{log.duration_ms ?? "—"} ms</td>
                        <td className="px-3 py-2">
                          {Array.isArray(log.errors) && log.errors.length > 0
                            ? log.errors.length
                            : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry this run
            </button>
            <button
              onClick={() => setShowOverride((v) => !v)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              {showOverride ? "Hide override form" : "Override draw"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>

          {showOverride && (
            <div className="border-t border-gray-200 pt-4">
              <DrawOverrideForm
                category={detail?.run?.category}
                onSuccess={() => {
                  setActionMessage("Override applied successfully");
                  setShowOverride(false);
                  onChanged?.();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

RunDetailModal.displayName = "RunDetailModal";
export default RunDetailModal;