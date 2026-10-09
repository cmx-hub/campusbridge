(() => {
"use strict";
const API = "https://campusbridge-backend-production-4b21.up.railway.app";
const $ = id => document.getElementById(id);
let token = "";

function findToken() {
  const likely = ["token", "campusbridge_token", "authToken", "access_token", "jwt"];
  for (const key of likely) {
    const value = localStorage.getItem(key);
    if (value && value.split(".").length === 3) return value;
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = key ? localStorage.getItem(key) : "";
    if (value && value.split(".").length === 3) return value;
    if (value) {
      try {
        const parsed = JSON.parse(value);
        for (const field of ["token", "access_token", "authToken"]) {
          if (parsed[field] && parsed[field].split(".").length === 3) return parsed[field];
        }
      } catch (_) {}
    }
  }
  return "";
}

function message(text, type = "") {
  const el = $("message");
  el.textContent = text;
  el.className = "notice" + (type ? " " + type : "");
  el.hidden = false;
}
function hideMessage() { $("message").hidden = true; }

async function api(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: {
      "Authorization": "Bearer " + token,
      ...(options.body ? {"Content-Type": "application/json"} : {}),
      ...(options.headers || {})
    }
  });
  let data = {};
  try { data = await response.json(); } catch (_) {}
  if (response.status === 401) {
    window.location.href = "login.html";
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!response.ok) throw new Error(data.error || data.message || "Request failed (" + response.status + ").");
  return data;
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
}
function statusPill(value) {
  const status = String(value || "pending").toLowerCase();
  const cls = ["approved", "rejected", "pending"].includes(status) ? status : "";
  return '<span class="pill ' + cls + '">' + safe(status.replace(/_/g, " ")) + "</span>";
}
function renderSubmissions(items) {
  $("count-all").textContent = items.length;
  $("count-pending").textContent = items.filter(x => String(x.approval_status || "pending").toLowerCase() === "pending").length;
  $("count-approved").textContent = items.filter(x => String(x.approval_status || "").toLowerCase() === "approved").length;
  $("count-rejected").textContent = items.filter(x => String(x.approval_status || "").toLowerCase() === "rejected").length;
  const list = $("submission-list");
  if (!items.length) {
    list.innerHTML = '<div class="empty">You have not submitted any opportunities yet. Use the form to add your first one.</div>';
    return;
  }
  list.innerHTML = items.map(item => `
    <article class="submission">
      <h3>${safe(item.title)}</h3>
      <p>${safe(item.category || "Uncategorized")} · ${safe(item.location || "Location not specified")}</p>
      <p>Review: ${statusPill(item.approval_status)}</p>
      <p>Source verification: ${statusPill(item.verification_status)}</p>
      ${item.deadline ? `<p>Deadline: ${safe(String(item.deadline).slice(0,10))}</p>` : ""}
      ${item.source_url ? `<p><a href="${safe(item.source_url)}" target="_blank" rel="noopener noreferrer">View source</a></p>` : ""}
    </article>`).join("");
}
async function loadProfile() {
  const data = await api("/api/organization/profile");
  const profile = data.profile || {};
  $("org-name").textContent = profile.organization_name || "Organization account";
  $("verification-status").textContent = "Organization: " + String(profile.verification_status || "pending").replace(/_/g, " ");
  $("verification-status").className = "pill " + (profile.verification_status === "approved" ? "approved" : "pending");
  $("logout").textContent = "↪  Sign out";
  $("logout").href = "#";
  $("logout").addEventListener("click", event => {
    event.preventDefault();
    for (const key of ["token", "campusbridge_token", "authToken", "access_token", "jwt"]) localStorage.removeItem(key);
    window.location.href = "login.html";
  }, {once:true});
}
async function loadSubmissions() {
  const data = await api("/api/organization/opportunities");
  renderSubmissions(data.opportunities || []);
}
async function refreshAll() {
  try {
    await Promise.all([loadProfile(), loadSubmissions()]);
  } catch (error) {
    message(error.message, "error");
    $("submission-list").innerHTML = '<div class="empty">Could not load submissions. Use Refresh submissions to try again.</div>';
  }
}

$("opportunity-form").addEventListener("submit", async event => {
  event.preventDefault();
  hideMessage();
  const button = $("submit-button");
  button.disabled = true;
  button.textContent = "Submitting…";
  try {
    const profileData = await api("/api/organization/profile");
    const organization = profileData.profile && profileData.profile.organization_name;
    if (!organization) throw new Error("Your organization name is missing from your profile.");
    const payload = {
      title: $("title").value.trim(),
      category: $("category").value,
      description: $("description").value.trim(),
      source_url: $("source_url").value.trim(),
      organization,
      location: $("location").value.trim(),
      deadline: $("deadline").value || null
    };
    const result = await api("/api/opportunities/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    message(result.message || "Opportunity submitted for review.", "success");
    $("opportunity-form").reset();
    await loadSubmissions();
    $("submissions").scrollIntoView({behavior:"smooth", block:"start"});
  } catch (error) {
    message(error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "Submit for review";
  }
});
$("refresh").addEventListener("click", async () => {
  try { hideMessage(); await loadSubmissions(); message("Your submissions are up to date.", "success"); }
  catch (error) { message(error.message, "error"); }
});

token = findToken();
if (!token) {
  message("Please sign in with your organization account to continue.", "error");
  window.location.href = "login.html";
} else {
  refreshAll();
}
})();