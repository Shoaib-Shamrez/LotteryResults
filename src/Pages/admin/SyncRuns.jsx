import { memo, useState } from "react";
import SyncRunList from "../../components/admin/syncruns/SyncRunList";
import ManualRunForm from "../../components/admin/syncruns/ManualRunForm";
import RunDetailModal from "../../components/admin/syncruns/RunDetailModal";

const SyncRuns = memo(() => {
  const [showManual, setShowManual] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sync Runs</h1>
          <p className="text-gray-600 mt-1">
            Monitor, retry, and override automated lottery ingestion runs.
          </p>
        </div>
        <button
          onClick={() => setShowManual((v) => !v)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showManual ? "Close" : "Manual run"}
        </button>
      </div>

      {toast && (
        <div
          className={`p-3 rounded-lg border-l-4 text-sm ${
            toast.type === "success"
              ? "bg-green-50 border-green-500 text-green-900"
              : "bg-red-50 border-red-500 text-red-900"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {showManual && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Start a manual sync run</h2>
          <ManualRunForm
            onClose={() => setShowManual(false)}
            onSuccess={(result) =>
              showToast(`Run #${result.runId} completed`, "success")
            }
          />
        </div>
      )}

      <SyncRunList onSelectRun={(run) => setSelectedRun(run)} />

      {selectedRun && (
        <RunDetailModal
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
          onChanged={() => {
            setSelectedRun(null);
            showToast("Run updated", "success");
          }}
        />
      )}
    </div>
  );
});

SyncRuns.displayName = "SyncRuns";
export default SyncRuns;