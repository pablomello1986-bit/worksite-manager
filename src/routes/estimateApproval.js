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
    return response.send(alreadyActionedPage(row.client_action));
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

// POST /aprovar/:token — cliente executa acao (aprovar / solicitar ajustes / rejeitar)
router.post("/aprovar/:token", (request, response) => {
  const { token } = request.params;
  const action = (request.body?.action) || "approve";
  const notes = (request.body?.notes || "").trim();

  const row = db.prepare("SELECT * FROM estimate_tokens WHERE token = ?").get(token);

  if (!row) return response.status(404).send(errorPage("Link invalido."));
  if (row.approved_at) return response.send(alreadyActionedPage(row.client_action));
  if (new Date(row.expires_at) < new Date()) return response.status(410).send(errorPage("Link expirado."));

  const now = new Date().toISOString();
  const estimate = getEstimateWithItems(row.estimate_id);

  let status, clientAction, notifType, notifTitle, notifBody;

  if (action === "adjustments") {
    clientAction = "adjustments_requested";
    status = "ajustes_solicitados";
    notifType = "estimate_adjustments_requested";
    notifTitle = `Ajustes solicitados: ${estimate?.workTitle || `#${row.estimate_id}`}`;
    notifBody = `O cliente ${row.client_email} solicitou ajustes no orcamento ${estimate?.estimateNumber || `#${row.estimate_id}`}${notes ? `: "${notes}"` : "."}`;
  } else if (action === "reject") {
    clientAction = "rejected";
    status = "recusado";
    notifType = "estimate_rejected";
    notifTitle = `Orcamento rejeitado: ${estimate?.workTitle || `#${row.estimate_id}`}`;
    notifBody = `O cliente ${row.client_email} rejeitou o orcamento ${estimate?.estimateNumber || `#${row.estimate_id}`}${notes ? `: "${notes}"` : "."}`;
  } else {
    clientAction = "approved";
    status = "aprovado";
    notifType = "estimate_approved";
    notifTitle = `Orcamento aprovado: ${estimate?.workTitle || `#${row.estimate_id}`}`;
    notifBody = `O cliente ${row.client_email} aprovou o orcamento ${estimate?.estimateNumber || `#${row.estimate_id}`} — ${estimate?.workTitle || ""}.`;
  }

  db.prepare("UPDATE estimate_tokens SET approved_at = ?, client_action = ?, client_notes = ? WHERE token = ?")
    .run(now, clientAction, notes, token);
  db.prepare("UPDATE estimates SET status = ? WHERE id = ?").run(status, row.estimate_id);
  db.prepare("INSERT INTO notifications (type, title, body, related_id) VALUES (?, ?, ?, ?)")
    .run(notifType, notifTitle, notifBody, row.estimate_id);

  if (action === "adjustments") return response.send(adjustmentsPage(estimate));
  if (action === "reject") return response.send(rejectedPage(estimate));
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
    .top-logo{width:72px;height:72px;border-radius:14px;object-fit:cover;display:block;margin-bottom:12px}
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
    .approve-bar{position:sticky;bottom:0;background:#fff;border-top:1px solid #e5e7eb;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 -4px 16px rgba(0,0,0,.06);z-index:10}
    .approve-bar .amount{font-size:22px;font-weight:800;color:#1a5446}
    .approve-bar .amount small{font-size:13px;color:#6b7280;font-weight:400;display:block}
    .btn-group{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
    .btn{border:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;transition:opacity .15s}
    .btn:hover{opacity:.85}
    .btn-green{background:#1a5446;color:#fff}
    .btn-amber{background:#d97706;color:#fff}
    .btn-red{background:#dc2626;color:#fff}
    .btn-outline{background:#fff;color:#374151;border:1px solid #d1d5db;padding:11px 20px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
    .btn-outline:hover{background:#f9fafb}
    .action-overlay{display:none;position:fixed;bottom:72px;left:0;right:0;background:#fff;padding:24px 32px;box-shadow:0 -8px 32px rgba(0,0,0,.12);z-index:9;border-top:3px solid}
    .action-overlay.green{border-color:#1a5446}
    .action-overlay.amber{border-color:#d97706}
    .action-overlay.red{border-color:#dc2626}
    .action-overlay h3{margin-bottom:8px;font-size:16px}
    .action-overlay p{color:#6b7280;font-size:14px;margin-bottom:16px;line-height:1.5}
    .action-overlay textarea{width:100%;min-height:100px;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;font-family:inherit;resize:vertical}
    .action-overlay .row{display:flex;gap:10px;justify-content:flex-end;margin-top:14px}
    .action-overlay-inner{max-width:860px;margin:0 auto}
    .tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase}
    .center{text-align:center;padding:60px 20px}
    .center h2{font-size:24px;margin-bottom:12px}
    .center p{color:#6b7280;font-size:15px}
    .icon{font-size:56px;margin-bottom:16px}
    @media(max-width:600px){
      .grid2{grid-template-columns:1fr}
      .approve-bar{flex-direction:column;gap:12px;align-items:stretch}
      .btn-group{justify-content:stretch}
      .btn,.btn-outline{flex:1;text-align:center}
      .action-overlay{bottom:130px}
    }
  </style>
</head>
<body>${body}
<script>
  function openAction(type) {
    document.querySelectorAll('.action-overlay').forEach(function(el){ el.style.display='none'; });
    var el = document.getElementById('overlay-' + type);
    if (el) el.style.display = 'block';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
  function closeAction() {
    document.querySelectorAll('.action-overlay').forEach(function(el){ el.style.display='none'; });
  }
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeAction(); });
</script>
</body>
</html>`;
}

function approvalPage(estimate, token, cfg) {
  const companyName = cfg.company_name || "WorkSite Manager";
  const logoHtml = estimate.businessLogoUrl
    ? `<img src="${estimate.businessLogoUrl}" alt="Logo" class="top-logo">`
    : "";

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

  const total = formatCurrency(estimate.totalAmount);
  const workTitle = estimate.workTitle;

  return baseHtml(`Orcamento — ${workTitle}`, `
    <div class="top">
      ${logoHtml}
      <h1>${companyName}</h1>
      <p>Orcamento No ${estimate.estimateNumber || estimate.id} &nbsp;·&nbsp; ${formatDate(estimate.issueDate)}</p>
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
            <div class="value"><strong>${workTitle}</strong></div>
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
              <td class="r">${total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${estimate.notes ? `<div class="card"><div class="label" style="margin-bottom:8px">Observacoes</div><p style="font-size:14px;color:#374151;line-height:1.6">${estimate.notes}</p></div>` : ""}

      <div style="height:110px"></div>
    </div>

    <!-- Approve overlay -->
    <div id="overlay-approve" class="action-overlay green">
      <div class="action-overlay-inner">
        <h3 style="color:#1a5446">Confirmar aprovacao</h3>
        <p>Voce esta aprovando o orcamento <strong>${workTitle}</strong> no valor de <strong>${total}</strong>.</p>
        <form method="POST" action="/aprovar/${token}" onsubmit="this.querySelector('[type=submit]').disabled=true;this.querySelector('[type=submit]').textContent='Aguarde...'">
          <input type="hidden" name="action" value="approve">
          <div class="row">
            <button type="button" onclick="closeAction()" class="btn-outline">Cancelar</button>
            <button type="submit" class="btn btn-green">Confirmar Aprovacao</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Adjustments overlay -->
    <div id="overlay-adjustments" class="action-overlay amber">
      <div class="action-overlay-inner">
        <h3 style="color:#d97706">Solicitar ajustes</h3>
        <p>Descreva o que precisa ser ajustado no orcamento:</p>
        <form method="POST" action="/aprovar/${token}" onsubmit="this.querySelector('[type=submit]').disabled=true;this.querySelector('[type=submit]').textContent='Enviando...'">
          <input type="hidden" name="action" value="adjustments">
          <textarea name="notes" required placeholder="Ex: Por favor, revise o valor do item X. Gostaria de adicionar Y ao escopo..."></textarea>
          <div class="row">
            <button type="button" onclick="closeAction()" class="btn-outline">Cancelar</button>
            <button type="submit" class="btn btn-amber">Enviar Solicitacao</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reject overlay -->
    <div id="overlay-reject" class="action-overlay red">
      <div class="action-overlay-inner">
        <h3 style="color:#dc2626">Rejeitar orcamento</h3>
        <p>Voce pode informar um motivo (opcional):</p>
        <form method="POST" action="/aprovar/${token}" onsubmit="this.querySelector('[type=submit]').disabled=true;this.querySelector('[type=submit]').textContent='Aguarde...'">
          <input type="hidden" name="action" value="reject">
          <textarea name="notes" placeholder="Ex: O valor esta fora do orcamento disponivel..."></textarea>
          <div class="row">
            <button type="button" onclick="closeAction()" class="btn-outline">Cancelar</button>
            <button type="submit" class="btn btn-red">Confirmar Rejeicao</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Action bar -->
    <div class="approve-bar">
      <div class="amount">
        <small>Valor total do orcamento</small>
        ${total}
      </div>
      <div class="btn-group">
        <button onclick="openAction('reject')" class="btn btn-red">Rejeitar</button>
        <button onclick="openAction('adjustments')" class="btn btn-amber">Solicitar Ajustes</button>
        <button onclick="openAction('approve')" class="btn btn-green">Aprovar</button>
      </div>
    </div>
  `);
}

function successPage(estimate) {
  return baseHtml("Orcamento Aprovado", `
    <div class="center" style="margin-top:80px">
      <div class="icon">&#x2705;</div>
      <h2 style="color:#1a5446">Orcamento Aprovado!</h2>
      <p>Voce aprovou o orcamento <strong>${estimate?.workTitle || ""}</strong>.<br>
      A empresa foi notificada e entrara em contato em breve.</p>
    </div>
  `);
}

function adjustmentsPage(estimate) {
  return baseHtml("Ajustes Solicitados", `
    <div class="center" style="margin-top:80px">
      <div class="icon">&#x270F;&#xFE0F;</div>
      <h2 style="color:#d97706">Ajustes Solicitados!</h2>
      <p>Sua solicitacao foi enviada para <strong>${estimate?.businessName || "a empresa"}</strong>.<br>
      Aguarde o retorno com o orcamento revisado.</p>
    </div>
  `);
}

function rejectedPage(estimate) {
  return baseHtml("Orcamento Rejeitado", `
    <div class="center" style="margin-top:80px">
      <div class="icon">&#x274C;</div>
      <h2 style="color:#dc2626">Orcamento Rejeitado</h2>
      <p>Voce rejeitou o orcamento <strong>${estimate?.workTitle || ""}</strong>.<br>
      A empresa foi notificada.</p>
    </div>
  `);
}

function alreadyActionedPage(clientAction) {
  const map = {
    approved: { icon: "&#x2705;", color: "#1a5446", title: "Orcamento ja aprovado", text: "Este orcamento ja foi aprovado anteriormente. Obrigado!" },
    adjustments_requested: { icon: "&#x270F;&#xFE0F;", color: "#d97706", title: "Ajustes ja solicitados", text: "Voce ja solicitou ajustes para este orcamento. Aguarde o retorno da empresa." },
    rejected: { icon: "&#x274C;", color: "#dc2626", title: "Orcamento ja rejeitado", text: "Este orcamento ja foi rejeitado." },
  };
  const m = map[clientAction] || map.approved;
  return baseHtml(m.title, `
    <div class="center" style="margin-top:80px">
      <div class="icon">${m.icon}</div>
      <h2 style="color:${m.color}">${m.title}</h2>
      <p>${m.text}</p>
    </div>
  `);
}

function errorPage(msg) {
  return baseHtml("Erro", `
    <div class="center" style="margin-top:80px">
      <div class="icon">&#x274C;</div>
      <h2>Link invalido</h2>
      <p>${msg}</p>
    </div>
  `);
}

module.exports = router;
