const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../db/database");
const { generateEstimatePDF } = require("../services/pdfGenerator");
const { sendApprovalEmail } = require("../services/emailService");

const router = express.Router();

function getEstimateWithItems(estimateId) {
  const estimate = db.prepare(`
    SELECT
      e.id, e.estimate_number AS estimateNumber, e.work_title AS workTitle,
      e.business_name AS businessName, e.business_logo_url AS businessLogoUrl,
      e.issue_date AS issueDate, e.valid_until AS validUntil,
      e.description, e.subtotal, e.discount_amount AS discountAmount,
      e.tax_percent AS taxPercent, e.tax_amount AS taxAmount,
      e.total_amount AS totalAmount, e.status, e.notes,
      c.name AS clientName, c.company_name AS clientCompanyName,
      c.email AS clientEmail, c.phone AS clientPhone, c.address AS clientAddress
    FROM estimates e
    LEFT JOIN clients c ON c.id = e.client_id
    WHERE e.id = ?
  `).get(estimateId);
  if (!estimate) return null;
  estimate.items = db.prepare(`
    SELECT description, quantity, unit_price AS unitPrice, line_total AS lineTotal, process
    FROM estimate_items WHERE estimate_id = ? ORDER BY id ASC
  `).all(estimateId);
  return estimate;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

// POST /api/estimates/:id/send-approval — gera PDF e envia email
router.post("/:id/send-approval", async (request, response) => {
  const estimateId = Number(request.params.id);
  const estimate = getEstimateWithItems(estimateId);
  if (!estimate) return response.status(404).json({ error: "Orcamento nao encontrado." });
  if (!estimate.clientEmail) return response.status(400).json({ error: "O cliente nao possui email cadastrado." });

  try {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO estimate_tokens (estimate_id, token, client_email, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(estimateId, token, estimate.clientEmail, expiresAt);

    const pdfBuffer = await generateEstimatePDF(estimate);
    await sendApprovalEmail({ estimate, token, pdfBuffer });

    db.prepare("UPDATE estimates SET status = 'enviado' WHERE id = ?").run(estimateId);

    return response.json({ success: true, message: `Orcamento enviado para ${estimate.clientEmail}.` });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
});

// GET /aprovar/:token — pagina de aprovacao do cliente
router.get("/aprovar/:token", (request, response) => {
  const { token } = request.params;
  const row = db.prepare(`
    SELECT et.*, e.id AS estimateId
    FROM estimate_tokens et
    JOIN estimates e ON e.id = et.estimate_id
    WHERE et.token = ?
  `).get(token);

  if (!row) {
    return response.status(404).send(errorPage("Link invalido ou expirado."));
  }
  if (row.approved_at) {
    return response.send(alreadyApprovedPage());
  }
  if (new Date(row.expires_at) < new Date()) {
    return response.status(410).send(errorPage("Este link de aprovacao expirou."));
  }

  const estimate = getEstimateWithItems(row.estimateId);
  if (!estimate) return response.status(404).send(errorPage("Orcamento nao encontrado."));

  const settings = db.prepare("SELECT key, value FROM company_settings WHERE key IN ('company_name', 'base_url')").all();
  const cfg = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return response.send(approvalPage(estimate, token, cfg));
});

// POST /aprovar/:token — cliente confirma aprovacao
router.post("/aprovar/:token", (request, response) => {
  const { token } = request.params;
  const row = db.prepare("SELECT * FROM estimate_tokens WHERE token = ?").get(token);

  if (!row) return response.status(404).send(errorPage("Link invalido."));
  if (row.approved_at) return response.send(alreadyApprovedPage());
  if (new Date(row.expires_at) < new Date()) return response.status(410).send(errorPage("Link expirado."));

  const now = new Date().toISOString();
  db.prepare("UPDATE estimate_tokens SET approved_at = ? WHERE token = ?").run(now, token);
  db.prepare("UPDATE estimates SET status = 'aprovado' WHERE id = ?").run(row.estimate_id);

  const estimate = getEstimateWithItems(row.estimate_id);
  db.prepare(`
    INSERT INTO notifications (type, title, body, related_id)
    VALUES ('estimate_approved', ?, ?, ?)
  `).run(
    `Orcamento aprovado: ${estimate?.workTitle || `#${row.estimate_id}`}`,
    `O cliente ${row.client_email} aprovou o orcamento ${estimate?.estimateNumber || `#${row.estimate_id}`} — ${estimate?.workTitle || ""}.`,
    row.estimate_id,
  );

  return response.send(successPage(estimate));
});

// GET /api/notifications
router.get("/notifications", (_req, res) => {
  const rows = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all();
  res.json(rows);
});

// PATCH /api/notifications/:id/read
router.patch("/notifications/:id/read", (req, res) => {
  db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

// GET /api/notifications/unread-count
router.get("/notifications/unread-count", (_req, res) => {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM notifications WHERE read = 0").get();
  res.json({ count });
});

// ── HTML templates ────────────────────────────────────────────────────────────

function baseHtml(title, body) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;color:#111827;min-height:100vh}
    .top{background:#1a5446;padding:20px 32px;color:#fff}
    .top h1{font-size:20px;font-weight:700}
    .top p{font-size:13px;color:#a7d4c8;margin-top:4px}
    .wrap{max-width:860px;margin:32px auto;padding:0 16px}
    .card{background:#fff;border-radius:12px;padding:28px 32px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,.07)}
    .label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;margin-bottom:4px}
    .value{font-size:15px;color:#111827}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
    table{width:100%;border-collapse:collapse;font-size:14px}
    thead tr{background:#f9fafb;border-bottom:2px solid #e5e7eb}
    th{text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;font-weight:700}
    th.r,td.r{text-align:right}
    td{padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151}
    tr:last-child td{border:none}
    .total-row td{font-weight:700;font-size:15px;color:#1a5446;border-top:2px solid #e5e7eb;padding-top:14px}
    .approve-bar{position:sticky;bottom:0;background:#fff;border-top:1px solid #e5e7eb;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 -4px 16px rgba(0,0,0,.06)}
    .approve-bar .amount{font-size:22px;font-weight:800;color:#1a5446}
    .approve-bar .amount small{font-size:13px;color:#6b7280;font-weight:400;display:block}
    .btn{background:#1a5446;color:#fff;border:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;transition:background .2s}
    .btn:hover{background:#14402f}
    .tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase}
    .center{text-align:center;padding:60px 20px}
    .center h2{font-size:24px;margin-bottom:12px}
    .center p{color:#6b7280;font-size:15px}
    .icon{font-size:56px;margin-bottom:16px}
    @media(max-width:600px){.grid2{grid-template-columns:1fr}.approve-bar{flex-direction:column;gap:12px}}
  </style>
</head>
<body>${body}</body>
</html>`;
}

function approvalPage(estimate, token, cfg) {
  const companyName = cfg.company_name || "WorkSite Manager";
  const rows = (estimate.items || []).map((item) => `
    <tr>
      <td>${item.description}${item.process ? `<br><small style="color:#9ca3af">${item.process}</small>` : ""}</td>
      <td class="r">${item.quantity}</td>
      <td class="r">${formatCurrency(item.unitPrice)}</td>
      <td class="r"><strong>${formatCurrency(item.lineTotal)}</strong></td>
    </tr>`).join("");

  const discountRow = Number(estimate.discountAmount) > 0
    ? `<tr><td colspan="3" style="color:#6b7280">Desconto</td><td class="r" style="color:#6b7280">- ${formatCurrency(estimate.discountAmount)}</td></tr>` : "";
  const taxRow = Number(estimate.taxAmount) > 0
    ? `<tr><td colspan="3" style="color:#6b7280">Taxa (${estimate.taxPercent || 0}%)</td><td class="r" style="color:#6b7280">${formatCurrency(estimate.taxAmount)}</td></tr>` : "";

  return baseHtml(`Orcamento — ${estimate.workTitle}`, `
    <div class="top">
      <h1>${companyName}</h1>
      <p>Orcamento Nº ${estimate.estimateNumber || estimate.id} &nbsp;·&nbsp; ${formatDate(estimate.issueDate)}</p>
    </div>
    <div class="wrap">
      <div class="card">
        <div class="grid2" style="margin-bottom:20px">
          <div>
            <div class="label">Cliente</div>
            <div class="value"><strong>${estimate.clientName || "—"}</strong></div>
            ${estimate.clientCompanyName ? `<div style="color:#6b7280;font-size:13px">${estimate.clientCompanyName}</div>` : ""}
          </div>
          <div>
            <div class="label">Trabalho</div>
            <div class="value"><strong>${estimate.workTitle}</strong></div>
            ${estimate.validUntil ? `<div style="color:#6b7280;font-size:13px">Valido ate ${formatDate(estimate.validUntil)}</div>` : ""}
          </div>
        </div>
        ${estimate.description ? `<p style="color:#6b7280;font-size:14px;line-height:1.6;border-top:1px solid #f3f4f6;padding-top:16px">${estimate.description}</p>` : ""}
      </div>

      <div class="card" style="padding:0;overflow:hidden">
        <table>
          <thead>
            <tr>
              <th>Descricao</th>
              <th class="r">Qtd</th>
              <th class="r">Preco Unit.</th>
              <th class="r">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            ${discountRow}
            ${taxRow}
            <tr class="total-row">
              <td colspan="3">TOTAL DO ORCAMENTO</td>
              <td class="r">${formatCurrency(estimate.totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${estimate.notes ? `<div class="card"><div class="label" style="margin-bottom:8px">Observacoes</div><p style="font-size:14px;color:#374151;line-height:1.6">${estimate.notes}</p></div>` : ""}

      <div style="height:90px"></div>
    </div>

    <div class="approve-bar">
      <div class="amount">
        <small>Valor total do orcamento</small>
        ${formatCurrency(estimate.totalAmount)}
      </div>
      <form method="POST" action="/aprovar/${token}" onsubmit="this.querySelector('button').disabled=true;this.querySelector('button').textContent='Aguarde...'">
        <button type="submit" class="btn">Aprovar este Orcamento</button>
      </form>
    </div>
  `);
}

function successPage(estimate) {
  return baseHtml("Orcamento Aprovado", `
    <div class="center" style="margin-top:80px">
      <div class="icon">✅</div>
      <h2 style="color:#1a5446">Orcamento Aprovado!</h2>
      <p>Voce aprovou o orcamento <strong>${estimate?.workTitle || ""}</strong>.<br>
      A empresa foi notificada e entrara em contato em breve.</p>
    </div>
  `);
}

function alreadyApprovedPage() {
  return baseHtml("Ja aprovado", `
    <div class="center" style="margin-top:80px">
      <div class="icon">✅</div>
      <h2 style="color:#1a5446">Orcamento ja aprovado</h2>
      <p>Este orcamento ja foi aprovado anteriormente. Obrigado!</p>
    </div>
  `);
}

function errorPage(msg) {
  return baseHtml("Erro", `
    <div class="center" style="margin-top:80px">
      <div class="icon">❌</div>
      <h2>Link invalido</h2>
      <p>${msg}</p>
    </div>
  `);
}

module.exports = router;
