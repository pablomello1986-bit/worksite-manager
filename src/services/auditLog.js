const { db } = require("../db/database");

function writeAuditLog({ entityType, entityId, action, summary, payload }) {
  db.prepare(`
    INSERT INTO audit_logs (entity_type, entity_id, action, summary, payload, created_at)
    VALUES (@entityType, @entityId, @action, @summary, @payload, @createdAt)
  `).run({
    entityType,
    entityId: entityId ?? null,
    action,
    summary,
    payload: payload ? JSON.stringify(payload) : null,
    createdAt: new Date().toISOString(),
  });
}

module.exports = {
  writeAuditLog,
};
