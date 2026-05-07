const express = require("express");
const { db } = require("../db/database");
const { writeAuditLog } = require("../services/auditLog");

const router = express.Router();

const clientSelect = `
  SELECT
    id,
    name,
    company_name AS companyName,
    phone,
    email,
    address,
    logo_url AS logoUrl,
    notes
  FROM clients
`;

router.get("/", (_request, response) => {
  const clients = db.prepare(`${clientSelect} ORDER BY name ASC, id DESC`).all();
  response.json(clients);
});

router.post("/", (request, response) => {
  const { name, companyName, phone, email, address, logoUrl, notes } = request.body;

  if (!name) {
    return response.status(400).json({ error: "Informe o nome do cliente." });
  }

  const result = db.prepare(`
    INSERT INTO clients (name, company_name, phone, email, address, logo_url, notes)
    VALUES (@name, @companyName, @phone, @email, @address, @logoUrl, @notes)
  `).run({
    name,
    companyName: companyName || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
    logoUrl: logoUrl || null,
    notes: notes || null,
  });

  const client = db.prepare(`${clientSelect} WHERE id = ?`).get(result.lastInsertRowid);
  writeAuditLog({
    entityType: "client",
    entityId: client.id,
    action: "create",
    summary: `Cliente ${client.name} cadastrado.`,
    payload: client,
  });
  response.status(201).json(client);
});

router.patch("/:id", (request, response) => {
  const clientId = Number(request.params.id);
  const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(clientId);

  if (!client) {
    return response.status(404).json({ error: "Cliente nao encontrado." });
  }

  db.prepare(`
    UPDATE clients
    SET
      name = @name,
      company_name = @companyName,
      phone = @phone,
      email = @email,
      address = @address,
      logo_url = @logoUrl,
      notes = @notes
    WHERE id = @clientId
  `).run({
    name: request.body.name ?? client.name,
    companyName: request.body.companyName ?? client.company_name,
    phone: request.body.phone ?? client.phone,
    email: request.body.email ?? client.email,
    address: request.body.address ?? client.address,
    logoUrl: request.body.logoUrl ?? client.logo_url,
    notes: request.body.notes ?? client.notes,
    clientId,
  });

  const updatedClient = db.prepare(`${clientSelect} WHERE id = ?`).get(clientId);
  writeAuditLog({
    entityType: "client",
    entityId: updatedClient.id,
    action: "update",
    summary: `Cliente ${updatedClient.name} atualizado.`,
    payload: updatedClient,
  });
  response.json(updatedClient);
});

router.delete("/:id", (request, response) => {
  const clientId = Number(request.params.id);
  const client = db.prepare(`${clientSelect} WHERE id = ?`).get(clientId);

  if (!client) {
    return response.status(404).json({ error: "Cliente nao encontrado." });
  }

  db.prepare("UPDATE projects SET client_id = NULL WHERE client_id = ?").run(clientId);
  db.prepare("UPDATE estimates SET client_id = NULL WHERE client_id = ?").run(clientId);
  db.prepare("DELETE FROM clients WHERE id = ?").run(clientId);

  writeAuditLog({
    entityType: "client",
    entityId: client.id,
    action: "delete",
    summary: `Cliente ${client.name} removido.`,
    payload: client,
  });
  response.status(204).send();
});

module.exports = router;
