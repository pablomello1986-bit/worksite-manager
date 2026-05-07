const nodemailer = require("nodemailer");
const { db } = require("../db/database");

function getEmailSettings() {
  const rows = db
    .prepare("SELECT key, value FROM company_settings WHERE key IN ('email_from', 'email_password', 'base_url', 'company_name')")
    .all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function createTransporter(settings) {
  return nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: settings.email_from,
      pass: settings.email_password,
    },
    tls: { ciphers: "SSLv3", rejectUnauthorized: false },
  });
}

async function sendApprovalEmail({ estimate, token, pdfBuffer }) {
  const settings = getEmailSettings();

  if (!settings.email_from || !settings.email_password) {
    throw new Error("Configure o email e senha do Outlook nas Configuracoes antes de enviar.");
  }
  if (!settings.base_url) {
    throw new Error("Configure a URL publica do sistema nas Configuracoes antes de enviar.");
  }

  const toEmail = estimate.clientEmail;
  if (!toEmail) {
    throw new Error("O cliente nao possui email cadastrado.");
  }

  const approvalUrl = `${settings.base_url.replace(/\/$/, "")}/aprovar/${token}`;
  const companyName = settings.company_name || settings.email_from;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
        <div style="background:#1a5446;padding:32px 40px;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;">${companyName}</h1>
          <p style="color:#a7d4c8;margin:8px 0 0;font-size:14px;">Orcamento Nº ${estimate.estimateNumber || estimate.id}</p>
        </div>
        <div style="padding:32px 40px;">
          <p style="color:#374151;font-size:16px;margin:0 0 8px;">Ola, <strong>${estimate.clientName || "cliente"}</strong>!</p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Segue em anexo o orcamento referente ao servico <strong>${estimate.workTitle}</strong>.<br>
            Para visualizar o orcamento completo e aprovar online, clique no botao abaixo.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${approvalUrl}" style="background:#1a5446;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
              Ver e Aprovar Orcamento
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
            Ou copie e cole este link no navegador:<br>
            <span style="color:#1a5446;">${approvalUrl}</span>
          </p>
        </div>
        <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
            Este email foi enviado por ${companyName}. O orcamento em PDF esta em anexo.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter(settings);
  await transporter.sendMail({
    from: `"${companyName}" <${settings.email_from}>`,
    to: toEmail,
    subject: `Orcamento ${estimate.estimateNumber || `#${estimate.id}`} — ${estimate.workTitle}`,
    html,
    attachments: [
      {
        filename: `Orcamento-${estimate.estimateNumber || estimate.id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

module.exports = { sendApprovalEmail, getEmailSettings };
