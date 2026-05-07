const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");

const router = express.Router();

const laborRecordSelect = `
  SELECT
    lr.id,
    lr.project_id AS projectId,
    p.client_name AS projectClient,
    p.description AS projectDescription,
    lr.employee_id AS employeeId,
    e.name AS employeeName,
    e.role,
    lr.days_worked AS daysWorked,
    lr.amount_paid AS amountPaid,
    lr.work_start_date AS workStartDate,
    lr.work_end_date AS workEndDate,
    lr.notes
  FROM labor_records lr
  INNER JOIN projects p ON p.id = lr.project_id
  INNER JOIN employees e ON e.id = lr.employee_id
`;

router.get("/", (_request, response) => {
  const records = db.prepare(`${laborRecordSelect} ORDER BY COALESCE(lr.work_end_date, lr.work_start_date) DESC, lr.id DESC`).all();
  response.json(records);
});

router.post("/", (request, response) => {
  const {
    projectId,
    employeeId,
    daysWorked,
    amountPaid,
    workStartDate,
    workEndDate,
    notes,
  } = request.body;

  if (!projectId || !employeeId || !workStartDate) {
    return response.status(400).json({ error: "Informe obra, funcionario e data inicial." });
  }

  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(Number(projectId));
  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  const employee = db
    .prepare("SELECT id, daily_rate AS dailyRate FROM employees WHERE id = ?")
    .get(Number(employeeId));
  if (!employee) {
    return response.status(404).json({ error: "Funcionario nao encontrado." });
  }

  const normalizedDaysWorked = Number(daysWorked || 0);
  const calculatedAmountPaid = normalizedDaysWorked * Number(employee.dailyRate || 0);

  const result = db
    .prepare(`
      INSERT INTO labor_records (
        project_id, employee_id, days_worked, amount_paid, work_start_date, work_end_date, notes
      )
      VALUES (
        @projectId, @employeeId, @daysWorked, @amountPaid, @workStartDate, @workEndDate, @notes
      )
    `)
    .run({
      projectId: Number(projectId),
      employeeId: Number(employeeId),
      daysWorked: normalizedDaysWorked,
      amountPaid: calculatedAmountPaid,
      workStartDate,
      workEndDate: workEndDate || null,
      notes: notes || null,
    });

  const record = db
    .prepare(`${laborRecordSelect} WHERE lr.id = ?`)
    .get(result.lastInsertRowid);

  writeAuditLog({
    entityType: "labor_record",
    entityId: record.id,
    action: "create",
    summary: `Pagamento de ${record.employeeName} registrado na obra ${record.projectClient}.`,
    payload: record,
  });

  response.status(201).json(record);
});

router.patch("/:id", (request, response) => {
  const recordId = Number(request.params.id);
  const record = db.prepare("SELECT * FROM labor_records WHERE id = ?").get(recordId);

  if (!record) {
    return response.status(404).json({ error: "Lançamento de pagamento nao encontrado." });
  }

  const projectId = Number(request.body.projectId ?? record.project_id);
  const employeeId = Number(request.body.employeeId ?? record.employee_id);

  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);
  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  const employee = db
    .prepare("SELECT id, daily_rate AS dailyRate FROM employees WHERE id = ?")
    .get(employeeId);
  if (!employee) {
    return response.status(404).json({ error: "Funcionario nao encontrado." });
  }

  const normalizedDaysWorked = Number(request.body.daysWorked ?? record.days_worked);
  const calculatedAmountPaid = normalizedDaysWorked * Number(employee.dailyRate || 0);

  db.prepare(`
    UPDATE labor_records
    SET
      project_id = @projectId,
      employee_id = @employeeId,
      days_worked = @daysWorked,
      amount_paid = @amountPaid,
      work_start_date = @workStartDate,
      work_end_date = @workEndDate,
      notes = @notes
    WHERE id = @recordId
  `).run({
    projectId,
    employeeId,
    daysWorked: normalizedDaysWorked,
    amountPaid: calculatedAmountPaid,
    workStartDate: request.body.workStartDate ?? record.work_start_date,
    workEndDate: request.body.workEndDate ?? record.work_end_date,
    notes: request.body.notes ?? record.notes,
    recordId,
  });

  const updatedRecord = db.prepare(`${laborRecordSelect} WHERE lr.id = ?`).get(recordId);
  writeAuditLog({
    entityType: "labor_record",
    entityId: updatedRecord.id,
    action: "update",
    summary: `Pagamento de ${updatedRecord.employeeName} atualizado na obra ${updatedRecord.projectClient}.`,
    payload: updatedRecord,
  });
  return response.json(updatedRecord);
});

router.delete("/:id", (request, response) => {
  const recordId = Number(request.params.id);
  const record = db.prepare(`${laborRecordSelect} WHERE lr.id = ?`).get(recordId);

  if (!record) {
    return response.status(404).json({ error: "Lancamento de pagamento nao encontrado." });
  }

  db.prepare("DELETE FROM labor_records WHERE id = ?").run(recordId);
  writeAuditLog({
    entityType: "labor_record",
    entityId: recordId,
    action: "delete",
    summary: `Pagamento de ${record.employeeName} removido da obra ${record.projectClient}.`,
    payload: record,
  });
  return response.status(204).send();
});

module.exports = router;
