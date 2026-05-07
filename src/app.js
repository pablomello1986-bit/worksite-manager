const path = require("node:path");
const express = require("express");
const auditLogRoutes = require("./routes/auditLogs");
const clientRoutes = require("./routes/clients");
const dashboardRoutes = require("./routes/dashboard");
const employeeRoutes = require("./routes/employees");
const estimateRoutes = require("./routes/estimates");
const estimateApprovalRoutes = require("./routes/estimateApproval");
const forecastRoutes = require("./routes/forecasts");
const laborRecordRoutes = require("./routes/laborRecords");
const materialRoutes = require("./routes/materials");
const overheadExpenseRoutes = require("./routes/overheadExpenses");
const projectRoutes = require("./routes/projects");
const receiptRoutes = require("./routes/receipts");
const reportRoutes = require("./routes/reports");
const settingsRoutes = require("./routes/settings");
const aiRoutes = require("./routes/ai");

const app = express();

const publicDir = path.join(__dirname, "..", "public");

app.use(express.json());
app.use(express.static(publicDir));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/estimates", estimateRoutes);
app.use("/api/estimates", estimateApprovalRoutes);
app.use("/api", estimateApprovalRoutes);
app.use("/api/forecasts", forecastRoutes);
app.use("/api/labor-records", laborRecordRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/overhead-expenses", overheadExpenseRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);

// Serve the SPA for all non-API routes
app.use((_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

module.exports = app;
