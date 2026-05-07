const express = require("express");
const { db } = require("../db/database");

const router = express.Router();

router.get("/", (request, response) => {
  const limit = Math.min(Number(request.query.limit || 20), 100);
  const logs = db
    .prepare(`
      SELECT
        id,
        entity_type AS entityType,
        entity_id AS entityId,
        action,
        summary,
        payload,
        created_at AS createdAt
      FROM audit_logs
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ?
    `)
    .all(limit)
    .map((item) => ({
      ...item,
      payload: item.payload ? JSON.parse(item.payload) : null,
    }));

  response.json(logs);
});

module.exports = router;
