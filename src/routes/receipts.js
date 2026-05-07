const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");

const router = express.Router();

const receiptSelect = `
  SELECT
    r.id,
    r.project_id AS projectId,
    p.client_name AS projectClient,
    p.description AS projectDescription,
    r.amount,
    r.received_at AS receivedAt,
    r.notes
  FROM receipts r
  INNER JOIN projects p ON p.id = r.project_id
`;

router.get("/", (request, response) => {
  const projectId = request.query.projectId ? Number(request.query.projectId) : null;
  const sql = projectId
    ? `${receiptSelect} WHERE r.project_id = ? ORDER BY r.received_at DESC, r.id DESC`
    : `${receiptSelect} ORDER BY r.received_at DESC, r.id DESC`;

  const receipts = projectId ? db.prepare(sql).all(projectId) : db.prepare(sql).all();
  response.json(receipts);
});

router.post("/", (request, response) => {
  const { projectId, amount, receivedAt, notes } = request.body;

  if (!projectId || !receivedAt) {
    return response.status(400).json({ error: "Informe a obra e a data do recebimento." });
  }

  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(Number(projectId));
  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  const result = db
    .prepare(`
      INSERT INTO receipts (project_id, amount, received_at, notes)
      VALUES (@projectId, @amount, @receivedAt, @notes)
    `)
    .run({
      projectId: Number(projectId),
      amount: Number(amount || 0),
      receivedAt,
      notes: notes || null,
    });

  const receipt = db.prepare(`${receiptSelect} WHERE r.id = ?`).get(result.lastInsertRowid);
  writeAuditLog({
    entityType: "receipt",
    entityId: receipt.id,
    action: "create",
    summary: `Recebimento lancado para a obra ${receipt.projectClient}.`,
    payload: receipt,
  });
  response.status(201).json(receipt);
});

router.patch("/:id", (request, response) => {
  const receiptId = Number(request.params.id);
  const receipt = db.prepare("SELECT * FROM receipts WHERE id = ?").get(receiptId);

  if (!receipt) {
    return response.status(404).json({ error: "Recebimento nao encontrado." });
  }

  const projectId = Number(request.body.projectId ?? receipt.project_id);
  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);
  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  db.prepare(`
    UPDATE receipts
    SET
      project_id = @projectId,
      amount = @amount,
      received_at = @receivedAt,
      notes = @notes
    WHERE id = @receiptId
  `).run({
    projectId,
    amount: Number(request.body.amount ?? receipt.amount),
    receivedAt: request.body.receivedAt ?? receipt.received_at,
    notes: request.body.notes ?? receipt.notes,
    receiptId,
  });

  const updatedReceipt = db.prepare(`${receiptSelect} WHERE r.id = ?`).get(receiptId);
  writeAuditLog({
    entityType: "receipt",
    entityId: updatedReceipt.id,
    action: "update",
    summary: `Recebimento atualizado para a obra ${updatedReceipt.projectClient}.`,
    payload: updatedReceipt,
  });
  return response.json(updatedReceipt);
});

router.delete("/:id", (request, response) => {
  const receiptId = Number(request.params.id);
  const receipt = db.prepare(`${receiptSelect} WHERE r.id = ?`).get(receiptId);

  if (!receipt) {
    return response.status(404).json({ error: "Recebimento nao encontrado." });
  }

  db.prepare("DELETE FROM receipts WHERE id = ?").run(receiptId);
  writeAuditLog({
    entityType: "receipt",
    entityId: receiptId,
    action: "delete",
    summary: `Recebimento removido da obra ${receipt.projectClient}.`,
    payload: receipt,
  });
  return response.status(204).send();
});

module.exports = router;
