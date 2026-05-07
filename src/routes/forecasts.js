const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");
const { getProjectWithMetricsById } = require("../services/projectMetrics");

const router = express.Router();

function normalizeForecast(forecast) {
  const estimatedLaborCost = Number(forecast.estimatedLaborCost || 0);
  const estimatedMaterialCost = Number(forecast.estimatedMaterialCost || 0);
  const totalValue = Number(forecast.totalValue || 0);
  const companyPercent = Number(forecast.companyPercent || 0);
  const taxAmount = Number(forecast.taxAmount || 0);
  const estimatedTotalCost = estimatedLaborCost + estimatedMaterialCost;
  const grossProfit = totalValue - estimatedTotalCost;
  const companyAmount = totalValue * (companyPercent / 100);
  const projectedNet = totalValue - estimatedTotalCost - companyAmount - taxAmount;

  return {
    ...forecast,
    estimatedLaborCost,
    estimatedMaterialCost,
    totalValue,
    companyPercent,
    taxAmount,
    estimatedTotalCost,
    grossProfit,
    companyAmount,
    projectedNet,
  };
}

const forecastSelect = `
  SELECT
    id,
    client_id AS clientId,
    estimate_id AS estimateId,
    project_id AS projectId,
    client_name AS clientName,
    title,
    description,
    expected_start_date AS expectedStartDate,
    estimated_labor_cost AS estimatedLaborCost,
    estimated_material_cost AS estimatedMaterialCost,
    total_value AS totalValue,
    company_percent AS companyPercent,
    tax_amount AS taxAmount,
    status,
    notes
  FROM forecasts
`;

router.get("/", (_request, response) => {
  const forecasts = db
    .prepare(`${forecastSelect} ORDER BY COALESCE(expected_start_date, '9999-12-31') ASC, id DESC`)
    .all()
    .map(normalizeForecast);

  response.json(forecasts);
});

router.post("/", (request, response) => {
  const {
    clientName,
    clientId,
    estimateId,
    projectId,
    title,
    description,
    expectedStartDate,
    estimatedLaborCost,
    estimatedMaterialCost,
    totalValue,
    companyPercent,
    taxAmount,
    status,
    notes,
  } = request.body;

  if (!clientName || !title) {
    return response.status(400).json({ error: "Informe cliente e nome do trabalho futuro." });
  }

  const result = db
    .prepare(`
      INSERT INTO forecasts (
        client_id, estimate_id, project_id, client_name, title, description, expected_start_date, estimated_labor_cost,
        estimated_material_cost, total_value, company_percent, tax_amount, status, notes
      )
      VALUES (
        @clientId, @estimateId, @projectId, @clientName, @title, @description, @expectedStartDate, @estimatedLaborCost,
        @estimatedMaterialCost, @totalValue, @companyPercent, @taxAmount, @status, @notes
      )
    `)
    .run({
      clientId: clientId ? Number(clientId) : null,
      estimateId: estimateId ? Number(estimateId) : null,
      projectId: projectId ? Number(projectId) : null,
      clientName,
      title,
      description: description || null,
      expectedStartDate: expectedStartDate || null,
      estimatedLaborCost: Number(estimatedLaborCost || 0),
      estimatedMaterialCost: Number(estimatedMaterialCost || 0),
      totalValue: Number(totalValue || 0),
      companyPercent: Number(companyPercent || 0),
      taxAmount: Number(taxAmount || 0),
      status: status || "planejada",
      notes: notes || null,
    });

  const forecast = db
    .prepare(`${forecastSelect} WHERE id = ?`)
    .get(result.lastInsertRowid);

  const normalizedForecast = normalizeForecast(forecast);
  writeAuditLog({
    entityType: "forecast",
    entityId: normalizedForecast.id,
    action: "create",
    summary: `Previsao ${normalizedForecast.clientName} - ${normalizedForecast.title} cadastrada.`,
    payload: normalizedForecast,
  });

  response.status(201).json(normalizedForecast);
});

router.patch("/:id", (request, response) => {
  const forecastId = Number(request.params.id);
  const forecast = db.prepare("SELECT * FROM forecasts WHERE id = ?").get(forecastId);

  if (!forecast) {
    return response.status(404).json({ error: "Previsao nao encontrada." });
  }

  db.prepare(`
    UPDATE forecasts
    SET
      client_id = @clientId,
      estimate_id = @estimateId,
      project_id = @projectId,
      client_name = @clientName,
      title = @title,
      description = @description,
      expected_start_date = @expectedStartDate,
      estimated_labor_cost = @estimatedLaborCost,
      estimated_material_cost = @estimatedMaterialCost,
      total_value = @totalValue,
      company_percent = @companyPercent,
      tax_amount = @taxAmount,
      status = @status,
      notes = @notes
    WHERE id = @forecastId
  `).run({
    clientId: request.body.clientId === undefined ? forecast.client_id : request.body.clientId ? Number(request.body.clientId) : null,
    estimateId: request.body.estimateId === undefined ? forecast.estimate_id : request.body.estimateId ? Number(request.body.estimateId) : null,
    projectId: request.body.projectId === undefined ? forecast.project_id : request.body.projectId ? Number(request.body.projectId) : null,
    clientName: request.body.clientName ?? forecast.client_name,
    title: request.body.title ?? forecast.title,
    description: request.body.description ?? forecast.description,
    expectedStartDate: request.body.expectedStartDate ?? forecast.expected_start_date,
    estimatedLaborCost: Number(request.body.estimatedLaborCost ?? forecast.estimated_labor_cost),
    estimatedMaterialCost: Number(request.body.estimatedMaterialCost ?? forecast.estimated_material_cost),
    totalValue: Number(request.body.totalValue ?? forecast.total_value),
    companyPercent: Number(request.body.companyPercent ?? forecast.company_percent),
    taxAmount: Number(request.body.taxAmount ?? forecast.tax_amount),
    status: request.body.status ?? forecast.status,
    notes: request.body.notes ?? forecast.notes,
    forecastId,
  });

  const updatedForecast = normalizeForecast(db.prepare(`${forecastSelect} WHERE id = ?`).get(forecastId));
  writeAuditLog({
    entityType: "forecast",
    entityId: updatedForecast.id,
    action: "update",
    summary: `Previsao ${updatedForecast.clientName} - ${updatedForecast.title} atualizada.`,
    payload: updatedForecast,
  });

  return response.json(updatedForecast);
});

router.post("/:id/convert-to-project", (request, response) => {
  const forecastId = Number(request.params.id);
  const forecast = normalizeForecast(db.prepare(`${forecastSelect} WHERE id = ?`).get(forecastId));

  if (!forecast) {
    return response.status(404).json({ error: "Previsao nao encontrada." });
  }

  const client = forecast.clientId
    ? db.prepare("SELECT * FROM clients WHERE id = ?").get(forecast.clientId)
    : null;

  const result = db.prepare(`
    INSERT INTO projects (
      client_id, estimate_id, forecast_id, client_name, client_phone, address, description, total_value,
      budget_value, payment_method, start_date, estimated_days, status, notes
    )
    VALUES (
      @clientId, @estimateId, @forecastId, @clientName, @clientPhone, @address, @description, @totalValue,
      @budgetValue, @paymentMethod, @startDate, @estimatedDays, @status, @notes
    )
  `).run({
    clientId: forecast.clientId || null,
    estimateId: forecast.estimateId || null,
    forecastId,
    clientName: client?.name || forecast.clientName,
    clientPhone: client?.phone || null,
    address: client?.address || null,
    description: forecast.title,
    totalValue: Number(forecast.totalValue || 0),
    budgetValue: Number(forecast.estimatedTotalCost || 0),
    paymentMethod: "Definir",
    startDate: request.body.startDate || new Date().toISOString().slice(0, 10),
    estimatedDays: Number(request.body.estimatedDays || 30),
    status: "em andamento",
    notes: forecast.notes || forecast.description || null,
  });

  db.prepare(`
    UPDATE forecasts
    SET status = 'convertida', project_id = @projectId
    WHERE id = @forecastId
  `).run({
    projectId: result.lastInsertRowid,
    forecastId,
  });

  if (forecast.estimateId) {
    db.prepare(`
      UPDATE estimates
      SET status = CASE WHEN status = 'convertido' THEN status ELSE 'aprovado' END
      WHERE id = ?
    `).run(forecast.estimateId);
  }

  const project = getProjectWithMetricsById(result.lastInsertRowid);
  writeAuditLog({
    entityType: "forecast",
    entityId: forecastId,
    action: "convert",
    summary: `Previsao ${forecast.clientName} - ${forecast.title} convertida em obra.`,
    payload: { forecastId, projectId: result.lastInsertRowid },
  });

  response.status(201).json({
    forecast: normalizeForecast(db.prepare(`${forecastSelect} WHERE id = ?`).get(forecastId)),
    project,
  });
});

router.delete("/:id", (request, response) => {
  const forecastId = Number(request.params.id);
  const forecast = db.prepare(`${forecastSelect} WHERE id = ?`).get(forecastId);

  if (!forecast) {
    return response.status(404).json({ error: "Previsao nao encontrada." });
  }

  db.prepare("DELETE FROM forecasts WHERE id = ?").run(forecastId);
  writeAuditLog({
    entityType: "forecast",
    entityId: forecastId,
    action: "delete",
    summary: `Previsao ${forecast.clientName} - ${forecast.title} removida.`,
    payload: normalizeForecast(forecast),
  });

  return response.status(204).send();
});

module.exports = router;
