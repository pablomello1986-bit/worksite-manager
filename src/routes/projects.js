const crypto = require("node:crypto");
const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");
const {
  getProjectWithMetricsById,
  getProjectsWithMetrics,
} = require("../services/projectMetrics");

const router = express.Router();

function getProjectAssignments(projectId) {
  return db
    .prepare(`
      SELECT
        pa.id,
        pa.project_id AS projectId,
        pa.employee_id AS employeeId,
        e.name AS employeeName,
        e.role,
        e.phone,
        e.daily_rate AS dailyRate,
        pa.assigned_at AS assignedAt,
        pa.notes
      FROM project_assignments pa
      INNER JOIN employees e ON e.id = pa.employee_id
      WHERE pa.project_id = ?
      ORDER BY e.name ASC
    `)
    .all(projectId);
}

function getTotalReceipts(projectId) {
  const result = db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM receipts WHERE project_id = ?")
    .get(projectId);
  return Number(result?.total || 0);
}

router.get("/", (request, response) => {
  const status = request.query.status;
  response.json(getProjectsWithMetrics(status ? { status } : {}));
});

router.get("/:id", (request, response) => {
  const project = getProjectWithMetricsById(Number(request.params.id));

  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  return response.json(project);
});

router.get("/:id/overview", (request, response) => {
  const projectId = Number(request.params.id);
  const project = getProjectWithMetricsById(projectId);

  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  const laborRecords = db
    .prepare(`
      SELECT
        lr.id,
        e.name AS employeeName,
        lr.days_worked AS daysWorked,
        lr.amount_paid AS amountPaid,
        lr.work_start_date AS workStartDate,
        lr.work_end_date AS workEndDate,
        lr.notes
      FROM labor_records lr
      INNER JOIN employees e ON e.id = lr.employee_id
      WHERE lr.project_id = ?
      ORDER BY COALESCE(lr.work_end_date, lr.work_start_date) DESC, lr.id DESC
    `)
    .all(projectId);

  const materials = db
    .prepare(`
      SELECT
        id,
        name,
        category,
        supplier,
        invoice_number AS invoiceNumber,
        unit,
        quantity,
        unit_price AS unitPrice,
        cost,
        payment_status AS paymentStatus,
        purchased_at AS purchasedAt
      FROM materials
      WHERE project_id = ?
      ORDER BY purchased_at DESC, id DESC
    `)
    .all(projectId);

  return response.json({
    project,
    assignments: getProjectAssignments(projectId),
    laborRecords,
    materials,
  });
});

router.post("/", (request, response) => {
  const {
    clientName,
    clientPhone,
    projectType,
    address,
    managerName,
    description,
    totalValue,
    budgetValue,
    receivedAmount,
    paymentMethod,
    installmentInfo,
    dueDate,
    startDate,
    estimatedDays,
    status = "em andamento",
    notes,
  } = request.body;

  if (!clientName || !description || !startDate) {
    return response.status(400).json({ error: "Preencha os campos obrigatorios da obra." });
  }

  const result = db
    .prepare(`
      INSERT INTO projects (
        client_id, estimate_id, client_name, client_phone, project_type, address, manager_name, description,
        total_value, budget_value, received_amount, payment_method, installment_info,
        due_date, start_date, estimated_days, status, notes
      )
      VALUES (
        @clientId, @estimateId, @clientName, @clientPhone, @projectType, @address, @managerName, @description,
        @totalValue, @budgetValue, @receivedAmount, @paymentMethod, @installmentInfo,
        @dueDate, @startDate, @estimatedDays, @status, @notes
      )
    `)
    .run({
      clientId: request.body.clientId ? Number(request.body.clientId) : null,
      estimateId: request.body.estimateId ? Number(request.body.estimateId) : null,
      clientName,
      clientPhone: clientPhone || null,
      projectType: projectType || null,
      address: address || null,
      managerName: managerName || null,
      description,
      totalValue: Number(totalValue || 0),
      budgetValue: Number(budgetValue || 0),
      receivedAmount: Number(receivedAmount || 0),
      paymentMethod: paymentMethod || null,
      installmentInfo: installmentInfo || null,
      dueDate: dueDate || null,
      startDate,
      estimatedDays: Number(estimatedDays || 0),
      status,
      notes: notes || null,
    });

  const initialReceivedAmount = Number(receivedAmount || 0);
  if (initialReceivedAmount > 0) {
    db.prepare(`
      INSERT INTO receipts (project_id, amount, received_at, notes)
      VALUES (?, ?, ?, ?)
    `).run(
      result.lastInsertRowid,
      initialReceivedAmount,
      startDate || new Date().toISOString().slice(0, 10),
      "Recebimento inicial informado no cadastro da obra",
    );
  }

  const createdProject = getProjectWithMetricsById(result.lastInsertRowid);
  writeAuditLog({
    entityType: "project",
    entityId: createdProject.id,
    action: "create",
    summary: `Obra ${createdProject.clientName} - ${createdProject.description} cadastrada.`,
    payload: createdProject,
  });

  return response.status(201).json(createdProject);
});

router.patch("/:id", (request, response) => {
  const projectId = Number(request.params.id);
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);

  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  const nextStatus = request.body.status ?? project.status;
  const currentReceived = getTotalReceipts(projectId);
  const desiredReceived = request.body.receivedAmount === undefined
    ? currentReceived
    : Number(request.body.receivedAmount);

  db.prepare(`
    UPDATE projects
    SET
      client_id = @clientId,
      estimate_id = @estimateId,
      client_name = @clientName,
      client_phone = @clientPhone,
      project_type = @projectType,
      address = @address,
      manager_name = @managerName,
      description = @description,
      total_value = @totalValue,
      budget_value = @budgetValue,
      received_amount = @storedReceivedAmount,
      payment_method = @paymentMethod,
      installment_info = @installmentInfo,
      due_date = @dueDate,
      start_date = @startDate,
      estimated_days = @estimatedDays,
      status = @status,
      notes = @notes,
      completed_at = @completedAt,
      progress_percent = @progressPercent
    WHERE id = @projectId
  `).run({
    clientId: request.body.clientId === undefined ? project.client_id : request.body.clientId ? Number(request.body.clientId) : null,
    estimateId: request.body.estimateId === undefined ? project.estimate_id : request.body.estimateId ? Number(request.body.estimateId) : null,
    clientName: request.body.clientName ?? project.client_name,
    clientPhone: request.body.clientPhone ?? project.client_phone,
    projectType: request.body.projectType ?? project.project_type,
    address: request.body.address ?? project.address,
    managerName: request.body.managerName ?? project.manager_name,
    description: request.body.description ?? project.description,
    totalValue: Number(request.body.totalValue ?? project.total_value),
    budgetValue: Number(request.body.budgetValue ?? project.budget_value),
    storedReceivedAmount: desiredReceived,
    paymentMethod: request.body.paymentMethod ?? project.payment_method,
    installmentInfo: request.body.installmentInfo ?? project.installment_info,
    dueDate: request.body.dueDate ?? project.due_date,
    startDate: request.body.startDate ?? project.start_date,
    estimatedDays: Number(request.body.estimatedDays ?? project.estimated_days),
    status: nextStatus,
    notes: request.body.notes ?? project.notes,
    completedAt: nextStatus === "concluido" ? project.completed_at || new Date().toISOString() : null,
    progressPercent: request.body.progressPercent !== undefined ? Number(request.body.progressPercent) : Number(project.progress_percent || 0),
    projectId,
  });

  const adjustment = desiredReceived - currentReceived;
  if (request.body.receivedAmount !== undefined && adjustment !== 0) {
    db.prepare(`
      INSERT INTO receipts (project_id, amount, received_at, notes)
      VALUES (?, ?, ?, ?)
    `).run(
      projectId,
      adjustment,
      new Date().toISOString().slice(0, 10),
      "Ajuste manual do valor recebido na obra",
    );
  }

  const updatedProject = getProjectWithMetricsById(projectId);
  writeAuditLog({
    entityType: "project",
    entityId: updatedProject.id,
    action: "update",
    summary: `Obra ${updatedProject.clientName} - ${updatedProject.description} atualizada.`,
    payload: updatedProject,
  });

  return response.json(updatedProject);
});

router.patch("/:id/complete", (request, response) => {
  const projectId = Number(request.params.id);
  const result = db
    .prepare(`
      UPDATE projects
      SET status = 'concluido', completed_at = @completedAt
      WHERE id = @projectId
    `)
    .run({
      completedAt: new Date().toISOString(),
      projectId,
    });

  if (!result.changes) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  const completedProject = getProjectWithMetricsById(projectId);
  writeAuditLog({
    entityType: "project",
    entityId: completedProject.id,
    action: "complete",
    summary: `Obra ${completedProject.clientName} marcada como concluida.`,
    payload: completedProject,
  });

  return response.json(completedProject);
});

router.get("/:id/assignments", (request, response) => {
  const projectId = Number(request.params.id);
  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);

  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  return response.json(getProjectAssignments(projectId));
});

router.post("/:id/assignments", (request, response) => {
  const projectId = Number(request.params.id);
  const { employeeId, assignedAt, notes } = request.body;

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  if (project.status !== "em andamento") {
    return response.status(400).json({ error: "So e possivel incluir funcionarios em obras em andamento." });
  }

  if (!employeeId) {
    return response.status(400).json({ error: "Selecione um funcionario." });
  }

  const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(Number(employeeId));
  if (!employee) {
    return response.status(404).json({ error: "Funcionario nao encontrado." });
  }

  try {
    const result = db
      .prepare(`
        INSERT INTO project_assignments (project_id, employee_id, assigned_at, notes)
        VALUES (@projectId, @employeeId, @assignedAt, @notes)
      `)
      .run({
        projectId,
        employeeId: Number(employeeId),
        assignedAt: assignedAt || new Date().toISOString().slice(0, 10),
        notes: notes || null,
      });

    const assignment = db
      .prepare(`
        SELECT
          pa.id,
          pa.project_id AS projectId,
          pa.employee_id AS employeeId,
          e.name AS employeeName,
          e.role,
          e.phone,
          e.daily_rate AS dailyRate,
          pa.assigned_at AS assignedAt,
          pa.notes
        FROM project_assignments pa
        INNER JOIN employees e ON e.id = pa.employee_id
        WHERE pa.id = ?
      `)
      .get(result.lastInsertRowid);

    writeAuditLog({
      entityType: "assignment",
      entityId: assignment.id,
      action: "create",
      summary: `Funcionario ${assignment.employeeName} vinculado a obra ${project.client_name}.`,
      payload: assignment,
    });

    return response.status(201).json(assignment);
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return response.status(400).json({ error: "Este funcionario ja esta vinculado a esta obra." });
    }

    throw error;
  }
});

router.delete("/:projectId/assignments/:assignmentId", (request, response) => {
  const projectId = Number(request.params.projectId);
  const assignmentId = Number(request.params.assignmentId);
  const project = db.prepare("SELECT client_name FROM projects WHERE id = ?").get(projectId);

  const result = db
    .prepare("DELETE FROM project_assignments WHERE id = ? AND project_id = ?")
    .run(assignmentId, projectId);

  if (!result.changes) {
    return response.status(404).json({ error: "Vinculo nao encontrado." });
  }

  writeAuditLog({
    entityType: "assignment",
    entityId: assignmentId,
    action: "delete",
    summary: `Vinculo removido da obra ${project?.client_name || projectId}.`,
    payload: { projectId, assignmentId },
  });

  return response.status(204).send();
});

// ── Client portal token ──────────────────────────────────────────────────────

router.post("/:id/generate-token", (request, response) => {
  const projectId = Number(request.params.id);
  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);
  if (!project) return response.status(404).json({ error: "Project not found." });

  const token = crypto.randomBytes(24).toString("hex");
  db.prepare(`
    INSERT INTO project_tokens (project_id, token)
    VALUES (@projectId, @token)
    ON CONFLICT(project_id) DO UPDATE SET token = @token, created_at = CURRENT_TIMESTAMP
  `).run({ projectId, token });
  response.json({ token });
});

router.get("/:id/portal-token", (request, response) => {
  const projectId = Number(request.params.id);
  const row = db.prepare("SELECT token FROM project_tokens WHERE project_id = ?").get(projectId);
  response.json({ token: row?.token || null });
});

// ── Project tasks ─────────────────────────────────────────────────────────────

router.get("/:id/tasks", (request, response) => {
  const tasks = db.prepare(
    "SELECT id, description, completed, completed_at AS completedAt, display_order AS displayOrder FROM project_tasks WHERE project_id = ? ORDER BY display_order ASC, id ASC"
  ).all(Number(request.params.id));
  response.json(tasks);
});

router.post("/:id/tasks", (request, response) => {
  const projectId = Number(request.params.id);
  const { description, displayOrder } = request.body;
  if (!description) return response.status(400).json({ error: "Task description is required." });
  const result = db.prepare(
    "INSERT INTO project_tasks (project_id, description, display_order) VALUES (?, ?, ?)"
  ).run(projectId, description.trim(), Number(displayOrder || 0));
  response.status(201).json(db.prepare("SELECT id, description, completed, completed_at AS completedAt, display_order AS displayOrder FROM project_tasks WHERE id = ?").get(result.lastInsertRowid));
});

router.patch("/tasks/:taskId", (request, response) => {
  const taskId = Number(request.params.taskId);
  const task = db.prepare("SELECT * FROM project_tasks WHERE id = ?").get(taskId);
  if (!task) return response.status(404).json({ error: "Task not found." });
  const completed = request.body.completed !== undefined ? (request.body.completed ? 1 : 0) : task.completed;
  const description = request.body.description ?? task.description;
  db.prepare(`
    UPDATE project_tasks SET completed = @completed, completed_at = @completedAt, description = @description WHERE id = @id
  `).run({
    completed,
    completedAt: completed && !task.completed_at ? new Date().toISOString().slice(0, 10) : (!completed ? null : task.completed_at),
    description,
    id: taskId,
  });
  response.json(db.prepare("SELECT id, description, completed, completed_at AS completedAt, display_order AS displayOrder FROM project_tasks WHERE id = ?").get(taskId));
});

router.delete("/tasks/:taskId", (request, response) => {
  db.prepare("DELETE FROM project_tasks WHERE id = ?").run(Number(request.params.taskId));
  response.status(204).end();
});

// ── Project photos ────────────────────────────────────────────────────────────

router.get("/:id/photos", (request, response) => {
  response.json(db.prepare(
    "SELECT id, url, caption, phase, taken_at AS takenAt FROM project_photos WHERE project_id = ? ORDER BY phase ASC, id ASC"
  ).all(Number(request.params.id)));
});

router.post("/:id/photos", (request, response) => {
  const projectId = Number(request.params.id);
  const { url, caption, phase, takenAt } = request.body;
  if (!url) return response.status(400).json({ error: "Photo URL is required." });
  const result = db.prepare(
    "INSERT INTO project_photos (project_id, url, caption, phase, taken_at) VALUES (?, ?, ?, ?, ?)"
  ).run(projectId, url.trim(), caption || null, phase || "progress", takenAt || null);
  response.status(201).json(db.prepare("SELECT id, url, caption, phase, taken_at AS takenAt FROM project_photos WHERE id = ?").get(result.lastInsertRowid));
});

router.delete("/photos/:photoId", (request, response) => {
  db.prepare("DELETE FROM project_photos WHERE id = ?").run(Number(request.params.photoId));
  response.status(204).end();
});

router.delete("/:id", (request, response) => {
  const projectId = Number(request.params.id);
  const project = getProjectWithMetricsById(projectId);

  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
  writeAuditLog({
    entityType: "project",
    entityId: projectId,
    action: "delete",
    summary: `Obra ${project.clientName} - ${project.description} removida.`,
    payload: project,
  });

  return response.status(204).send();
});

module.exports = router;
