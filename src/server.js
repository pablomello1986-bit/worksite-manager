const app = require("./app");
const { initializeDatabase } = require("./db/database");

const port = process.env.PORT || 3000;

(async () => {
  await initializeDatabase();
  app.listen(port, "0.0.0.0", () => {
    console.log(`WorkSite Manager rodando em http://localhost:${port}`);
  });
})();
