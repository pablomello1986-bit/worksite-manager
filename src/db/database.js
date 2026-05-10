const fs = require("node:fs");
const path = require("node:path");
const Database = require("libsql");

const dataDir = process.env.DATA_DIR || path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "worksite-manager.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Use Turso cloud sync when credentials are set (production), otherwise local only
const dbOptions = {};
if (process.env.TURSO_DATABASE_URL) {
  dbOptions.syncUrl = process.env.TURSO_DATABASE_URL;
  dbOptions.authToken = process.env.TURSO_AUTH_TOKEN || "";
  dbOptions.syncInterval = 30; // sync every 30 seconds in background
}

const db = new Database(dbPath, dbOptions);
db.exec("PRAGMA foreign_keys = ON;");

function getTableColumns(tableName) {
  return db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .map((column) => column.name);
}

function ensureColumn(tableName, columnName, definition) {
  const columns = getTableColumns(tableName);
  if (!columns.includes(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function initializeDatabase() {
  // On startup: pull latest data from Turso so deploys never lose data
  if (process.env.TURSO_DATABASE_URL) {
    await db.sync();
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      estimate_id INTEGER,
      forecast_id INTEGER,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      project_type TEXT,
      address TEXT,
      manager_name TEXT,
      description TEXT NOT NULL,
      total_value REAL NOT NULL CHECK (total_value >= 0),
      budget_value REAL NOT NULL DEFAULT 0 CHECK (budget_value >= 0),
      received_amount REAL NOT NULL DEFAULT 0 CHECK (received_amount >= 0),
      payment_method TEXT,
      installment_info TEXT,
      due_date TEXT,
      start_date TEXT NOT NULL,
      estimated_days INTEGER NOT NULL CHECK (estimated_days >= 0),
      status TEXT NOT NULL DEFAULT 'em andamento' CHECK (status IN ('em andamento', 'concluido')),
      notes TEXT,
      completed_at TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE SET NULL,
      FOREIGN KEY (forecast_id) REFERENCES forecasts(id) ON DELETE SET NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      logo_url TEXT,
      notes TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      phone TEXT,
      document_id TEXT,
      pix_key TEXT,
      daily_rate REAL NOT NULL CHECK (daily_rate >= 0),
      hourly_rate REAL NOT NULL DEFAULT 0 CHECK (hourly_rate >= 0),
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS labor_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      days_worked REAL NOT NULL CHECK (days_worked >= 0),
      amount_paid REAL NOT NULL CHECK (amount_paid >= 0),
      work_start_date TEXT NOT NULL,
      work_end_date TEXT,
      notes TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      supplier TEXT,
      invoice_number TEXT,
      unit TEXT,
      quantity REAL NOT NULL CHECK (quantity >= 0),
      unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
      cost REAL NOT NULL CHECK (cost >= 0),
      payment_status TEXT NOT NULL DEFAULT 'pago' CHECK (payment_status IN ('pago', 'pendente')),
      purchased_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS project_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      assigned_at TEXT NOT NULL,
      notes TEXT,
      UNIQUE(project_id, employee_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      received_at TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS forecasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      estimate_id INTEGER,
      project_id INTEGER,
      client_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      expected_start_date TEXT,
      estimated_labor_cost REAL NOT NULL DEFAULT 0,
      estimated_material_cost REAL NOT NULL DEFAULT 0,
      total_value REAL NOT NULL DEFAULT 0,
      company_percent REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'planejada' CHECK (status IN ('planejada', 'aprovada', 'convertida')),
      notes TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      project_id INTEGER,
      estimate_number TEXT NOT NULL,
      work_title TEXT NOT NULL,
      business_name TEXT,
      business_logo_url TEXT,
      issue_date TEXT NOT NULL,
      valid_until TEXT,
      description TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      tax_percent REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'rascunho',
      notes TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS estimate_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimate_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      unit_price REAL NOT NULL DEFAULT 0,
      line_total REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS overhead_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL CHECK (amount >= 0),
      spent_at TEXT NOT NULL,
      notes TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      action TEXT NOT NULL,
      summary TEXT NOT NULL,
      payload TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS estimate_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimate_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      client_email TEXT,
      expires_at TEXT NOT NULL,
      approved_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      related_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS paint_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      finish TEXT,
      coverage_sqft REAL NOT NULL DEFAULT 350,
      price_per_gallon REAL NOT NULL DEFAULT 0,
      price_source TEXT,
      notes TEXT,
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS project_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL UNIQUE,
      token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS project_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS project_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      phase TEXT NOT NULL DEFAULT 'progress',
      taken_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS paint_estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimate_id INTEGER,
      client_id INTEGER,
      project_name TEXT NOT NULL,
      total_sqft REAL NOT NULL,
      num_coats INTEGER NOT NULL DEFAULT 2,
      surface_type TEXT NOT NULL DEFAULT 'medium',
      product_id INTEGER,
      product_name TEXT,
      finish TEXT,
      price_per_gallon REAL NOT NULL DEFAULT 0,
      discount_percent REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      margin_amount REAL NOT NULL DEFAULT 0,
      coverage_used REAL NOT NULL DEFAULT 350,
      adjusted_area REAL NOT NULL DEFAULT 0,
      gallons_needed REAL NOT NULL DEFAULT 0,
      gallons_final INTEGER NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE SET NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES paint_products(id) ON DELETE SET NULL
    )
  `);

  ensureColumn("projects", "client_phone", "TEXT");
  ensureColumn("projects", "client_id", "INTEGER");
  ensureColumn("projects", "estimate_id", "INTEGER");
  ensureColumn("projects", "forecast_id", "INTEGER");
  ensureColumn("forecasts", "client_id", "INTEGER");
  ensureColumn("forecasts", "estimate_id", "INTEGER");
  ensureColumn("forecasts", "project_id", "INTEGER");
  ensureColumn("forecasts", "status", "TEXT NOT NULL DEFAULT 'planejada'");
  ensureColumn("projects", "project_type", "TEXT");
  ensureColumn("projects", "address", "TEXT");
  ensureColumn("projects", "manager_name", "TEXT");
  ensureColumn("projects", "budget_value", "REAL NOT NULL DEFAULT 0");
  ensureColumn("projects", "received_amount", "REAL NOT NULL DEFAULT 0");
  ensureColumn("projects", "payment_method", "TEXT");
  ensureColumn("projects", "installment_info", "TEXT");
  ensureColumn("projects", "due_date", "TEXT");
  ensureColumn("projects", "notes", "TEXT");
  ensureColumn("employees", "phone", "TEXT");
  ensureColumn("employees", "document_id", "TEXT");
  ensureColumn("employees", "pix_key", "TEXT");
  ensureColumn("employees", "hourly_rate", "REAL NOT NULL DEFAULT 0");
  ensureColumn("employees", "is_active", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn("materials", "category", "TEXT");
  ensureColumn("materials", "supplier", "TEXT");
  ensureColumn("materials", "invoice_number", "TEXT");
  ensureColumn("materials", "unit", "TEXT");
  ensureColumn("materials", "unit_price", "REAL NOT NULL DEFAULT 0");
  ensureColumn("materials", "payment_status", "TEXT NOT NULL DEFAULT 'pago'");
  ensureColumn("estimate_items", "process", "TEXT");
  ensureColumn("estimate_items", "material_responsibility", "TEXT NOT NULL DEFAULT 'empresa'");
  ensureColumn("estimate_items", "material_description", "TEXT");
  ensureColumn("estimate_tokens", "client_action", "TEXT");
  ensureColumn("estimate_tokens", "client_notes", "TEXT");
  ensureColumn("projects", "progress_percent", "INTEGER NOT NULL DEFAULT 0");

  // Seed SW paint products on first run
  const paintProductCount = db.prepare("SELECT COUNT(*) AS n FROM paint_products").get().n;
  if (paintProductCount === 0) {
    const seedProducts = [
      { name: "Emerald Interior", finish: "Flat",       coverage: 400, price: 89.99 },
      { name: "Emerald Interior", finish: "Matte",      coverage: 400, price: 89.99 },
      { name: "Emerald Interior", finish: "Eggshell",   coverage: 400, price: 89.99 },
      { name: "Emerald Interior", finish: "Satin",      coverage: 400, price: 89.99 },
      { name: "Duration Home",    finish: "Flat",       coverage: 350, price: 79.99 },
      { name: "Duration Home",    finish: "Matte",      coverage: 350, price: 79.99 },
      { name: "Duration Home",    finish: "Eggshell",   coverage: 350, price: 79.99 },
      { name: "Duration Home",    finish: "Satin",      coverage: 350, price: 79.99 },
      { name: "SuperPaint",       finish: "Flat",       coverage: 350, price: 59.99 },
      { name: "SuperPaint",       finish: "Eggshell",   coverage: 350, price: 59.99 },
      { name: "SuperPaint",       finish: "Satin",      coverage: 350, price: 59.99 },
      { name: "SuperPaint",       finish: "Semi-Gloss", coverage: 350, price: 59.99 },
      { name: "ProClassic",       finish: "Soft Gloss", coverage: 300, price: 69.99 },
      { name: "ProClassic",       finish: "Semi-Gloss", coverage: 300, price: 69.99 },
      { name: "ProClassic",       finish: "Gloss",      coverage: 300, price: 69.99 },
    ];
    const insertProduct = db.prepare(`
      INSERT INTO paint_products (name, finish, coverage_sqft, price_per_gallon, price_source, updated_at)
      VALUES (@name, @finish, @coverage, @price, 'Sherwin-Williams', @now)
    `);
    const now = new Date().toISOString().slice(0, 10);
    seedProducts.forEach((p) => insertProduct.run({ ...p, now }));
  }

  const legacyProjects = db
    .prepare(`
      SELECT p.id, p.received_amount AS receivedAmount, p.start_date AS startDate
      FROM projects p
      WHERE p.received_amount > 0
        AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.project_id = p.id)
    `)
    .all();

  const insertLegacyReceipt = db.prepare(`
    INSERT INTO receipts (project_id, amount, received_at, notes)
    VALUES (?, ?, ?, ?)
  `);

  legacyProjects.forEach((project) => {
    insertLegacyReceipt.run(
      project.id,
      Number(project.receivedAmount || 0),
      project.startDate || new Date().toISOString().slice(0, 10),
      "Saldo inicial migrado do cadastro da obra",
    );
  });

  // Push any schema changes to Turso after initialization
  if (process.env.TURSO_DATABASE_URL) {
    await db.sync();
  }
}

module.exports = {
  db,
  initializeDatabase,
};
