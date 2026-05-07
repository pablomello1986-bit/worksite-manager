const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");

const router = express.Router();

router.get("/", (_request, response) => {
  const materials = db
    .prepare(`
      SELECT
        m.id,
        m.project_id AS projectId,
        p.client_name AS projectClient,
        p.description AS projectDescription,
        m.name,
        m.category,
        m.supplier,
        m.invoice_number AS invoiceNumber,
        m.unit,
        m.quantity,
        m.unit_price AS unitPrice,
        m.cost,
        m.payment_status AS paymentStatus,
        m.purchased_at AS purchasedAt
      FROM materials m
      INNER JOIN projects p ON p.id = m.project_id
      ORDER BY m.purchased_at DESC, m.id DESC
    `)
    .all();

  response.json(materials);
});

router.post("/", (request, response) => {
  const {
    projectId,
    name,
    category,
    supplier,
    invoiceNumber,
    unit,
    quantity,
    unitPrice,
    cost,
    paymentStatus,
    purchasedAt,
  } = request.body;

  if (!projectId || !name || !purchasedAt) {
    return response.status(400).json({ error: "Informe obra, material e data da compra." });
  }

  const normalizedQuantity = Number(quantity || 0);
  const normalizedUnitPrice = Number(unitPrice || 0);
  const normalizedCost = Number(cost || normalizedQuantity * normalizedUnitPrice);

  const result = db
    .prepare(`
      INSERT INTO materials (
        project_id, name, category, supplier, invoice_number, unit,
        quantity, unit_price, cost, payment_status, purchased_at
      )
      VALUES (
        @projectId, @name, @category, @supplier, @invoiceNumber, @unit,
        @quantity, @unitPrice, @cost, @paymentStatus, @purchasedAt
      )
    `)
    .run({
      projectId: Number(projectId),
      name,
      category: category || null,
      supplier: supplier || null,
      invoiceNumber: invoiceNumber || null,
      unit: unit || null,
      quantity: normalizedQuantity,
      unitPrice: normalizedUnitPrice,
      cost: normalizedCost,
      paymentStatus: paymentStatus || "pago",
      purchasedAt,
    });

  const material = db
    .prepare(`
      SELECT
        m.id,
        m.project_id AS projectId,
        p.client_name AS projectClient,
        p.description AS projectDescription,
        m.name,
        m.category,
        m.supplier,
        m.invoice_number AS invoiceNumber,
        m.unit,
        m.quantity,
        m.unit_price AS unitPrice,
        m.cost,
        m.payment_status AS paymentStatus,
        m.purchased_at AS purchasedAt
      FROM materials m
      INNER JOIN projects p ON p.id = m.project_id
      WHERE m.id = ?
    `)
    .get(result.lastInsertRowid);

  writeAuditLog({
    entityType: "material",
    entityId: material.id,
    action: "create",
    summary: `Material ${material.name} lancado na obra ${material.projectClient}.`,
    payload: material,
  });

  response.status(201).json(material);
});

router.patch("/:id", (request, response) => {
  const materialId = Number(request.params.id);
  const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(materialId);

  if (!material) {
    return response.status(404).json({ error: "Material nao encontrado." });
  }

  const projectId = Number(request.body.projectId ?? material.project_id);
  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);
  if (!project) {
    return response.status(404).json({ error: "Obra nao encontrada." });
  }

  const normalizedQuantity = Number(request.body.quantity ?? material.quantity);
  const normalizedUnitPrice = Number(request.body.unitPrice ?? material.unit_price);
  const normalizedCost =
    request.body.cost === undefined
      ? Number(material.cost)
      : Number(request.body.cost || normalizedQuantity * normalizedUnitPrice);

  db.prepare(`
    UPDATE materials
    SET
      project_id = @projectId,
      name = @name,
      category = @category,
      supplier = @supplier,
      invoice_number = @invoiceNumber,
      unit = @unit,
      quantity = @quantity,
      unit_price = @unitPrice,
      cost = @cost,
      payment_status = @paymentStatus,
      purchased_at = @purchasedAt
    WHERE id = @materialId
  `).run({
    projectId,
    name: request.body.name ?? material.name,
    category: request.body.category ?? material.category,
    supplier: request.body.supplier ?? material.supplier,
    invoiceNumber: request.body.invoiceNumber ?? material.invoice_number,
    unit: request.body.unit ?? material.unit,
    quantity: normalizedQuantity,
    unitPrice: normalizedUnitPrice,
    cost: normalizedCost,
    paymentStatus: request.body.paymentStatus ?? material.payment_status,
    purchasedAt: request.body.purchasedAt ?? material.purchased_at,
    materialId,
  });

  const updatedMaterial = db
    .prepare(`
      SELECT
        m.id,
        m.project_id AS projectId,
        p.client_name AS projectClient,
        p.description AS projectDescription,
        m.name,
        m.category,
        m.supplier,
        m.invoice_number AS invoiceNumber,
        m.unit,
        m.quantity,
        m.unit_price AS unitPrice,
        m.cost,
        m.payment_status AS paymentStatus,
        m.purchased_at AS purchasedAt
      FROM materials m
      INNER JOIN projects p ON p.id = m.project_id
      WHERE m.id = ?
    `)
    .get(materialId);

  writeAuditLog({
    entityType: "material",
    entityId: updatedMaterial.id,
    action: "update",
    summary: `Material ${updatedMaterial.name} atualizado na obra ${updatedMaterial.projectClient}.`,
    payload: updatedMaterial,
  });

  return response.json(updatedMaterial);
});

router.delete("/:id", (request, response) => {
  const materialId = Number(request.params.id);
  const material = db
    .prepare(`
      SELECT
        m.id,
        m.name,
        p.client_name AS projectClient
      FROM materials m
      INNER JOIN projects p ON p.id = m.project_id
      WHERE m.id = ?
    `)
    .get(materialId);

  if (!material) {
    return response.status(404).json({ error: "Material nao encontrado." });
  }

  db.prepare("DELETE FROM materials WHERE id = ?").run(materialId);

  writeAuditLog({
    entityType: "material",
    entityId: materialId,
    action: "delete",
    summary: `Material ${material.name} removido da obra ${material.projectClient}.`,
    payload: material,
  });

  return response.status(204).send();
});

module.exports = router;
