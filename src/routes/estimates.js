const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");
const { getProjectWithMetricsById } = require("../services/projectMetrics");

const router = express.Router();

function buildEstimateNumber() {
  const year = new Date().getFullYear();
  const count = db.prepare("SELECT COUNT(*) AS total FROM estimates").get().total + 1;
  return `EST-${year}-${String(count).padStart(3, "0")}`;
}

function getEstimateItems(estimateId) {
  return db.prepare(`
    SELECT
      id,
      estimate_id AS estimateId,
      description,
      quantity,
      unit_price AS unitPrice,
      line_total AS lineTotal,
      process,
      material_responsibility AS materialResponsibility,
      material_description AS materialDescription
    FROM estimate_items
    WHERE estimate_id = ?
    ORDER BY id ASC
  `).all(estimateId);
}

function getEstimateById(estimateId) {
  const estimate = db.prepare(`
    SELECT
      e.id,
      e.client_id AS clientId,
      c.name AS clientName,
      c.company_name AS clientCompanyName,
      c.phone AS clientPhone,
      c.email AS clientEmail,
      c.address AS clientAddress,
      c.logo_url AS clientLogoUrl,
      e.project_id AS projectId,
      p.description AS projectDescription,
      e.estimate_number AS estimateNumber,
      e.work_title AS workTitle,
      e.business_name AS businessName,
      e.business_logo_url AS businessLogoUrl,
      e.issue_date AS issueDate,
      e.valid_until AS validUntil,
      e.description,
      e.subtotal,
      e.discount_amount AS discountAmount,
      e.tax_percent AS taxPercent,
      e.tax_amount AS taxAmount,
      e.total_amount AS totalAmount,
      e.status,
      e.notes
    FROM estimates e
    LEFT JOIN clients c ON c.id = e.client_id
    LEFT JOIN projects p ON p.id = e.project_id
    WHERE e.id = ?
  `).get(estimateId);

  if (!estimate) {
    return null;
  }

  return {
    ...estimate,
    items: getEstimateItems(estimateId),
  };
}

function normalizeItems(items = []) {
  return items
    .filter((item) => item && item.description)
    .map((item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      return {
        description: item.description,
        quantity,
        unitPrice,
        lineTotal: Number(item.lineTotal || quantity * unitPrice),
        process: item.process || null,
        materialResponsibility: item.materialResponsibility || "empresa",
        materialDescription: item.materialDescription || null,
      };
    });
}

router.get("/", (_request, response) => {
  const estimates = db.prepare(`
    SELECT
      e.id,
      e.client_id AS clientId,
      c.name AS clientName,
      e.project_id AS projectId,
      p.description AS projectDescription,
      e.estimate_number AS estimateNumber,
      e.work_title AS workTitle,
      e.business_name AS businessName,
      e.business_logo_url AS businessLogoUrl,
      e.issue_date AS issueDate,
      e.valid_until AS validUntil,
      e.description,
      e.subtotal,
      e.discount_amount AS discountAmount,
      e.tax_percent AS taxPercent,
      e.tax_amount AS taxAmount,
      e.total_amount AS totalAmount,
      e.status,
      e.notes
    FROM estimates e
    LEFT JOIN clients c ON c.id = e.client_id
    LEFT JOIN projects p ON p.id = e.project_id
    ORDER BY e.issue_date DESC, e.id DESC
  `).all();

  response.json(
    estimates.map((estimate) => ({
      ...estimate,
      items: getEstimateItems(estimate.id),
    })),
  );
});

router.post("/", (request, response) => {
  const {
    clientId,
    projectId,
    estimateNumber,
    workTitle,
    businessName,
    businessLogoUrl,
    issueDate,
    validUntil,
    description,
    discountAmount,
    taxPercent,
    notes,
    status,
    items,
  } = request.body;

  if (!workTitle || !issueDate) {
    return response.status(400).json({ error: "Informe o titulo do trabalho e a data do estimate." });
  }

  const normalizedItems = normalizeItems(items);
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const normalizedDiscount = Number(discountAmount || 0);
  const normalizedTaxPercent = Number(taxPercent || 0);
  const taxableBase = Math.max(subtotal - normalizedDiscount, 0);
  const taxAmount = taxableBase * (normalizedTaxPercent / 100);
  const totalAmount = taxableBase + taxAmount;

  const result = db.prepare(`
    INSERT INTO estimates (
      client_id, project_id, estimate_number, work_title, business_name, business_logo_url,
      issue_date, valid_until, description, subtotal, discount_amount, tax_percent, tax_amount,
      total_amount, status, notes
    )
    VALUES (
      @clientId, @projectId, @estimateNumber, @workTitle, @businessName, @businessLogoUrl,
      @issueDate, @validUntil, @description, @subtotal, @discountAmount, @taxPercent, @taxAmount,
      @totalAmount, @status, @notes
    )
  `).run({
    clientId: clientId ? Number(clientId) : null,
    projectId: projectId ? Number(projectId) : null,
    estimateNumber: estimateNumber || buildEstimateNumber(),
    workTitle,
    businessName: businessName || null,
    businessLogoUrl: businessLogoUrl || null,
    issueDate,
    validUntil: validUntil || null,
    description: description || null,
    subtotal,
    discountAmount: normalizedDiscount,
    taxPercent: normalizedTaxPercent,
    taxAmount,
    totalAmount,
    status: status || "rascunho",
    notes: notes || null,
  });

  const insertItem = db.prepare(`
    INSERT INTO estimate_items (estimate_id, description, quantity, unit_price, line_total, process, material_responsibility, material_description)
    VALUES (@estimateId, @description, @quantity, @unitPrice, @lineTotal, @process, @materialResponsibility, @materialDescription)
  `);

  normalizedItems.forEach((item) => {
    insertItem.run({
      estimateId: result.lastInsertRowid,
      ...item,
    });
  });

  const estimate = getEstimateById(result.lastInsertRowid);
  writeAuditLog({
    entityType: "estimate",
    entityId: estimate.id,
    action: "create",
    summary: `Estimate ${estimate.estimateNumber} criado para ${estimate.clientName || estimate.workTitle}.`,
    payload: estimate,
  });
  response.status(201).json(estimate);
});

router.patch("/:id", (request, response) => {
  const estimateId = Number(request.params.id);
  const current = db.prepare("SELECT * FROM estimates WHERE id = ?").get(estimateId);

  if (!current) {
    return response.status(404).json({ error: "Estimate nao encontrado." });
  }

  const normalizedItems = request.body.items
    ? normalizeItems(request.body.items)
    : getEstimateItems(estimateId);
  const subtotal = normalizedItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const normalizedDiscount = Number(request.body.discountAmount ?? current.discount_amount);
  const normalizedTaxPercent = Number(request.body.taxPercent ?? current.tax_percent);
  const taxableBase = Math.max(subtotal - normalizedDiscount, 0);
  const taxAmount = taxableBase * (normalizedTaxPercent / 100);
  const totalAmount = taxableBase + taxAmount;

  db.prepare(`
    UPDATE estimates
    SET
      client_id = @clientId,
      project_id = @projectId,
      estimate_number = @estimateNumber,
      work_title = @workTitle,
      business_name = @businessName,
      business_logo_url = @businessLogoUrl,
      issue_date = @issueDate,
      valid_until = @validUntil,
      description = @description,
      subtotal = @subtotal,
      discount_amount = @discountAmount,
      tax_percent = @taxPercent,
      tax_amount = @taxAmount,
      total_amount = @totalAmount,
      status = @status,
      notes = @notes
    WHERE id = @estimateId
  `).run({
    clientId: request.body.clientId === undefined ? current.client_id : request.body.clientId ? Number(request.body.clientId) : null,
    projectId: request.body.projectId === undefined ? current.project_id : request.body.projectId ? Number(request.body.projectId) : null,
    estimateNumber: request.body.estimateNumber ?? current.estimate_number,
    workTitle: request.body.workTitle ?? current.work_title,
    businessName: request.body.businessName ?? current.business_name,
    businessLogoUrl: request.body.businessLogoUrl ?? current.business_logo_url,
    issueDate: request.body.issueDate ?? current.issue_date,
    validUntil: request.body.validUntil ?? current.valid_until,
    description: request.body.description ?? current.description,
    subtotal,
    discountAmount: normalizedDiscount,
    taxPercent: normalizedTaxPercent,
    taxAmount,
    totalAmount,
    status: request.body.status ?? current.status,
    notes: request.body.notes ?? current.notes,
    estimateId,
  });

  if (request.body.items) {
    db.prepare("DELETE FROM estimate_items WHERE estimate_id = ?").run(estimateId);
    const insertItem = db.prepare(`
      INSERT INTO estimate_items (estimate_id, description, quantity, unit_price, line_total, process, material_responsibility, material_description)
      VALUES (@estimateId, @description, @quantity, @unitPrice, @lineTotal, @process, @materialResponsibility, @materialDescription)
    `);
    normalizedItems.forEach((item) => {
      insertItem.run({
        estimateId,
        ...item,
      });
    });
  }

  const estimate = getEstimateById(estimateId);
  writeAuditLog({
    entityType: "estimate",
    entityId: estimate.id,
    action: "update",
    summary: `Estimate ${estimate.estimateNumber} atualizado.`,
    payload: estimate,
  });
  response.json(estimate);
});

router.post("/:id/convert-to-project", (request, response) => {
  const estimateId = Number(request.params.id);
  const estimate = getEstimateById(estimateId);

  if (!estimate) {
    return response.status(404).json({ error: "Estimate nao encontrado." });
  }

  const client = estimate.clientId
    ? db.prepare("SELECT * FROM clients WHERE id = ?").get(estimate.clientId)
    : null;

  const result = db.prepare(`
    INSERT INTO projects (
      client_id, estimate_id, client_name, client_phone, address, description, total_value,
      budget_value, payment_method, start_date, estimated_days, status, notes
    )
    VALUES (
      @clientId, @estimateId, @clientName, @clientPhone, @address, @description, @totalValue,
      @budgetValue, @paymentMethod, @startDate, @estimatedDays, @status, @notes
    )
  `).run({
    clientId: estimate.clientId || null,
    estimateId,
    clientName: client?.name || estimate.clientName || "Cliente sem nome",
    clientPhone: client?.phone || null,
    address: client?.address || null,
    description: estimate.workTitle,
    totalValue: Number(estimate.totalAmount || 0),
    budgetValue: Number(estimate.subtotal || 0),
    paymentMethod: "Definir",
    startDate: request.body.startDate || new Date().toISOString().slice(0, 10),
    estimatedDays: Number(request.body.estimatedDays || 30),
    status: "em andamento",
    notes: estimate.notes || estimate.description || null,
  });

  db.prepare(`
    UPDATE estimates
    SET status = 'convertido', project_id = @projectId
    WHERE id = @estimateId
  `).run({
    projectId: result.lastInsertRowid,
    estimateId,
  });

  // Auto-transfer any linked paint estimates as project materials
  const paintEstimates = db.prepare("SELECT * FROM paint_estimates WHERE estimate_id = ?").all(estimateId);
  if (paintEstimates.length) {
    const today = new Date().toISOString().slice(0, 10);
    const insertMat = db.prepare(`
      INSERT INTO materials (project_id, name, category, quantity, unit, unit_price, cost, payment_status, purchased_at)
      VALUES (@projectId, @name, 'paint', @qty, 'gallon', @unitPrice, @cost, 'pendente', @today)
    `);
    paintEstimates.forEach((pe) => {
      insertMat.run({
        projectId: result.lastInsertRowid,
        name: pe.product_name || "Paint",
        qty: pe.gallons_final,
        unitPrice: pe.price_per_gallon,
        cost: pe.total,
        today,
      });
    });
  }

  const project = getProjectWithMetricsById(result.lastInsertRowid);
  writeAuditLog({
    entityType: "estimate",
    entityId: estimateId,
    action: "convert",
    summary: `Estimate ${estimate.estimateNumber} convertido em obra.`,
    payload: { estimateId, projectId: result.lastInsertRowid },
  });
  response.status(201).json({
    estimate: getEstimateById(estimateId),
    project,
  });
});

router.post("/:id/convert-to-forecast", (request, response) => {
  const estimateId = Number(request.params.id);
  const estimate = getEstimateById(estimateId);

  if (!estimate) {
    return response.status(404).json({ error: "Estimate nao encontrado." });
  }

  const forecastExists = db.prepare("SELECT id FROM forecasts WHERE estimate_id = ?").get(estimateId);
  if (forecastExists) {
    return response.status(400).json({ error: "Este estimate ja foi transformado em previsao." });
  }

  const estimateItems = estimate.items || [];
  const materialEstimate = estimateItems
    .filter((item) => /material|cimento|piso|tinta|areia|bloco|ferragem|gesso/i.test(item.description))
    .reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const laborEstimate = Math.max(Number(estimate.subtotal || 0) - materialEstimate, 0);

  const result = db.prepare(`
    INSERT INTO forecasts (
      client_id, estimate_id, client_name, title, description, expected_start_date,
      estimated_labor_cost, estimated_material_cost, total_value, company_percent, tax_amount, status, notes
    )
    VALUES (
      @clientId, @estimateId, @clientName, @title, @description, @expectedStartDate,
      @estimatedLaborCost, @estimatedMaterialCost, @totalValue, @companyPercent, @taxAmount, @status, @notes
    )
  `).run({
    clientId: estimate.clientId || null,
    estimateId,
    clientName: estimate.clientName || "Cliente sem nome",
    title: estimate.workTitle,
    description: estimate.description || null,
    expectedStartDate: request.body.expectedStartDate || estimate.validUntil || null,
    estimatedLaborCost: laborEstimate,
    estimatedMaterialCost: materialEstimate,
    totalValue: Number(estimate.totalAmount || 0),
    companyPercent: Number(request.body.companyPercent || 0),
    taxAmount: Number(estimate.taxAmount || 0),
    status: "planejada",
    notes: estimate.notes || null,
  });

  db.prepare(`
    UPDATE estimates
    SET status = CASE WHEN status = 'convertido' THEN status ELSE 'aprovado' END
    WHERE id = ?
  `).run(estimateId);

  const forecast = db.prepare(`
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
    WHERE id = ?
  `).get(result.lastInsertRowid);

  writeAuditLog({
    entityType: "estimate",
    entityId: estimateId,
    action: "convert_to_forecast",
    summary: `Estimate ${estimate.estimateNumber} transformado em previsao.`,
    payload: { estimateId, forecastId: result.lastInsertRowid },
  });

  response.status(201).json(forecast);
});

router.delete("/:id", (request, response) => {
  const estimateId = Number(request.params.id);
  const estimate = getEstimateById(estimateId);

  if (!estimate) {
    return response.status(404).json({ error: "Estimate nao encontrado." });
  }

  db.prepare("UPDATE projects SET estimate_id = NULL WHERE estimate_id = ?").run(estimateId);
  db.prepare("DELETE FROM estimates WHERE id = ?").run(estimateId);
  writeAuditLog({
    entityType: "estimate",
    entityId: estimate.id,
    action: "delete",
    summary: `Estimate ${estimate.estimateNumber} removido.`,
    payload: estimate,
  });
  response.status(204).send();
});

module.exports = router;
