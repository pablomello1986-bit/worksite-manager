const express = require("express");
const { db } = require("../db/database");
const { getProjectsWithMetrics } = require("../services/projectMetrics");

const router = express.Router();

function toCsv(rows) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escapeValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [
    headers.map(escapeValue).join(","),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(",")),
  ].join("\n");
}

router.get("/projects", (request, response) => {
  const status = request.query.status;
  response.json(getProjectsWithMetrics(status ? { status } : {}));
});

router.get("/weekly-payments", (request, response) => {
  const { startDate, endDate } = request.query;

  if (!startDate || !endDate) {
    return response.status(400).json({ error: "Informe a data inicial e final da semana." });
  }

  const records = db
    .prepare(`
      SELECT
        lr.id,
        lr.project_id AS projectId,
        p.client_name AS projectClient,
        p.description AS projectDescription,
        lr.employee_id AS employeeId,
        e.name AS employeeName,
        lr.days_worked AS daysWorked,
        lr.amount_paid AS amountPaid,
        lr.work_start_date AS workStartDate,
        lr.work_end_date AS workEndDate,
        lr.notes
      FROM labor_records lr
      INNER JOIN projects p ON p.id = lr.project_id
      INNER JOIN employees e ON e.id = lr.employee_id
      ORDER BY COALESCE(lr.work_end_date, lr.work_start_date) DESC, lr.id DESC
    `)
    .all();

  const materials = db
    .prepare(`
      SELECT
        m.id,
        m.project_id AS projectId,
        p.client_name AS projectClient,
        p.description AS projectDescription,
        m.name,
        m.unit,
        m.supplier,
        m.quantity,
        m.cost,
        m.payment_status AS paymentStatus,
        m.purchased_at AS purchasedAt
      FROM materials m
      INNER JOIN projects p ON p.id = m.project_id
      ORDER BY m.purchased_at DESC, m.id DESC
    `)
    .all();

  const laborInRange = records.filter((record) => {
    const paymentDate = record.workEndDate || record.workStartDate;
    return paymentDate >= startDate && paymentDate <= endDate;
  });

  const materialsInRange = materials.filter(
    (material) => material.purchasedAt >= startDate && material.purchasedAt <= endDate,
  );

  const employeePaymentsMap = new Map();
  const projectPaymentsMap = new Map();

  laborInRange.forEach((record) => {
    const employeeEntry = employeePaymentsMap.get(record.employeeId) || {
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      totalPaid: 0,
      totalDaysWorked: 0,
      paymentCount: 0,
      projects: new Set(),
    };

    employeeEntry.totalPaid += Number(record.amountPaid || 0);
    employeeEntry.totalDaysWorked += Number(record.daysWorked || 0);
    employeeEntry.paymentCount += 1;
    employeeEntry.projects.add(record.projectClient);
    employeePaymentsMap.set(record.employeeId, employeeEntry);

    const projectEntry = projectPaymentsMap.get(record.projectId) || {
      projectId: record.projectId,
      projectClient: record.projectClient,
      projectDescription: record.projectDescription,
      laborPaid: 0,
      materialPaid: 0,
    };

    projectEntry.laborPaid += Number(record.amountPaid || 0);
    projectPaymentsMap.set(record.projectId, projectEntry);
  });

  materialsInRange.forEach((material) => {
    const projectEntry = projectPaymentsMap.get(material.projectId) || {
      projectId: material.projectId,
      projectClient: material.projectClient,
      projectDescription: material.projectDescription,
      laborPaid: 0,
      materialPaid: 0,
    };

    projectEntry.materialPaid += Number(material.cost || 0);
    projectPaymentsMap.set(material.projectId, projectEntry);
  });

  const employeePayments = Array.from(employeePaymentsMap.values())
    .map((entry) => ({
      employeeId: entry.employeeId,
      employeeName: entry.employeeName,
      totalPaid: entry.totalPaid,
      totalDaysWorked: entry.totalDaysWorked,
      paymentCount: entry.paymentCount,
      projects: Array.from(entry.projects).sort(),
    }))
    .sort((a, b) => b.totalPaid - a.totalPaid);

  const projectPayments = Array.from(projectPaymentsMap.values())
    .map((entry) => ({
      ...entry,
      totalPaid: entry.laborPaid + entry.materialPaid,
    }))
    .sort((a, b) => b.totalPaid - a.totalPaid);

  return response.json({
    startDate,
    endDate,
    totalLaborPaid: laborInRange.reduce((sum, record) => sum + Number(record.amountPaid || 0), 0),
    totalMaterialPaid: materialsInRange.reduce((sum, material) => sum + Number(material.cost || 0), 0),
    totalLaborEntries: laborInRange.length,
    totalMaterialEntries: materialsInRange.length,
    employeePayments,
    projectPayments,
    materialPayments: materialsInRange,
  });
});

router.get("/exports/projects.csv", (request, response) => {
  const status = request.query.status;
  const rows = getProjectsWithMetrics(status ? { status } : {}).map((project) => ({
    cliente: project.clientName,
    obra: project.description,
    status: project.status,
    valor_total: Number(project.totalValue || 0).toFixed(2),
    valor_recebido: Number(project.receivedAmount || 0).toFixed(2),
    custo_funcionarios: Number(project.laborCost || 0).toFixed(2),
    custo_materiais: Number(project.materialCost || 0).toFixed(2),
    custo_total: Number(project.totalCosts || 0).toFixed(2),
    lucro: Number(project.profit || 0).toFixed(2),
    saldo_recebido: Number(project.receivedBalance || 0).toFixed(2),
  }));

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", 'attachment; filename="relatorio-obras.csv"');
  response.send(toCsv(rows));
});

router.get("/exports/cashflow.csv", (request, response) => {
  const { startDate, endDate, projectId } = request.query;

  const receipts = db
    .prepare(`
      SELECT
        'recebimento' AS tipo,
        p.client_name AS cliente,
        p.description AS obra,
        r.received_at AS data,
        r.amount AS valor,
        COALESCE(r.notes, '') AS observacoes
      FROM receipts r
      INNER JOIN projects p ON p.id = r.project_id
      WHERE (@projectId IS NULL OR r.project_id = @projectId)
        AND (@startDate IS NULL OR r.received_at >= @startDate)
        AND (@endDate IS NULL OR r.received_at <= @endDate)
    `)
    .all({
      projectId: projectId ? Number(projectId) : null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

  const labor = db
    .prepare(`
      SELECT
        'pagamento_funcionario' AS tipo,
        p.client_name AS cliente,
        p.description AS obra,
        COALESCE(lr.work_end_date, lr.work_start_date) AS data,
        -lr.amount_paid AS valor,
        COALESCE(e.name, '') || ' | ' || COALESCE(lr.notes, '') AS observacoes
      FROM labor_records lr
      INNER JOIN projects p ON p.id = lr.project_id
      INNER JOIN employees e ON e.id = lr.employee_id
      WHERE (@projectId IS NULL OR lr.project_id = @projectId)
        AND (@startDate IS NULL OR COALESCE(lr.work_end_date, lr.work_start_date) >= @startDate)
        AND (@endDate IS NULL OR COALESCE(lr.work_end_date, lr.work_start_date) <= @endDate)
    `)
    .all({
      projectId: projectId ? Number(projectId) : null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

  const materials = db
    .prepare(`
      SELECT
        'material' AS tipo,
        p.client_name AS cliente,
        p.description AS obra,
        m.purchased_at AS data,
        -m.cost AS valor,
        COALESCE(m.name, '') || ' | ' || COALESCE(m.supplier, '') AS observacoes
      FROM materials m
      INNER JOIN projects p ON p.id = m.project_id
      WHERE (@projectId IS NULL OR m.project_id = @projectId)
        AND (@startDate IS NULL OR m.purchased_at >= @startDate)
        AND (@endDate IS NULL OR m.purchased_at <= @endDate)
    `)
    .all({
      projectId: projectId ? Number(projectId) : null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

  const rows = [...receipts, ...labor, ...materials].sort((a, b) => String(a.data).localeCompare(String(b.data)));
  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", 'attachment; filename="fluxo-caixa.csv"');
  response.send(toCsv(rows));
});

module.exports = router;
