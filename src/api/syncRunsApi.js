// src/api/syncRunsApi.js
//
// Wrappers for /api/admin/sync/* and /api/user/me.
// All requests use credentials: 'include' so the admin_session cookie is sent.

import { apiUrl } from "../utils/apiBase";

const CRED = { credentials: "include" };

async function jsonOrThrow(res, defaultMsg) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || defaultMsg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const getCurrentUser = async () => {
  const res = await fetch(apiUrl("/user/me"), CRED);
  return jsonOrThrow(res, "Failed to fetch current user");
};

export const backendLogout = async () => {
  const res = await fetch(apiUrl("/user/logout"), {
    method: "POST",
    ...CRED,
  });
  return jsonOrThrow(res, "Failed to logout");
};

export const listRuns = async ({ limit = 50, offset = 0, category, triggered_by, success } = {}) => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (category) params.set("category", category);
  if (triggered_by) params.set("triggered_by", triggered_by);
  if (typeof success === "boolean") params.set("success", String(success));
  const res = await fetch(apiUrl(`/admin/sync/runs?${params.toString()}`), CRED);
  return jsonOrThrow(res, "Failed to list sync runs");
};

export const getRun = async (id) => {
  const res = await fetch(apiUrl(`/admin/sync/runs/${id}`), CRED);
  return jsonOrThrow(res, "Failed to fetch run");
};

export const manualRun = async ({ category, startDate, endDate, dryRun }) => {
  const body = { category };
  if (startDate) body.startDate = startDate;
  if (endDate) body.endDate = endDate;
  if (typeof dryRun === "boolean") body.dryRun = dryRun;
  const res = await fetch(apiUrl("/admin/sync/runs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...CRED,
  });
  return jsonOrThrow(res, "Failed to start manual run");
};

export const retryRun = async (id) => {
  const res = await fetch(apiUrl(`/admin/sync/runs/${id}/retry`), {
    method: "POST",
    ...CRED,
  });
  return jsonOrThrow(res, "Failed to retry run");
};

export const overrideDraw = async (postId, { midday_winnings, evening_winnings }) => {
  const body = {};
  if (midday_winnings !== undefined) body.midday_winnings = midday_winnings;
  if (evening_winnings !== undefined) body.evening_winnings = evening_winnings;
  const res = await fetch(apiUrl(`/admin/sync/draw/${postId}/override`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...CRED,
  });
  return jsonOrThrow(res, "Failed to override draw");
};