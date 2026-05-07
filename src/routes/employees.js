const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");

const router = express.Router();

router.get("/", (_request, response) => {
  const employees = db
    .prepare(`
      SELECT
        id,
        name,
        role,
        phone,
        document_id AS documentId,
        pix_key AS pixKey,
        daily_rate AS dailyRate,
        hourly_rate AS hourlyRate,
        is_active AS isActive
      FROM employees
      ORDER BY name ASC
    `)
    .all()
    .map((employee) => ({
      ...employee,
      isActive: Boolean(employee.isActive),
    }));

  response.json(employees);
});

router.post("/", (request, response) => {
  const {
    name,
    role,
    phone,
    documentId,
    pixKey,
    dailyRate,
    hourlyRate,
    isActive,
  } = request.body;

  if (!name) {
    return response.status(400).json({ error: "Informe o nome do funcionario." });
  }

  const result = db
    .prepare(`
      INSERT INTO employees (name, role, phone, document_id, pix_key, daily_rate, hourly_rate, is_active)
      VALUES (@name, @role, @phone, @documentId, @pixKey, @dailyRate, @hourlyRate, @isActive)
    `)
    .run({
      name,
      role: role || null,
      phone: phone || null,
      documentId: documentId || null,
      pixKey: pixKey || null,
      dailyRate: Number(dailyRate || 0),
      hourlyRate: Number(hourlyRate || 0),
      isActive: isActive === "false" || isActive === false ? 0 : 1,
    });

  const employee = db
    .prepare(`
      SELECT
        id,
        name,
        role,
        phone,
        document_id AS documentId,
        pix_key AS pixKey,
        daily_rate AS dailyRate,
        hourly_rate AS hourlyRate,
        is_active AS isActive
      FROM employees
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);

  const normalizedEmployee = {
    ...employee,
    isActive: Boolean(employee.isActive),
  };

  writeAuditLog({
    entityType: "employee",
    entityId: employee.id,
    action: "create",
    summary: `Funcionario ${employee.name} cadastrado.`,
    payload: normalizedEmployee,
  });

  response.status(201).json(normalizedEmployee);
});

router.patch("/:id", (request, response) => {
  const employeeId = Number(request.params.id);
  const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(employeeId);

  if (!employee) {
    return response.status(404).json({ error: "Funcionario nao encontrado." });
  }

  db.prepare(`
    UPDATE employees
    SET
      name = @name,
      role = @role,
      phone = @phone,
      document_id = @documentId,
      pix_key = @pixKey,
      daily_rate = @dailyRate,
      hourly_rate = @hourlyRate,
      is_active = @isActive
    WHERE id = @employeeId
  `).run({
    name: request.body.name ?? employee.name,
    role: request.body.role ?? employee.role,
    phone: request.body.phone ?? employee.phone,
    documentId: request.body.documentId ?? employee.document_id,
    pixKey: request.body.pixKey ?? employee.pix_key,
    dailyRate: Number(request.body.dailyRate ?? employee.daily_rate),
    hourlyRate: Number(request.body.hourlyRate ?? employee.hourly_rate),
    isActive:
      request.body.isActive === undefined
        ? employee.is_active
        : request.body.isActive === "false" || request.body.isActive === false
          ? 0
          : 1,
    employeeId,
  });

  const updatedEmployee = db
    .prepare(`
      SELECT
        id,
        name,
        role,
        phone,
        document_id AS documentId,
        pix_key AS pixKey,
        daily_rate AS dailyRate,
        hourly_rate AS hourlyRate,
        is_active AS isActive
      FROM employees
      WHERE id = ?
    `)
    .get(employeeId);

  const normalizedEmployee = {
    ...updatedEmployee,
    isActive: Boolean(updatedEmployee.isActive),
  };

  writeAuditLog({
    entityType: "employee",
    entityId: updatedEmployee.id,
    action: "update",
    summary: `Cadastro de ${updatedEmployee.name} atualizado.`,
    payload: normalizedEmployee,
  });

  return response.json(normalizedEmployee);
});

router.delete("/:id", (request, response) => {
  const employeeId = Number(request.params.id);
  const employee = db.prepare("SELECT id, name FROM employees WHERE id = ?").get(employeeId);

  if (!employee) {
    return response.status(404).json({ error: "Funcionario nao encontrado." });
  }

  db.prepare("DELETE FROM employees WHERE id = ?").run(employeeId);
  writeAuditLog({
    entityType: "employee",
    entityId: employeeId,
    action: "delete",
    summary: `Funcionario ${employee.name} removido do cadastro.`,
    payload: employee,
  });
  return response.status(204).send();
});

module.exports = router;
