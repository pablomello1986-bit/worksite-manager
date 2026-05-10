const express = require("express");
const { db } = require("../db/database");

const router = express.Router();

function formatUSD(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-US").format(new Date(`${dateString}T00:00:00`));
}

function buildTimeline(projectId, startDate) {
  const events = [];

  if (startDate) {
    events.push({ date: startDate, label: "Project started", type: "start" });
  }

  const receipts = db.prepare("SELECT amount, received_at AS date, notes FROM receipts WHERE project_id = ? ORDER BY received_at ASC").all(projectId);
  receipts.forEach((r) => events.push({ date: r.date, label: `Payment received: ${formatUSD(r.amount)}${r.notes ? ` — ${r.notes}` : ""}`, type: "payment" }));

  const materials = db.prepare("SELECT name, cost, purchased_at AS date FROM materials WHERE project_id = ? ORDER BY purchased_at ASC").all(projectId);
  materials.forEach((m) => events.push({ date: m.date, label: `Materials: ${m.name} (${formatUSD(m.cost)})`, type: "material" }));

  const labor = db.prepare(`
    SELECT e.name AS employee, lr.amount_paid AS amount, lr.work_start_date AS date, lr.work_end_date AS endDate
    FROM labor_records lr JOIN employees e ON e.id = lr.employee_id
    WHERE lr.project_id = ? ORDER BY lr.work_start_date ASC
  `).all(projectId);
  labor.forEach((l) => events.push({ date: l.endDate || l.date, label: `Work: ${l.employee} — ${formatUSD(l.amount)}`, type: "work" }));

  return events.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}

function portalPage({ project, tasks, photos, timeline }) {
  const pct = Math.min(100, Math.max(0, project.progressPercent || 0));
  const receivedPct = project.totalValue > 0 ? Math.min(100, Math.round((project.receivedAmount / project.totalValue) * 100)) : 0;
  const tasksDone = tasks.filter((t) => t.completed).length;
  const phaseLabels = { before: "Before", progress: "Progress", after: "After / Completed" };

  const photosByPhase = {};
  photos.forEach((p) => { (photosByPhase[p.phase] = photosByPhase[p.phase] || []).push(p); });

  const timelineIcons = { start: "🏗️", payment: "💰", material: "🧱", work: "👷" };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.clientName} — Project Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f5f7fa; color: #1a1a2e; min-height: 100vh; }
    .portal-wrap { max-width: 720px; margin: 0 auto; padding: 24px 16px 60px; }
    .portal-header { background: #1a5446; color: #fff; border-radius: 16px; padding: 28px 28px 24px; margin-bottom: 20px; }
    .portal-header .company { font-size: 0.75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .7; margin-bottom: 6px; }
    .portal-header h1 { font-size: 1.5rem; font-weight: 700; line-height: 1.25; margin-bottom: 6px; }
    .portal-header .sub { font-size: 0.88rem; opacity: .75; }
    .status-badge { display: inline-block; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); border-radius: 20px; padding: 3px 12px; font-size: 0.75rem; font-weight: 600; margin-top: 10px; }
    .card { background: #fff; border-radius: 14px; border: 1px solid #e8eaed; padding: 22px 24px; margin-bottom: 16px; }
    .card-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #888; margin-bottom: 14px; }
    .progress-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .progress-label span { font-size: 0.88rem; color: #555; }
    .progress-label strong { font-size: 1rem; font-weight: 700; color: #1a5446; }
    .track { height: 14px; background: #e8f4f1; border-radius: 20px; overflow: hidden; }
    .fill { height: 100%; background: linear-gradient(90deg, #1a5446, #2d8a6e); border-radius: 20px; transition: width .5s; }
    .fill-payment { background: linear-gradient(90deg, #2563eb, #60a5fa); }
    .payment-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .pay-cell { text-align: center; padding: 14px 10px; border-radius: 10px; }
    .pay-cell span { display: block; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: #888; margin-bottom: 4px; }
    .pay-cell strong { font-size: 1.05rem; font-weight: 700; }
    .pay-cell.contracted { background: #f0f9ff; } .pay-cell.contracted strong { color: #1e40af; }
    .pay-cell.received { background: #f0fdf4; } .pay-cell.received strong { color: #166534; }
    .pay-cell.outstanding { background: #fff7ed; } .pay-cell.outstanding strong { color: #9a3412; }
    .task-list { list-style: none; }
    .task-item { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
    .task-item:last-child { border-bottom: none; }
    .task-icon { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
    .task-icon.done { background: #dcfce7; color: #16a34a; }
    .task-icon.pending { background: #f3f4f6; color: #9ca3af; }
    .task-item.done-item span { color: #6b7280; text-decoration: line-through; }
    .task-item.pending-item span { color: #111; }
    .progress-summary { display: flex; justify-content: space-between; font-size: 0.8rem; color: #888; margin-top: 8px; }
    .timeline-list { list-style: none; position: relative; padding-left: 28px; }
    .timeline-list::before { content: ''; position: absolute; left: 9px; top: 6px; bottom: 6px; width: 2px; background: #e8eaed; }
    .tl-item { position: relative; padding: 0 0 14px 16px; font-size: 0.85rem; }
    .tl-item::before { content: ''; position: absolute; left: -5px; top: 4px; width: 12px; height: 12px; background: #fff; border: 2px solid #1a5446; border-radius: 50%; }
    .tl-date { font-size: 0.75rem; color: #888; margin-bottom: 2px; }
    .tl-label { color: #333; }
    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
    .photo-item { border-radius: 10px; overflow: hidden; aspect-ratio: 4/3; position: relative; background: #f3f4f6; }
    .photo-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .photo-caption { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,.7)); color: #fff; font-size: 0.72rem; padding: 20px 8px 6px; }
    .phase-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #555; margin: 14px 0 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item span { display: block; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #999; margin-bottom: 2px; }
    .info-item p { font-size: 0.88rem; color: #333; }
    .empty-note { color: #aaa; font-size: 0.85rem; text-align: center; padding: 20px 0; }
    .footer { text-align: center; font-size: 0.75rem; color: #bbb; margin-top: 32px; }
    @media (max-width: 480px) {
      .payment-grid { grid-template-columns: 1fr 1fr; }
      .info-grid { grid-template-columns: 1fr; }
      .photo-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
    }
  </style>
</head>
<body>
  <div class="portal-wrap">
    <div class="portal-header">
      <p class="company">WorkSite Manager — Client Portal</p>
      <h1>${project.clientName}</h1>
      <p class="sub">${project.description}${project.address ? ` · ${project.address}` : ""}</p>
      <span class="status-badge">${project.status === "concluido" ? "✅ Completed" : "🔨 In Progress"}</span>
    </div>

    <!-- Project Info -->
    <div class="card">
      <p class="card-title">Project details</p>
      <div class="info-grid">
        ${[
          ["Start date", formatDate(project.startDate)],
          ["Estimated duration", project.estimatedDays ? `${project.estimatedDays} days` : "—"],
          ["Project type", project.projectType || "—"],
          ["Manager", project.managerName || "—"],
        ].map(([k, v]) => `<div class="info-item"><span>${k}</span><p>${v}</p></div>`).join("")}
      </div>
    </div>

    <!-- Progress -->
    <div class="card">
      <p class="card-title">Project progress</p>
      <div class="progress-label">
        <span>Overall completion</span>
        <strong>${pct}%</strong>
      </div>
      <div class="track"><div class="fill" style="width:${pct}%"></div></div>
      ${tasks.length ? `<p class="progress-summary"><span>${tasksDone} of ${tasks.length} tasks completed</span><span>${tasks.length - tasksDone} remaining</span></p>` : ""}
    </div>

    <!-- Payment Status -->
    <div class="card">
      <p class="card-title">Payment status</p>
      <div class="payment-grid">
        <div class="pay-cell contracted"><span>Contract</span><strong>${formatUSD(project.totalValue)}</strong></div>
        <div class="pay-cell received"><span>Received</span><strong>${formatUSD(project.receivedAmount)}</strong></div>
        <div class="pay-cell outstanding"><span>Outstanding</span><strong>${formatUSD(project.remainingToReceive)}</strong></div>
      </div>
      <div class="progress-label">
        <span>Payment progress</span>
        <strong>${receivedPct}%</strong>
      </div>
      <div class="track"><div class="fill fill-payment" style="width:${receivedPct}%"></div></div>
    </div>

    <!-- Tasks -->
    ${tasks.length ? `
    <div class="card">
      <p class="card-title">Checklist (${tasksDone}/${tasks.length} done)</p>
      <ul class="task-list">
        ${tasks.map((t) => `
          <li class="task-item ${t.completed ? "done-item" : "pending-item"}">
            <div class="task-icon ${t.completed ? "done" : "pending"}">${t.completed ? "✓" : "○"}</div>
            <span>${t.description}</span>
          </li>
        `).join("")}
      </ul>
    </div>` : ""}

    <!-- Photos -->
    ${photos.length ? `
    <div class="card">
      <p class="card-title">Project photos</p>
      ${["before", "progress", "after"].filter((ph) => photosByPhase[ph]?.length).map((ph) => `
        <p class="phase-label">${phaseLabels[ph]}</p>
        <div class="photo-grid">
          ${photosByPhase[ph].map((p) => `
            <div class="photo-item">
              <img src="${p.url}" alt="${p.caption || ph}" loading="lazy" onerror="this.parentElement.style.display='none'">
              ${p.caption ? `<div class="photo-caption">${p.caption}</div>` : ""}
            </div>
          `).join("")}
        </div>
      `).join("")}
    </div>` : ""}

    <!-- Timeline -->
    ${timeline.length ? `
    <div class="card">
      <p class="card-title">Project timeline</p>
      <ul class="timeline-list">
        ${timeline.map((e) => `
          <li class="tl-item">
            <p class="tl-date">${formatDate(e.date)}</p>
            <p class="tl-label">${timelineIcons[e.type] || "•"} ${e.label}</p>
          </li>
        `).join("")}
      </ul>
    </div>` : ""}

    <p class="footer">This page is read-only and was shared by the contractor. · WorkSite Manager</p>
  </div>
</body>
</html>`;
}

router.get("/project-view/:token", (request, response) => {
  const row = db.prepare("SELECT project_id FROM project_tokens WHERE token = ?").get(request.params.token);
  if (!row) return response.status(404).send("<h2>Link not found or expired.</h2>");

  const project = db.prepare(`
    SELECT p.*,
      COALESCE((SELECT SUM(r.amount) FROM receipts r WHERE r.project_id = p.id), 0) AS receivedAmount,
      COALESCE(p.progress_percent, 0) AS progressPercent
    FROM projects p WHERE p.id = ?
  `).get(row.project_id);
  if (!project) return response.status(404).send("<h2>Project not found.</h2>");

  project.remainingToReceive = Math.max(0, project.total_value - project.receivedAmount);
  project.totalValue = project.total_value;
  project.clientName = project.client_name;
  project.description = project.description;
  project.address = project.address;
  project.projectType = project.project_type;
  project.managerName = project.manager_name;
  project.startDate = project.start_date;
  project.estimatedDays = project.estimated_days;

  const tasks = db.prepare(
    "SELECT description, completed, completed_at AS completedAt FROM project_tasks WHERE project_id = ? ORDER BY display_order ASC, id ASC"
  ).all(row.project_id);

  const photos = db.prepare(
    "SELECT url, caption, phase FROM project_photos WHERE project_id = ? ORDER BY phase ASC, id ASC"
  ).all(row.project_id);

  const timeline = buildTimeline(row.project_id, project.start_date);

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.send(portalPage({ project, tasks, photos, timeline }));
});

module.exports = router;
