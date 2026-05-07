const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");

const router = express.Router();

const overheadSelect = `
  SELECT
    id,
    category,
    description,
    amount,
    spent_at AS spentAt,
    notes
  FROM overhead_expenses
`;

router.get("/", (_request, response) => {
  const expenses = db
    .prepare(`${overheadSelect} ORDER BY spent_at DESC, id DESC`)
    .all();

  response.json(expenses);
});

router.post("/", (request, response) => {
  const {
    category,
    description,
    amount,
    spentAt,
    notes,
  } = request.body;

  if (!category || !spentAt) {
    return response.status(400).json({ error: "Informe a categoria e a data da despesa extra." });
  }

  const result = db
    .prepare(`
      INSERT INTO overhead_expenses (category, description, amount, spent_at, notes)
      VALUES (@category, @description, @amount, @spentAt, @notes)
    `)
    .run({
      category,
      description: description || null,
      amount: Number(amount || 0),
      spentAt,
      notes: notes || null,
    });

  const expense = db.prepare(`${overheadSelect} WHERE id = ?`).get(result.lastInsertRowid);
  writeAuditLog({
    entityType: "overhead_expense",
    entityId: expense.id,
    action: "create",
    summary: `Despesa extra de ${expense.category} registrada.`,
    payload: expense,
  });
  response.status(201).json(expense);
});

router.patch("/:id", (request, response) => {
  const expenseId = Number(request.params.id);
  const expense = db.prepare("SELECT * FROM overhead_expenses WHERE id = ?").get(expenseId);

  if (!expense) {
    return response.status(404).json({ error: "Despesa extra nao encontrada." });
  }

  db.prepare(`
    UPDATE overhead_expenses
    SET
      category = @category,
      description = @description,
      amount = @amount,
      spent_at = @spentAt,
      notes = @notes
    WHERE id = @expenseId
  `).run({
    category: request.body.category ?? expense.category,
    description: request.body.description ?? expense.description,
    amount: Number(request.body.amount ?? expense.amount),
    spentAt: request.body.spentAt ?? expense.spent_at,
    notes: request.body.notes ?? expense.notes,
    expenseId,
  });

  const updatedExpense = db.prepare(`${overheadSelect} WHERE id = ?`).get(expenseId);
  writeAuditLog({
    entityType: "overhead_expense",
    entityId: updatedExpense.id,
    action: "update",
    summary: `Despesa extra de ${updatedExpense.category} atualizada.`,
    payload: updatedExpense,
  });
  response.json(updatedExpense);
});

router.delete("/:id", (request, response) => {
  const expenseId = Number(request.params.id);
  const expense = db.prepare(`${overheadSelect} WHERE id = ?`).get(expenseId);

  if (!expense) {
    return response.status(404).json({ error: "Despesa extra nao encontrada." });
  }

  db.prepare("DELETE FROM overhead_expenses WHERE id = ?").run(expenseId);
  writeAuditLog({
    entityType: "overhead_expense",
    entityId: expense.id,
    action: "delete",
    summary: `Despesa extra de ${expense.category} removida.`,
    payload: expense,
  });
  response.status(204).send();
});

module.exports = router;
