const express = require("express");
const { db } = require("../db/database");

const router = express.Router();

const FIELDS = [
  "company_name",
  "responsible_name",
  "phone",
  "email",
  "website",
  "address",
  "logo_url",
  "notes",
  "anthropic_api_key",
];

function getSettings() {
  const rows = db.prepare("SELECT key, value FROM company_settings").all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

router.get("/", (_req, res) => {
  res.json(getSettings());
});

router.put("/", (req, res) => {
  const upsert = db.prepare(
    "INSERT INTO company_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );

  for (const field of FIELDS) {
    if (field in req.body) {
      upsert.run(field, req.body[field] ?? "");
    }
  }

  res.json(getSettings());
});

module.exports = router;
