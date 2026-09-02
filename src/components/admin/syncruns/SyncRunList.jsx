import { memo, useState, useEffect, useMemo } from "react";
import { listRuns } from "../../../api/syncRunsApi";

const TRIGGERED_BY_OPTIONS = ["", "manual", "scheduled", "retry", "override"];
const SUCCESS_OPTIONS = [
  { value: "", label: "Any" },
  { value: "true", label: "Success" },
  { value: "false", label: "Failure" },
];

function fmtDuration(ms) {
  if (!Number.isFinite(ms) || ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${(ms / 60000).toFixed(1)} min`;
}

function fmtDate(s) {
  if (!s) return "—";
  return new Date(s).toLocaleString();
}

function fmtRange(run) {
  if (!run.start_date && !run.end_date) return "—";
  if (run.start_date && run.end_date && run.start_date !== run.end_date) {
    return `${run.start_date} → ${run.end_date}`;
  }
  return run.start_date || run.end_date;
}

const SyncRunList = memo(({ onSelectRun }) => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTriggeredBy, setFilterTriggeredBy] = useState("");
  const [filterSuccess, setFilterSuccess] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const offset = useMemo(() => (page - 1) * limit, [page]);

  async function fetchRuns() {
    setLoading(true);
    setError("");
    try {
      const data = await listRuns({
        limit,
        offset,
        category: filterCategory || undefined,
        triggered_by: filterTriggeredBy || undefined,
        success: filterSuccess === "" ? undefined : filterSuccess === "true",
      });
      setRuns(data.runs || []);
    } catch (err) {
      setError(err.message || "Failed to load runs");
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterTriggeredBy, filterSuccess, page]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Category"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterTriggeredBy}
            onChange={(e) => { setFilterTriggeredBy(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any trigger</option>
            {TRIGGERED_BY_OPTIONS.filter(Boolean).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select
            value={filterSuccess}
            onChange={(e) => { setFilterSuccess(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUCCESS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => { setPage(1); fetchRuns(); }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border-l-4 bg-red-50 border-red-500 text-red-900 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date / Range</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{run.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{run.category}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {run.triggered_by}
                    </span>
                    {run.dry_run && (
                      <span className="ml-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">dry</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmtRange(run)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmtDate(run.start_time)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {run.end_time ? fmtDuration(new Date(run.end_time) - new Date(run.start_time)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {run.success === true && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">success</span>
                    )}
                    {run.success === false && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">failure</span>
                    )}
                    {run.success === null && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">running</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => onSelectRun(run)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && runs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No sync runs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={runs.length < limit}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
});

SyncRunList.displayName = "SyncRunList";
export default SyncRunList;