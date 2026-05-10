const { db } = require("../db/database");

const projectsWithMetricsQuery = `
  SELECT
    p.id,
    p.client_id AS clientId,
    p.estimate_id AS estimateId,
    p.client_name AS clientName,
    p.client_phone AS clientPhone,
    p.project_type AS projectType,
    p.address,
    p.manager_name AS managerName,
    p.description,
    p.total_value AS totalValue,
    p.budget_value AS budgetValue,
    p.payment_method AS paymentMethod,
    p.installment_info AS installmentInfo,
    p.due_date AS dueDate,
    p.start_date AS startDate,
    p.estimated_days AS estimatedDays,
    p.status,
    p.notes,
    p.completed_at AS completedAt,
    COALESCE(p.progress_percent, 0) AS progressPercent,
    COALESCE((SELECT SUM(r.amount) FROM receipts r WHERE r.project_id = p.id), 0) AS receivedAmount,
    COALESCE((SELECT SUM(lr.amount_paid) FROM labor_records lr WHERE lr.project_id = p.id), 0) AS laborCost,
    COALESCE((SELECT SUM(m.cost) FROM materials m WHERE m.project_id = p.id), 0) AS materialCost,
    COALESCE((SELECT COUNT(*) FROM project_assignments pa WHERE pa.project_id = p.id), 0) AS assignedEmployees
  FROM projects p
`;

function normalizeProject(project) {
  const totalValue = Number(project.totalValue || 0);
  const budgetValue = Number(project.budgetValue || 0);
  const receivedAmount = Number(project.receivedAmount || 0);
  const laborCost = Number(project.laborCost || 0);
  const materialCost = Number(project.materialCost || 0);
  const totalCosts = laborCost + materialCost;

  return {
    ...project,
    totalValue,
    budgetValue,
    receivedAmount,
    laborCost,
    materialCost,
    totalCosts,
    progressPercent: Number(project.progressPercent || 0),
    assignedEmployees: Number(project.assignedEmployees || 0),
    profit: totalValue - totalCosts,
    remainingToReceive: totalValue - receivedAmount,
    budgetBalance: budgetValue - totalCosts,
    receivedBalance: receivedAmount - totalCosts,
  };
}

function getProjectsWithMetrics(filters = {}) {
  const conditions = [];
  const values = {};

  if (filters.status) {
    conditions.push("p.status = @status");
    values.status = filters.status;
  }

  const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  return db
    .prepare(`${projectsWithMetricsQuery}${whereClause} ORDER BY p.start_date DESC, p.id DESC`)
    .all(values)
    .map(normalizeProject);
}

function getProjectWithMetricsById(projectId) {
  const row = db.prepare(`${projectsWithMetricsQuery} WHERE p.id = ?`).get(projectId);
  return row ? normalizeProject(row) : null;
}

function getDashboardSummary() {
  const projects = getProjectsWithMetrics();
  const totalPaidLabor = projects.reduce((sum, project) => sum + project.laborCost, 0);
  const totalPaidMaterials = projects.reduce((sum, project) => sum + project.materialCost, 0);

  return {
    totalProjects: projects.length,
    inProgressProjects: projects.filter((project) => project.status === "em andamento").length,
    completedProjects: projects.filter((project) => project.status === "concluido").length,
    totalRevenue: projects.reduce((sum, project) => sum + project.totalValue, 0),
    totalReceived: projects.reduce((sum, project) => sum + project.receivedAmount, 0),
    totalRemainingToReceive: projects.reduce((sum, project) => sum + project.remainingToReceive, 0),
    totalReceivedBalance: projects.reduce((sum, project) => sum + project.receivedBalance, 0),
    totalLaborCost: totalPaidLabor,
    totalMaterialCost: totalPaidMaterials,
    totalPaidLabor,
    totalPaidMaterials,
    totalPaidOverall: totalPaidLabor + totalPaidMaterials,
    totalProfit: projects.reduce((sum, project) => sum + project.profit, 0),
  };
}

module.exports = {
  getDashboardSummary,
  getProjectsWithMetrics,
  getProjectWithMetricsById,
};
