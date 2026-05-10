const express = require("express");
const { db } = require("../db/database");

const router = express.Router();

// ── SW Products ──────────────────────────────────────────────────────────────

router.get("/products", (_req, res) => {
  res.json(db.prepare("SELECT * FROM paint_products ORDER BY name, finish").all());
});

router.post("/products", (req, res) => {
  const { name, finish, coverageSqft, pricePerGallon, priceSource, notes } = req.body;
  if (!name) return res.status(400).json({ error: "Product name is required." });
  const result = db.prepare(`
    INSERT INTO paint_products (name, finish, coverage_sqft, price_per_gallon, updated_at, price_source, notes)
    VALUES (@name, @finish, @coverageSqft, @pricePerGallon, @now, @priceSource, @notes)
  `).run({
    name: name.trim(),
    finish: finish || null,
    coverageSqft: Number(coverageSqft || 350),
    pricePerGallon: Number(pricePerGallon || 0),
    now: new Date().toISOString().slice(0, 10),
    priceSource: priceSource || null,
    notes: notes || null,
  });
  res.status(201).json(db.prepare("SELECT * FROM paint_products WHERE id = ?").get(result.lastInsertRowid));
});

router.patch("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare("SELECT * FROM paint_products WHERE id = ?").get(id);
  if (!cur) return res.status(404).json({ error: "Product not found." });
  const { name, finish, coverageSqft, pricePerGallon, priceSource, notes } = req.body;
  db.prepare(`
    UPDATE paint_products SET
      name = @name, finish = @finish, coverage_sqft = @coverageSqft,
      price_per_gallon = @pricePerGallon, updated_at = @now,
      price_source = @priceSource, notes = @notes
    WHERE id = @id
  `).run({
    name: name ?? cur.name,
    finish: finish !== undefined ? (finish || null) : cur.finish,
    coverageSqft: coverageSqft != null ? Number(coverageSqft) : cur.coverage_sqft,
    pricePerGallon: pricePerGallon != null ? Number(pricePerGallon) : cur.price_per_gallon,
    now: new Date().toISOString().slice(0, 10),
    priceSource: priceSource !== undefined ? (priceSource || null) : cur.price_source,
    notes: notes !== undefined ? (notes || null) : cur.notes,
    id,
  });
  res.json(db.prepare("SELECT * FROM paint_products WHERE id = ?").get(id));
});

router.delete("/products/:id", (req, res) => {
  db.prepare("DELETE FROM paint_products WHERE id = ?").run(Number(req.params.id));
  res.status(204).end();
});

// ── Paint Estimates ───────────────────────────────────────────────────────────

router.get("/", (_req, res) => {
  const rows = db.prepare(`
    SELECT pe.*,
      c.name AS clientName,
      e.estimate_number AS estimateNumber,
      e.work_title AS estimateTitle
    FROM paint_estimates pe
    LEFT JOIN clients c ON c.id = pe.client_id
    LEFT JOIN estimates e ON e.id = pe.estimate_id
    ORDER BY pe.created_at DESC
  `).all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const {
    estimateId, projectName, clientId,
    totalSqft, numCoats, surfaceType,
    productId, productName, finish, pricePerGallon,
    discountPercent, taxAmount, marginAmount,
    coverageUsed, adjustedArea, gallonsNeeded, gallonsFinal,
    subtotal, discountAmount, total,
  } = req.body;

  if (!projectName || !totalSqft) {
    return res.status(400).json({ error: "Project name and area are required." });
  }

  const result = db.prepare(`
    INSERT INTO paint_estimates (
      estimate_id, project_name, client_id, total_sqft, num_coats, surface_type,
      product_id, product_name, finish, price_per_gallon, discount_percent,
      tax_amount, margin_amount, coverage_used, adjusted_area, gallons_needed,
      gallons_final, subtotal, discount_amount, total
    ) VALUES (
      @estimateId, @projectName, @clientId, @totalSqft, @numCoats, @surfaceType,
      @productId, @productName, @finish, @pricePerGallon, @discountPercent,
      @taxAmount, @marginAmount, @coverageUsed, @adjustedArea, @gallonsNeeded,
      @gallonsFinal, @subtotal, @discountAmount, @total
    )
  `).run({
    estimateId: estimateId ? Number(estimateId) : null,
    projectName: projectName.trim(),
    clientId: clientId ? Number(clientId) : null,
    totalSqft: Number(totalSqft),
    numCoats: Number(numCoats || 2),
    surfaceType: surfaceType || "medium",
    productId: productId ? Number(productId) : null,
    productName: productName || null,
    finish: finish || null,
    pricePerGallon: Number(pricePerGallon || 0),
    discountPercent: Number(discountPercent || 0),
    taxAmount: Number(taxAmount || 0),
    marginAmount: Number(marginAmount || 0),
    coverageUsed: Number(coverageUsed || 350),
    adjustedArea: Number(adjustedArea || 0),
    gallonsNeeded: Number(gallonsNeeded || 0),
    gallonsFinal: Number(gallonsFinal || 0),
    subtotal: Number(subtotal || 0),
    discountAmount: Number(discountAmount || 0),
    total: Number(total || 0),
  });

  res.status(201).json(db.prepare("SELECT * FROM paint_estimates WHERE id = ?").get(result.lastInsertRowid));
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM paint_estimates WHERE id = ?").run(Number(req.params.id));
  res.status(204).end();
});

module.exports = router;
