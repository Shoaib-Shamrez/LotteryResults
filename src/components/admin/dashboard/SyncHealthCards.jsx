import { memo, useEffect, useState } from "react";
import { getSyncHealth } from "../../../api/syncRunsApi";

function fmt(s) {
  if (!s) return "—";
  return new Date(s).toLocaleString();
}

const StatCard = memo(({ title, value, icon, color = "blue", subtitle }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-50 text-gray-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {subtitle && <p className="text-xs text-gray-500 mb-1">{subtitle}</p>}
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 break-words break-all">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = "StatCard";

const SyncHealthCards = memo(() => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHealth() {
      try {
        setLoading(true);
        setError("");
        const data = await getSyncHealth();
        setHealth(data?.health || null);
      } catch (err) {
        setError(err.message || "Failed to load sync health");
        setHealth(null);
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-32 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border-l-4 bg-red-50 border-red-500 text-red-900 text-sm">
        Unable to load sync health: {error}
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-sm text-gray-500">
        No sync health data available.
      </div>
    );
  }

  const lastRun = health.lastRun;
  const lastRunSuccess = lastRun ? lastRun.success : null;
  const lastRunStatus = lastRun
    ? lastRunSuccess
      ? "Success"
      : lastRunSuccess === false
        ? "Failed"
        : "In Progress"
    : "No runs yet";

  const lastRunColor = lastRun
    ? lastRunSuccess
      ? "green"
      : lastRunSuccess === false
        ? "red"
        : "yellow"
    : "gray";

  const scheduler = health.scheduler || {};
  const schedulerActive = scheduler.initialized && scheduler.active;
  const schedulerStatusText = scheduler.initialized
    ? scheduler.running
      ? "Running"
      : schedulerActive
        ? "Active"
        : "Registered"
    : "Not initialized";

  const schedulerColor = scheduler.initialized ? (scheduler.running ? "yellow" : "green") : "gray";

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Runs"
          value={health.totalRuns}
          icon="📊"
          color="blue"
        />
        <StatCard
          title="Success Rate"
          value={`${health.successRate}%`}
          subtitle={`${health.successfulRuns} success / ${health.failedRuns} failed`}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Failures (24h)"
          value={health.failures24h}
          icon="⚠️"
          color={health.failures24h > 0 ? "red" : "green"}
        />
        <StatCard
          title="Failures (7d)"
          value={health.failures7d}
          icon="⚠️"
          color={health.failures7d > 0 ? "red" : "green"}
        />
      </div>

      {/* Last run + scheduler status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard
          title="Last Run"
          value={lastRunStatus}
          subtitle={lastRun ? `Started: ${fmt(lastRun.start_time)}` : undefined}
          icon="⏱️"
          color={lastRunColor}
        />
        <StatCard
          title="Scheduler"
          value={schedulerStatusText}
          subtitle={scheduler.cron ? `Cron: ${scheduler.cron}` : undefined}
          icon="🔁"
          color={schedulerColor}
        />
      </div>

      {/* Error / details */}
      {health.lastError && (
        <div className="p-3 rounded-lg border-l-4 bg-red-50 border-red-500 text-red-900 text-sm break-words">
          <span className="font-medium">Last error:</span> {health.lastError}
        </div>
      )}

      {scheduler.lastError && (
        <div className="p-3 rounded-lg border-l-4 bg-yellow-50 border-yellow-500 text-yellow-900 text-sm">
          <span className="font-medium">Scheduler issue:</span> {scheduler.lastError}
        </div>
      )}

      {/* Next scheduled run — not available due to node-cron v3 public API limitations */}
      <div className="text-xs text-gray-500">
        Next scheduled run: not available (node-cron v3.0.3 does not expose next-run time via public API)
      </div>
    </div>
  );
});

SyncHealthCards.displayName = "SyncHealthCards";

export default SyncHealthCards;
