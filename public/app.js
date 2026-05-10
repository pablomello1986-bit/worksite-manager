const state = {
  companySettings: {},
  dashboard: null,
  clients: [],
  estimates: [],
  estimateItemsDraft: [],
  projects: [],
  employees: [],
  laborRecords: [],
  materials: [],
  receipts: [],
  overheadExpenses: [],
  forecasts: [],
  auditLogs: [],
  weeklyPayments: null,
  projectAssignments: [],
  search: {
    clients: "",
    employees: "",
    estimates: "",
    forecasts: "",
    materials: "",
    projects: "",
  },
  selectedProjectId: null,
  selectedProjectOverview: null,
  selectedClientId: null,
  editingProjectId: null,
  editingClientId: null,
  editingEstimateId: null,
  editingLaborRecordId: null,
  editingEmployeeId: null,
  editingMaterialId: null,
  editingReceiptId: null,
  editingForecastId: null,
  editingOverheadExpenseId: null,
};

const elements = {
  sectionTitle: document.querySelector("#section-title"),
  navButtons: Array.from(document.querySelectorAll("[data-section]")),
  sections: Array.from(document.querySelectorAll(".content-section")),
  globalProjectSelect: document.querySelector("#global-project-select"),
  globalStatusFilter: document.querySelector("#global-status-filter"),
  globalPeriodFilter: document.querySelector("#global-period-filter"),
  globalReferenceDate: document.querySelector("#global-reference-date"),
  summaryTotalProjects: document.querySelector("#summary-total-projects"),
  summaryInProgress: document.querySelector("#summary-in-progress"),
  summaryCompleted: document.querySelector("#summary-completed"),
  summaryProfit: document.querySelector("#summary-profit"),
  dashboardEstimateStatusFilter: document.querySelector("#dashboard-estimate-status-filter"),
  estimateSentCount: document.querySelector("#estimate-sent-count"),
  estimateApprovedCount: document.querySelector("#estimate-approved-count"),
  estimateDeclinedCount: document.querySelector("#estimate-declined-count"),
  estimateConversionRate: document.querySelector("#estimate-conversion-rate"),
  heroProfit: document.querySelector("#hero-profit"),
  sidebarOutstanding: document.querySelector("#sidebar-outstanding"),
  paymentPaidLabor: document.querySelector("#payment-paid-labor"),
  paymentPaidMaterials: document.querySelector("#payment-paid-materials"),
  paymentPaidOverall: document.querySelector("#payment-paid-overall"),
  paymentProfitRemaining: document.querySelector("#payment-profit-remaining"),
  overheadTotal: document.querySelector("#overhead-total"),
  overheadProfitAfter: document.querySelector("#overhead-profit-after"),
  overheadImpactPercent: document.querySelector("#overhead-impact-percent"),
  overheadHealthLabel: document.querySelector("#overhead-health-label"),
  weeklyReportForm: document.querySelector("#weekly-report-form"),
  weekStartDate: document.querySelector("#week-start-date"),
  weeklyLaborTotal: document.querySelector("#weekly-labor-total"),
  weeklyMaterialTotal: document.querySelector("#weekly-material-total"),
  weeklyOverallTotal: document.querySelector("#weekly-overall-total"),
  weeklyPeriodLabel: document.querySelector("#weekly-period-label"),
  selectedProjectSummary: document.querySelector("#selected-project-summary"),
  weeklyEmployeesList: document.querySelector("#weekly-employees-list"),
  weeklyProjectsList: document.querySelector("#weekly-projects-list"),
  weeklyMaterialsList: document.querySelector("#weekly-materials-list"),
  barProgress: document.querySelector("#bar-progress"),
  barProgressLabel: document.querySelector("#bar-progress-label"),
  barCompleted: document.querySelector("#bar-completed"),
  barCompletedLabel: document.querySelector("#bar-completed-label"),
  financialStack: document.querySelector("#financial-stack"),
  executiveStack: document.querySelector("#executive-stack"),
  dashboardAlertsList: document.querySelector("#dashboard-alerts-list"),
  dashboardRecentList: document.querySelector("#dashboard-recent-list"),
  projectSearch: document.querySelector("#project-search"),
  projectsList: document.querySelector("#projects-list"),
  projectDetail: document.querySelector("#project-detail"),
  clientSearch: document.querySelector("#client-search"),
  clientsList: document.querySelector("#clients-list"),
  estimateSearch: document.querySelector("#estimate-search"),
  estimatesList: document.querySelector("#estimates-list"),
  productionEstimatesList: document.querySelector("#production-estimates-list"),
  productionForecastsList: document.querySelector("#production-forecasts-list"),
  productionProjectsList: document.querySelector("#production-projects-list"),
  estimateStatusFilter: document.querySelector("#estimate-status-filter"),
  estimateItemsEditor: document.querySelector("#estimate-items-editor"),
  estimateLivePreview: document.querySelector("#estimate-live-preview"),
  estimateSubtotal: document.querySelector("#estimate-subtotal"),
  estimateTaxAmount: document.querySelector("#estimate-tax-amount"),
  estimateTotalAmount: document.querySelector("#estimate-total-amount"),
  receiptsList: document.querySelector("#receipts-list"),
  overheadExpensesList: document.querySelector("#overhead-expenses-list"),
  overheadInsights: document.querySelector("#overhead-insights"),
  materialSearch: document.querySelector("#material-search"),
  materialsCatalogList: document.querySelector("#materials-catalog-list"),
  auditLogList: document.querySelector("#audit-log-list"),
  employeeSearch: document.querySelector("#employee-search"),
  employeesList: document.querySelector("#employees-list"),
  employeePaymentsList: document.querySelector("#employee-payments-list"),
  projectsTableBody: document.querySelector("#projects-table-body"),
  laborRecordsList: document.querySelector("#labor-records-list"),
  materialsList: document.querySelector("#materials-list"),
  reportStatusFilter: document.querySelector("#report-status-filter"),
  projectForm: document.querySelector("#project-form"),
  clientForm: document.querySelector("#client-form"),
  clientSubmitButton: document.querySelector("#client-submit-button"),
  clientCancelEdit: document.querySelector("#client-cancel-edit"),
  clientEditStatus: document.querySelector("#client-edit-status"),
  estimateForm: document.querySelector("#estimate-form"),
  estimateSubmitButton: document.querySelector("#estimate-submit-button"),
  estimatePdfButton: document.querySelector("#estimate-pdf-button"),
  estimateConvertButton: document.querySelector("#estimate-convert-button"),
  estimateCancelEdit: document.querySelector("#estimate-cancel-edit"),
  estimateEditStatus: document.querySelector("#estimate-edit-status"),
  estimateAddItemButton: document.querySelector("#estimate-add-item"),
  projectSubmitButton: document.querySelector("#project-submit-button"),
  projectCancelEdit: document.querySelector("#project-cancel-edit"),
  projectEditStatus: document.querySelector("#project-edit-status"),
  employeeForm: document.querySelector("#employee-form"),
  employeeSubmitButton: document.querySelector("#employee-submit-button"),
  employeeCancelEdit: document.querySelector("#employee-cancel-edit"),
  employeeEditStatus: document.querySelector("#employee-edit-status"),
  assignmentForm: document.querySelector("#assignment-form"),
  laborForm: document.querySelector("#labor-form"),
  laborSubmitButton: document.querySelector("#labor-submit-button"),
  laborCancelEdit: document.querySelector("#labor-cancel-edit"),
  laborEditStatus: document.querySelector("#labor-edit-status"),
  materialForm: document.querySelector("#material-form"),
  materialSubmitButton: document.querySelector("#material-submit-button"),
  materialCancelEdit: document.querySelector("#material-cancel-edit"),
  materialEditStatus: document.querySelector("#material-edit-status"),
  forecastForm: document.querySelector("#forecast-form"),
  forecastSubmitButton: document.querySelector("#forecast-submit-button"),
  forecastCancelEdit: document.querySelector("#forecast-cancel-edit"),
  forecastEditStatus: document.querySelector("#forecast-edit-status"),
  receiptForm: document.querySelector("#receipt-form"),
  receiptSubmitButton: document.querySelector("#receipt-submit-button"),
  receiptCancelEdit: document.querySelector("#receipt-cancel-edit"),
  receiptEditStatus: document.querySelector("#receipt-edit-status"),
  overheadForm: document.querySelector("#overhead-form"),
  overheadSubmitButton: document.querySelector("#overhead-submit-button"),
  overheadCancelEdit: document.querySelector("#overhead-cancel-edit"),
  overheadEditStatus: document.querySelector("#overhead-edit-status"),
  assignmentProjectSelect: document.querySelector("#assignment-project-select"),
  assignmentEmployeeSelect: document.querySelector("#assignment-employee-select"),
  assignmentDailyRateDisplay: document.querySelector("#assignment-daily-rate"),
  assignmentTotalDisplay: document.querySelector("#assignment-total"),
  assignmentDaysWorked: document.querySelector("#assignment-days-worked"),
  estimateClientSelect: document.querySelector("#estimate-client-select"),
  estimateProjectSelect: document.querySelector("#estimate-project-select"),
  laborProjectSelect: document.querySelector("#labor-project-select"),
  laborEmployeeSelect: document.querySelector("#labor-employee-select"),
  materialProjectSelect: document.querySelector("#material-project-select"),
  receiptProjectSelect: document.querySelector("#receipt-project-select"),
  projectAssignmentsList: document.querySelector("#project-assignments-list"),
  forecastSearch: document.querySelector("#forecast-search"),
  forecastsList: document.querySelector("#forecasts-list"),
  exportProjectsLink: document.querySelector("#export-projects-link"),
  exportCashflowLink: document.querySelector("#export-cashflow-link"),
  emptyStateTemplate: document.querySelector("#empty-state-template"),
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function formatDate(dateString) {
  if (!dateString) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-US").format(new Date(`${dateString}T00:00:00`));
}

function formatDateTime(dateString) {
  if (!dateString) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeSearchValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesSearch(searchTerm, ...values) {
  if (!searchTerm) {
    return true;
  }

  const normalizedTerm = normalizeSearchValue(searchTerm);
  return values.some((value) => normalizeSearchValue(value).includes(normalizedTerm));
}

function getSearchEmptyMarkup(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });
}

function getEstimateDraftTotals() {
  const subtotal = state.estimateItemsDraft.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    return sum + quantity * unitPrice;
  }, 0);
  const discountAmount = Number(elements.estimateForm?.elements.discountAmount.value || 0);
  const taxPercent = Number(elements.estimateForm?.elements.taxPercent.value || 0);
  const taxableBase = Math.max(subtotal - discountAmount, 0);
  const taxAmount = taxableBase * (taxPercent / 100);
  const totalAmount = taxableBase + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxPercent,
    taxAmount,
    totalAmount,
  };
}

function getWeekDates(startDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    startDate,
    endDate: end.toISOString().slice(0, 10),
  };
}

function getCurrentWeekStart() {
  const today = new Date();
  const currentDay = today.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  today.setDate(today.getDate() + diffToMonday);
  return today.toISOString().slice(0, 10);
}

function getDateRangeForFilters() {
  const period = elements.globalPeriodFilter.value;
  const referenceDate = elements.globalReferenceDate.value;

  if (!referenceDate || period === "all") {
    return null;
  }

  const start = new Date(`${referenceDate}T00:00:00`);
  const end = new Date(start);

  if (period === "week") {
    const currentDay = start.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    start.setDate(start.getDate() + diffToMonday);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  }

  if (period === "month") {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1, 0);
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function inDateRange(dateString, range) {
  if (!range || !dateString) {
    return true;
  }

  return dateString >= range.startDate && dateString <= range.endDate;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unexpected error." }));
    throw new Error(error.error || "Unexpected error.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function renderList(container, items, renderer, emptyMarkup = elements.emptyStateTemplate.innerHTML) {
  container.innerHTML = items.length
    ? items.map(renderer).join("")
    : emptyMarkup;
}

function renderDashboard() {
  const summary = state.dashboard;
  if (!summary) {
    return;
  }

  const range = getDateRangeForFilters();
  const statusFilter = elements.globalStatusFilter.value;
  const projectPool = statusFilter
    ? state.projects.filter((project) => project.status === statusFilter)
    : state.projects;
  const scopedProjects = state.selectedProjectId
    ? projectPool.filter((project) => project.id === state.selectedProjectId)
    : projectPool;
  const scopedProject = state.selectedProjectId
    ? scopedProjects.find((project) => project.id === state.selectedProjectId) || null
    : null;
  const scopedProjectIds = scopedProjects.map((project) => project.id);
  const receiptsInRange = state.receipts.filter(
    (receipt) => scopedProjectIds.includes(receipt.projectId) && inDateRange(receipt.receivedAt, range),
  );
  const laborInRange = state.laborRecords.filter(
    (record) => scopedProjectIds.includes(record.projectId) && inDateRange(record.workEndDate || record.workStartDate, range),
  );
  const materialsInRange = state.materials.filter(
    (material) => scopedProjectIds.includes(material.projectId) && inDateRange(material.purchasedAt, range),
  );
  const receivedInPeriod = receiptsInRange.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
  const laborInPeriod = laborInRange.reduce((sum, record) => sum + Number(record.amountPaid || 0), 0);
  const materialsInPeriod = materialsInRange.reduce((sum, material) => sum + Number(material.cost || 0), 0);
  const totalSpentInPeriod = laborInPeriod + materialsInPeriod;
  const profitInPeriod = receivedInPeriod - totalSpentInPeriod;
  const totalRevenue = scopedProjects.reduce((sum, project) => sum + Number(project.totalValue || 0), 0);
  const totalReceivedOverall = scopedProjects.reduce((sum, project) => sum + Number(project.receivedAmount || 0), 0);
  const totalRemainingOverall = scopedProjects.reduce((sum, project) => sum + Number(project.remainingToReceive || 0), 0);
  const totalCostOverall = scopedProjects.reduce((sum, project) => sum + Number(project.totalCosts || 0), 0);
  const totalProfitOverall = scopedProjects.reduce((sum, project) => sum + Number(project.profit || 0), 0);
  const totalReceivedBalanceOverall = scopedProjects.reduce((sum, project) => sum + Number(project.receivedBalance || 0), 0);
  const overheadInRange = state.overheadExpenses.filter((expense) => inDateRange(expense.spentAt, range));
  const overheadTotal = overheadInRange.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const profitBasis = range ? profitInPeriod : totalProfitOverall;
  const profitAfterOverhead = profitBasis - overheadTotal;
  const overheadImpactPercent = profitBasis > 0 ? (overheadTotal / profitBasis) * 100 : overheadTotal > 0 ? 100 : 0;
  const overheadHealthLabel =
    overheadImpactPercent <= 10
      ? "Controlled"
      : overheadImpactPercent <= 25
        ? "Attention"
        : "High impact";

  if (scopedProject) {
    elements.selectedProjectSummary.innerHTML = [
      ["Received", scopedProject.receivedAmount, ""],
      ["Labor cost", scopedProject.laborCost, ""],
      ["Material cost", scopedProject.materialCost, ""],
      [
        "Profit",
        scopedProject.profit,
        scopedProject.profit >= 0 ? "success" : "danger",
      ],
      [
        "Received balance",
        scopedProject.receivedBalance,
        scopedProject.receivedBalance >= 0 ? "success" : "danger",
      ],
    ]
      .map(
        ([label, value, tone]) => `
          <article class="payment-card ${tone}">
            <span>${label}</span>
            <strong>${formatCurrency(value)}</strong>
          </article>
        `,
      )
      .join("");
  } else {
    elements.selectedProjectSummary.innerHTML = `
      <div class="empty-state">
        Select a project above to see the individual summary with received amounts, costs, and profit.
      </div>
    `;
  }

  elements.summaryTotalProjects.textContent = scopedProjects.length;
  elements.summaryInProgress.textContent = scopedProjects.filter((project) => project.status === "em andamento").length;
  elements.summaryCompleted.textContent = scopedProjects.filter((project) => project.status === "concluido").length;
  elements.summaryProfit.textContent = formatCurrency(range ? profitInPeriod : totalProfitOverall);
  elements.heroProfit.textContent = formatCurrency(range ? profitInPeriod : totalProfitOverall);
  elements.sidebarOutstanding.textContent = `${formatCurrency(totalRemainingOverall)} outstanding`;
  elements.paymentPaidLabor.textContent = formatCurrency(range ? laborInPeriod : scopedProjects.reduce((sum, project) => sum + Number(project.laborCost || 0), 0));
  elements.paymentPaidMaterials.textContent = formatCurrency(range ? materialsInPeriod : scopedProjects.reduce((sum, project) => sum + Number(project.materialCost || 0), 0));
  elements.paymentPaidOverall.textContent = formatCurrency(range ? totalSpentInPeriod : totalCostOverall);
  elements.paymentProfitRemaining.textContent = formatCurrency(range ? profitInPeriod : totalReceivedBalanceOverall);
  elements.overheadTotal.textContent = formatCurrency(overheadTotal);
  elements.overheadProfitAfter.textContent = formatCurrency(profitAfterOverhead);
  elements.overheadImpactPercent.textContent = formatPercent(overheadImpactPercent);
  elements.overheadHealthLabel.textContent = overheadHealthLabel;
  const dashboardEstimateFilter = elements.dashboardEstimateStatusFilter.value;
  const scopedEstimates = dashboardEstimateFilter
    ? state.estimates.filter((estimate) => estimate.status === dashboardEstimateFilter)
    : state.estimates;
  const sentCount = scopedEstimates.filter((estimate) => estimate.status === "enviado").length;
  const approvedCount = scopedEstimates.filter((estimate) => estimate.status === "aprovado").length;
  const declinedCount = scopedEstimates.filter((estimate) => estimate.status === "recusado").length;
  const convertedCount = scopedEstimates.filter((estimate) => estimate.status === "convertido").length;
  const conversionRate = scopedEstimates.length ? (convertedCount / scopedEstimates.length) * 100 : 0;
  elements.estimateSentCount.textContent = String(sentCount);
  elements.estimateApprovedCount.textContent = String(approvedCount);
  elements.estimateDeclinedCount.textContent = String(declinedCount);
  elements.estimateConversionRate.textContent = formatPercent(conversionRate);

  const totalProjects = Math.max(summary.totalProjects, 1);
  const progressValue = scopedProjects.filter((project) => project.status === "em andamento").length;
  const completedValue = scopedProjects.filter((project) => project.status === "concluido").length;
  const totalForBars = Math.max(scopedProjects.length || totalProjects, 1);
  elements.barProgress.style.width = `${(progressValue / totalForBars) * 100}%`;
  elements.barCompleted.style.width = `${(completedValue / totalForBars) * 100}%`;
  elements.barProgressLabel.textContent = progressValue;
  elements.barCompletedLabel.textContent = completedValue;

  const financialItems = range
    ? [
        ["Received in period", receivedInPeriod],
        ["Labor cost", laborInPeriod],
        ["Material cost", materialsInPeriod],
        ["Total spent", totalSpentInPeriod],
        ["Profit in period", profitInPeriod],
      ]
    : [
        ["Contracted revenue", totalRevenue],
        ["Received from client", totalReceivedOverall],
        ["Total paid", totalCostOverall],
        ["Received balance", totalReceivedBalanceOverall],
        ["Outstanding", totalRemainingOverall],
        ["Profit", totalProfitOverall],
      ];

  elements.financialStack.innerHTML = financialItems
    .map(
      ([label, value]) => `
        <div class="metric-chip">
          <span>${label}</span>
          <strong>${formatCurrency(value)}</strong>
        </div>
      `,
    )
    .join("");

  const topProfitProject = scopedProjects.reduce(
    (best, project) => (!best || Number(project.profit || 0) > Number(best.profit || 0) ? project : best),
    null,
  );
  const riskProjects = scopedProjects.filter((project) => Number(project.receivedBalance || 0) < 0);
  const overdueProjects = scopedProjects.filter(
    (project) =>
      project.status === "em andamento" &&
      project.dueDate &&
      project.dueDate < new Date().toISOString().slice(0, 10),
  );
  const executiveItems = [
    ["Most profitable", topProfitProject ? `${topProfitProject.clientName} (${formatCurrency(topProfitProject.profit)})` : "No data"],
    ["Projects at risk", String(riskProjects.length)],
    ["Outstanding to receive", formatCurrency(totalRemainingOverall)],
    ["Received minus spent", formatCurrency(totalReceivedBalanceOverall)],
  ];

  elements.executiveStack.innerHTML = executiveItems
    .map(
      ([label, value]) => `
        <div class="metric-chip">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");

  const alerts = [
    ...riskProjects.map((project) => ({
      title: `${project.clientName}: spending above received`,
      detail: `Received balance is ${formatCurrency(project.receivedBalance)}.`,
    })),
    ...overdueProjects.map((project) => ({
      title: `${project.clientName}: overdue project`,
      detail: `Due date was ${formatDate(project.dueDate)}.`,
    })),
    ...scopedProjects
      .filter((project) => Number(project.budgetBalance || 0) < 0)
      .map((project) => ({
        title: `${project.clientName}: over budget`,
        detail: `Budget balance is ${formatCurrency(project.budgetBalance)}.`,
      })),
  ].slice(0, 8);

  renderList(
    elements.dashboardAlertsList,
    alerts,
    (item) => `
      <article class="list-item alert-item">
        <strong>${item.title}</strong>
        <p>${item.detail}</p>
      </article>
    `,
  );

  const scopedLaborRecords = state.laborRecords.filter(
    (record) => scopedProjectIds.includes(record.projectId) && inDateRange(record.workEndDate || record.workStartDate, range),
  );
  const scopedMaterials = state.materials.filter(
    (material) => scopedProjectIds.includes(material.projectId) && inDateRange(material.purchasedAt, range),
  );

  const recentItems = [
    ...scopedLaborRecords.slice(0, 3).map((record) => ({
      title: `${record.employeeName} - ${record.projectClient}`,
      subtitle: `Employee payment on ${formatDate(record.workEndDate || record.workStartDate)}`,
      value: formatCurrency(record.amountPaid),
    })),
    ...scopedMaterials.slice(0, 3).map((material) => ({
      title: `${material.name} - ${material.projectClient}`,
      subtitle: `Material on ${formatDate(material.purchasedAt)}`,
      value: formatCurrency(material.cost),
    })),
  ].slice(0, 5);

  renderList(
    elements.dashboardRecentList,
    recentItems,
    (item) => `
      <article class="list-item">
        <strong>${item.title}</strong>
        <p>${item.subtitle}</p>
        <p>${item.value}</p>
      </article>
    `,
  );
}

function makeStatusPill(status) {
  return status === "concluido"
    ? '<span class="status-pill done">Completed</span>'
    : '<span class="status-pill progress">In Progress</span>';
}

function renderProjectsList() {
  const statusFilter = elements.globalStatusFilter.value;
  const filteredProjects = statusFilter
    ? state.projects.filter((project) => project.status === statusFilter)
    : state.projects;
  const visibleProjects = filteredProjects.filter((project) =>
    matchesSearch(
      state.search.projects,
      project.clientName,
      project.projectType,
      project.description,
      project.address,
      project.managerName,
    ),
  );

  renderList(
    elements.projectsList,
    visibleProjects,
    (project) => `
      <article class="project-card ${project.id === state.selectedProjectId ? "active" : ""}">
        <strong>${project.clientName}</strong>
        <p>${project.projectType || "Type not provided"}</p>
        <p>${makeStatusPill(project.status)}</p>
        <p>Profit: <span class="${project.profit >= 0 ? "money-positive" : "money-negative"}">${formatCurrency(project.profit)}</span></p>
        <div class="inline-actions">
          <button class="button-secondary" data-open-project="${project.id}">Open details</button>
          <button class="button-secondary" data-edit-project="${project.id}">Edit</button>
          ${
            project.status === "em andamento"
              ? `<button class="button-primary" data-complete-project="${project.id}">Complete</button>`
              : ""
          }
          <button class="button-danger" data-delete-project="${project.id}">Delete</button>
        </div>
      </article>
    `,
    getSearchEmptyMarkup("No projects found with this filter."),
  );

  document.querySelectorAll("[data-open-project]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedProjectId = Number(button.dataset.openProject);
      await refreshSelectedProjectOverview();
      renderSelects();
      renderDashboard();
      renderProjectsList();
      renderProjectDetail();
      renderProjectAssignments();
      renderLaborRecords();
      renderMaterials();
      renderWeeklyPayments();
      renderProjectsTable();
    });
  });

  document.querySelectorAll("[data-complete-project]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api(`/api/projects/${button.dataset.completeProject}/complete`, { method: "PATCH" });
      await refreshAll();
    });
  });

  document.querySelectorAll("[data-edit-project]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = state.projects.find((item) => item.id === Number(button.dataset.editProject));
      if (project) {
        loadProjectIntoForm(project);
      }
    });
  });

  document.querySelectorAll("[data-delete-project]").forEach((button) => {
    button.addEventListener("click", async () => {
      const project = state.projects.find((item) => item.id === Number(button.dataset.deleteProject));
      if (!project || !await showConfirm("Delete project", `Delete "${project.clientName}"? This removes related payments, materials and receipts.`)) {
        return;
      }

      await api(`/api/projects/${project.id}`, { method: "DELETE" });
      if (state.selectedProjectId === project.id) {
        state.selectedProjectId = null;
      }
      resetProjectForm();
      showToast("Project deleted", "success");
      await refreshAll();
    });
  });
}

function renderProjectDetail() {
  const projectLayout = document.querySelector(".project-layout");

  if (!state.selectedProjectOverview) {
    elements.projectDetail.innerHTML = elements.emptyStateTemplate.innerHTML;
    if (projectLayout) projectLayout.classList.remove("detail-open");
    return;
  }

  if (projectLayout) projectLayout.classList.add("detail-open");

  const { project, assignments, laborRecords, materials } = state.selectedProjectOverview;

  elements.projectDetail.innerHTML = `
    <div class="detail-block">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:10px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="button-secondary narrow-button" id="btn-back-to-list">&#8592; Back</button>
          <div>
            <p class="section-tag" style="margin:0 0 4px;">Project details</p>
            <strong style="font-size:1.05rem;">${project.clientName}</strong>
            ${makeStatusPill(project.status)}
          </div>
        </div>
        <div class="inline-actions" style="margin-top:0;flex-shrink:0;">
          <button class="button-secondary narrow-button" data-edit-project="${project.id}">Edit</button>
          <button class="button-danger narrow-button" data-delete-project="${project.id}">Delete</button>
        </div>
      </div>
      <p style="color:var(--muted);margin:0 0 12px;font-size:0.85rem;line-height:1.5;">${project.description}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${[
          ["Address", project.address || "Not provided"],
          ["Phone", project.clientPhone || "Not provided"],
          ["Manager", project.managerName || "Not provided"],
          ["Payment", project.paymentMethod || "Not provided"],
          ["Installments", project.installmentInfo || "Not provided"],
          ["Due date", formatDate(project.dueDate)],
        ].map(([k,v]) => `<div style="font-size:0.8rem;"><span style="display:block;color:var(--muted);font-weight:600;text-transform:uppercase;font-size:0.68rem;letter-spacing:.08em;margin-bottom:2px;">${k}</span>${v}</div>`).join("")}
      </div>
      ${project.notes ? `<p style="margin:12px 0 0;font-size:0.82rem;color:var(--muted);border-top:1px solid var(--line);padding-top:10px;">${project.notes}</p>` : ""}
    </div>
    <div class="detail-block">
      <p class="section-tag" style="margin:0 0 10px;">Financials</p>
      <div style="display:grid;gap:8px;">
        ${[
          ["Contracted amount", formatCurrency(project.totalValue), ""],
          ["Estimated budget", formatCurrency(project.budgetValue), ""],
          ["Amount received", formatCurrency(project.receivedAmount), ""],
          ["Received balance", formatCurrency(project.receivedBalance), project.receivedBalance >= 0 ? "money-positive" : "money-negative"],
          ["Outstanding", formatCurrency(project.remainingToReceive), ""],
          ["Total cost", formatCurrency(project.totalCosts), ""],
          ["Budget balance", formatCurrency(project.budgetBalance), ""],
          ["Current profit", formatCurrency(project.profit), project.profit >= 0 ? "money-positive" : "money-negative"],
        ].map(([k,v,cls]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:0.85rem;">
            <span style="color:var(--muted);">${k}</span>
            <strong class="${cls}">${v}</strong>
          </div>`).join("")}
      </div>
    </div>
    <div class="detail-block">
      <p class="section-tag" style="margin:0 0 8px;">Allocated team (${assignments.length})</p>
      ${assignments.length
        ? assignments.map((a) => `
            <div style="display:flex;justify-content:space-between;font-size:0.83rem;padding:5px 0;border-bottom:1px solid var(--line);">
              <span>${a.employeeName}${a.role ? ` <span style="color:var(--muted);">— ${a.role}</span>` : ""}</span>
              <strong>${formatCurrency(a.dailyRate)}/day</strong>
            </div>`).join("")
        : `<p style="color:var(--muted);font-size:0.83rem;margin:0;">No employees allocated.</p>`}
    </div>
    <div class="detail-block">
      <p class="section-tag" style="margin:0 0 8px;">Latest payments</p>
      ${laborRecords.length
        ? laborRecords.slice(0, 5).map((r) => `
            <div style="display:flex;justify-content:space-between;font-size:0.83rem;padding:5px 0;border-bottom:1px solid var(--line);">
              <span>${r.employeeName} <span style="color:var(--muted);">${formatDate(r.workEndDate || r.workStartDate)}</span></span>
              <strong>${formatCurrency(r.amountPaid)}</strong>
            </div>`).join("")
        : `<p style="color:var(--muted);font-size:0.83rem;margin:0;">No payments recorded.</p>`}
    </div>
    <div class="detail-block">
      <p class="section-tag" style="margin:0 0 8px;">Recent materials</p>
      ${materials.length
        ? materials.slice(0, 5).map((m) => `
            <div style="display:flex;justify-content:space-between;font-size:0.83rem;padding:5px 0;border-bottom:1px solid var(--line);">
              <span>${m.name} <span style="color:var(--muted);">${m.paymentStatus}</span></span>
              <strong>${formatCurrency(m.cost)}</strong>
            </div>`).join("")
        : `<p style="color:var(--muted);font-size:0.83rem;margin:0;">No materials recorded.</p>`}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px;">
      <div style="background:#e8f4fd;border:1px solid #90c8f0;border-radius:10px;padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#2a6496;">Outstanding</p>
        <strong style="font-size:1.15rem;color:#1a4f72;">${formatCurrency(project.remainingToReceive)}</strong>
      </div>
      <div style="background:#fef6e4;border:1px solid #f5c842;border-radius:10px;padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8a6000;">Labor</p>
        <strong style="font-size:1.15rem;color:#6b4c00;">${formatCurrency(project.laborCost)}</strong>
      </div>
      <div style="background:#f3eeff;border:1px solid #c3a8f5;border-radius:10px;padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#5b3a9e;">Material</p>
        <strong style="font-size:1.15rem;color:#3d2070;">${formatCurrency(project.materialCost)}</strong>
      </div>
      <div style="background:${project.profit >= 0 ? "#eaf7ee" : "#fdecea"};border:1px solid ${project.profit >= 0 ? "#7ecf96" : "#f5a8a3"};border-radius:10px;padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:${project.profit >= 0 ? "#1e6e3a" : "#a0291f"};">Current Profit</p>
        <strong style="font-size:1.15rem;color:${project.profit >= 0 ? "#155229" : "#7a1f18"};">${formatCurrency(project.profit)}</strong>
      </div>
    </div>
  `;

  const backBtn = elements.projectDetail.querySelector("#btn-back-to-list");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      state.selectedProjectId = null;
      state.selectedProjectOverview = null;
      renderProjectsList();
      renderProjectDetail();
      renderDashboard();
    });
  }

  elements.projectDetail.querySelectorAll("[data-edit-project]").forEach((button) => {
    button.addEventListener("click", () => {
      loadProjectIntoForm(project);
    });
  });

  elements.projectDetail.querySelectorAll("[data-delete-project]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!await showConfirm("Delete project", `Delete "${project.clientName}"? This removes related payments, materials and receipts.`)) {
        return;
      }

      await api(`/api/projects/${button.dataset.deleteProject}`, { method: "DELETE" });
      state.selectedProjectId = null;
      resetProjectForm();
      showToast("Project deleted", "success");
      await refreshAll();
    });
  });
}

function renderEmployees() {
  const visibleEmployees = state.employees.filter((employee) =>
    matchesSearch(
      state.search.employees,
      employee.name,
      employee.role,
      employee.phone,
      employee.documentId,
      employee.pixKey,
    ),
  );

  renderList(
    elements.employeesList,
    visibleEmployees,
    (employee) => `
      <article class="list-item">
        <strong>${employee.name}${employee.role ? ` - ${employee.role}` : ""}</strong>
        <p>Status: ${employee.isActive ? "Active" : "Inactive"}</p>
        <p>Phone: ${employee.phone || "Not provided"}</p>
        <p>Document: ${employee.documentId || "Not provided"}</p>
        <p>Pix: ${employee.pixKey || "Not provided"}</p>
        <p>Daily rate: ${formatCurrency(employee.dailyRate)} | Hourly: ${formatCurrency(employee.hourlyRate)}</p>
        <div class="inline-actions">
          <button class="button-secondary" data-edit-employee="${employee.id}">Edit</button>
          <button class="button-secondary" data-toggle-employee-status="${employee.id}:${employee.isActive}">
            ${employee.isActive ? "Mark inactive" : "Mark active"}
          </button>
          <button class="button-danger" data-delete-employee="${employee.id}">Delete</button>
        </div>
      </article>
    `,
    getSearchEmptyMarkup("No employees found with this filter."),
  );

  document.querySelectorAll("[data-edit-employee]").forEach((button) => {
    button.addEventListener("click", () => {
      const employee = state.employees.find((item) => item.id === Number(button.dataset.editEmployee));
      if (employee) {
        loadEmployeeIntoForm(employee);
      }
    });
  });

  document.querySelectorAll("[data-toggle-employee-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      const [employeeId, isActive] = button.dataset.toggleEmployeeStatus.split(":");
      await api(`/api/employees/${employeeId}`, {
        method: "PATCH",
        body: JSON.stringify({
          isActive: isActive !== "true",
        }),
      });
      await refreshAll();
    });
  });

  document.querySelectorAll("[data-delete-employee]").forEach((button) => {
    button.addEventListener("click", async () => {
      const employee = state.employees.find((item) => item.id === Number(button.dataset.deleteEmployee));
      if (!employee || !await showConfirm("Delete employee", `Delete "${employee.name}"?`)) {
        return;
      }

      await api(`/api/employees/${employee.id}`, { method: "DELETE" });
      if (state.editingEmployeeId === employee.id) {
        resetEmployeeForm();
      }
      await refreshAll();
    });
  });
}

function loadEmployeeIntoForm(employee) {
  state.editingEmployeeId = employee.id;
  elements.employeeForm.elements.employeeId.value = String(employee.id);
  elements.employeeForm.elements.name.value = employee.name || "";
  elements.employeeForm.elements.role.value = employee.role || "";
  elements.employeeForm.elements.phone.value = employee.phone || "";
  elements.employeeForm.elements.documentId.value = employee.documentId || "";
  elements.employeeForm.elements.pixKey.value = employee.pixKey || "";
  elements.employeeForm.elements.dailyRate.value = employee.dailyRate ?? "";
  elements.employeeForm.elements.hourlyRate.value = employee.hourlyRate ?? "";
  elements.employeeForm.elements.isActive.value = employee.isActive ? "true" : "false";
  elements.employeeSubmitButton.textContent = "Save changes";
  elements.employeeEditStatus.textContent = `Editing: ${employee.name}`;
  openSlideOver(document.querySelector("#fpanel-employee"), "Edit Employee", "Team");
}

function resetEmployeeForm() {
  state.editingEmployeeId = null;
  elements.employeeForm.reset();
  elements.employeeForm.elements.employeeId.value = "";
  elements.employeeForm.elements.isActive.value = "true";
  elements.employeeSubmitButton.textContent = "Save employee";
  elements.employeeEditStatus.textContent = "New record mode";

  closeSlideOver();
}

function loadProjectIntoForm(project) {
  state.editingProjectId = project.id;
  elements.projectForm.elements.projectId.value = String(project.id);
  elements.projectForm.elements.clientName.value = project.clientName || "";
  elements.projectForm.elements.clientPhone.value = project.clientPhone || "";
  elements.projectForm.elements.projectType.value = project.projectType || "";
  elements.projectForm.elements.managerName.value = project.managerName || "";
  elements.projectForm.elements.address.value = project.address || "";
  elements.projectForm.elements.description.value = project.description || "";
  elements.projectForm.elements.totalValue.value = project.totalValue ?? "";
  elements.projectForm.elements.budgetValue.value = project.budgetValue ?? "";
  elements.projectForm.elements.receivedAmount.value = project.receivedAmount ?? "";
  elements.projectForm.elements.paymentMethod.value = project.paymentMethod || "";
  elements.projectForm.elements.installmentInfo.value = project.installmentInfo || "";
  elements.projectForm.elements.dueDate.value = project.dueDate || "";
  elements.projectForm.elements.startDate.value = project.startDate || "";
  elements.projectForm.elements.estimatedDays.value = project.estimatedDays ?? "";
  elements.projectForm.elements.status.value = project.status || "em andamento";
  elements.projectForm.elements.notes.value = project.notes || "";
  elements.projectSubmitButton.textContent = "Save changes";
  elements.projectEditStatus.textContent = `Editing: ${project.clientName}`;
  openSlideOver(document.querySelector("#fpanel-project"), "Edit Project", "Registration");
}

function resetProjectForm() {
  state.editingProjectId = null;
  elements.projectForm.reset();
  elements.projectForm.elements.projectId.value = "";
  elements.projectSubmitButton.textContent = "Save project";
  elements.projectEditStatus.textContent = "New record mode";
  setupDefaults();
  closeSlideOver();
}

function loadClientIntoForm(client) {
  state.editingClientId = client.id;
  elements.clientForm.elements.clientRecordId.value = String(client.id);
  elements.clientForm.elements.name.value = client.name || "";
  elements.clientForm.elements.companyName.value = client.companyName || "";
  elements.clientForm.elements.phone.value = client.phone || "";
  elements.clientForm.elements.email.value = client.email || "";
  elements.clientForm.elements.address.value = client.address || "";
  elements.clientForm.elements.logoUrl.value = client.logoUrl || "";
  elements.clientForm.elements.notes.value = client.notes || "";
  elements.clientSubmitButton.textContent = "Save changes";
  elements.clientEditStatus.textContent = `Editing: ${client.name}`;
  openSlideOver(document.querySelector("#fpanel-client"), "Edit Client", "Clients");
}

function resetClientForm() {
  state.editingClientId = null;
  elements.clientForm.reset();
  elements.clientForm.elements.clientRecordId.value = "";
  elements.clientSubmitButton.textContent = "Save client";
  elements.clientEditStatus.textContent = "New client";
  closeSlideOver();
}

function ensureEstimateItemsDraft() {
  if (!state.estimateItemsDraft.length) {
    state.estimateItemsDraft = [{ description: "", quantity: 1, unitPrice: 0, process: "", materialResponsibility: "empresa", materialDescription: "" }];
  }
}

function updateEstimateItemRowTotal(rowElement, item) {
  const lineTotalElement = rowElement.querySelector(".estimate-line-total");
  if (!lineTotalElement) {
    return;
  }

  const total = Number(item.quantity || 0) * Number(item.unitPrice || 0);
  lineTotalElement.textContent = formatCurrency(total);
}

function renderEstimateItemsEditor() {
  ensureEstimateItemsDraft();

  elements.estimateItemsEditor.innerHTML = state.estimateItemsDraft
    .map(
      (item, index) => `
        <div class="estimate-item-row">
          <label class="full-width">Description<input data-estimate-item-field="description" data-estimate-item-index="${index}" value="${item.description || ""}" placeholder="e.g.: Porcelain tile 60x60" /></label>
          <label>Qty<input data-estimate-item-field="quantity" data-estimate-item-index="${index}" type="number" min="0" step="0.01" value="${item.quantity ?? 0}" /></label>
          <label>Unit price<input data-estimate-item-field="unitPrice" data-estimate-item-index="${index}" type="number" min="0" step="0.01" value="${item.unitPrice ?? 0}" /></label>
          <div class="estimate-line-total">${formatCurrency(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</div>
          <button type="button" class="button-danger narrow-button" data-remove-estimate-item="${index}">Remove</button>
          <div class="estimate-item-material-row full-width">
            <label class="material-checkbox-label">
              <input type="checkbox" data-estimate-item-checkbox="${index}" ${(item.materialResponsibility || "empresa") === "empresa" ? "checked" : ""} />
              <span class="material-checkbox-text">Material supplied by company</span>
            </label>
            <label class="material-desc-label" data-material-desc-wrapper="${index}" style="${(item.materialResponsibility || "empresa") === "cliente" ? "display:none" : ""}">
              Material description
              <input data-estimate-item-field="materialDescription" data-estimate-item-index="${index}" value="${escapeHtml(item.materialDescription || "")}" placeholder="e.g.: Eliane porcelain 60x60, AC-II mortar..." />
            </label>
          </div>
          <label class="full-width estimate-process-label">Process details / How it will be executed<textarea data-estimate-item-field="process" data-estimate-item-index="${index}" rows="2" placeholder="Describe how this item will be executed, materials, methodology...">${escapeHtml(item.process || "")}</textarea></label>
        </div>
      `,
    )
    .join("");

  const textFields = new Set(["description", "process", "materialDescription"]);

  document.querySelectorAll("[data-estimate-item-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.estimateItemIndex);
      const field = input.dataset.estimateItemField;
      state.estimateItemsDraft[index] = {
        ...state.estimateItemsDraft[index],
        [field]: textFields.has(field) ? input.value : Number(input.value || 0),
      };
      const rowElement = input.closest(".estimate-item-row");
      if (rowElement) {
        updateEstimateItemRowTotal(rowElement, state.estimateItemsDraft[index]);
      }
      renderEstimatePreview();
    });
  });

  document.querySelectorAll("[data-estimate-item-checkbox]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const index = Number(checkbox.dataset.estimateItemCheckbox);
      state.estimateItemsDraft[index].materialResponsibility = checkbox.checked ? "empresa" : "cliente";
      const wrapper = elements.estimateItemsEditor.querySelector(`[data-material-desc-wrapper="${index}"]`);
      if (wrapper) wrapper.style.display = checkbox.checked ? "" : "none";
      renderEstimatePreview();
    });
  });

  document.querySelectorAll("[data-remove-estimate-item]").forEach((button) => {
    button.addEventListener("click", () => {
      state.estimateItemsDraft.splice(Number(button.dataset.removeEstimateItem), 1);
      if (!state.estimateItemsDraft.length) {
        state.estimateItemsDraft = [{ description: "", quantity: 1, unitPrice: 0, process: "", materialResponsibility: "empresa", materialDescription: "" }];
      }
      renderEstimateItemsEditor();
      renderEstimatePreview();
    });
  });
}

function renderEstimatePreview() {
  ensureEstimateItemsDraft();
  const totals = getEstimateDraftTotals();
  const client = state.clients.find((item) => item.id === Number(elements.estimateForm.elements.clientId.value || 0));
  const businessName = elements.estimateForm.elements.businessName.value || "Your business";
  const businessLogoUrl = elements.estimateForm.elements.businessLogoUrl.value;
  const issueDate = elements.estimateForm.elements.issueDate.value;
  const validUntil = elements.estimateForm.elements.validUntil.value;
  const workTitle = elements.estimateForm.elements.workTitle.value || "New job";
  const estimateNumber = elements.estimateForm.elements.estimateNumber.value || "Auto-generated";

  elements.estimateSubtotal.textContent = formatCurrency(totals.subtotal);
  elements.estimateTaxAmount.textContent = formatCurrency(totals.taxAmount);
  elements.estimateTotalAmount.textContent = formatCurrency(totals.totalAmount);

  elements.estimateLivePreview.innerHTML = `
    <div class="estimate-preview-header">
      <div>
        <p class="section-tag">Preview</p>
        <h3>${estimateNumber}</h3>
        <p>${businessName}</p>
      </div>
      <div class="estimate-preview-meta">
        ${businessLogoUrl ? `<img src="${businessLogoUrl}" alt="Logo" class="estimate-logo-preview" />` : ""}
        <p>Date: ${formatDate(issueDate)}</p>
        <p>Valid until: ${formatDate(validUntil)}</p>
      </div>
    </div>
    <div class="estimate-preview-body">
      <p><strong>Job:</strong> ${workTitle}</p>
        <p><strong>Client:</strong> ${client?.name || "Select a client"}</p>
        <p><strong>Address:</strong> ${client?.address || "Not provided"}</p>
      <div class="estimate-preview-items">
        ${
          state.estimateItemsDraft
            .filter((item) => item.description)
            .map(
              (item) => `
                <div class="estimate-preview-line">
                  <span>${item.description}</span>
                  <span>${item.quantity} x ${formatCurrency(item.unitPrice)}</span>
                  <strong>${formatCurrency(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</strong>
                </div>
              `,
            )
            .join("") || '<div class="empty-state">Add items to build the estimate.</div>'
        }
      </div>
      <div class="estimate-preview-totals">
        <p>Subtotal <strong>${formatCurrency(totals.subtotal)}</strong></p>
        <p>Discount <strong>${formatCurrency(totals.discountAmount)}</strong></p>
        <p>Tax (${formatPercent(totals.taxPercent)}) <strong>${formatCurrency(totals.taxAmount)}</strong></p>
        <p>Total <strong>${formatCurrency(totals.totalAmount)}</strong></p>
      </div>
    </div>
  `;
}

function getCurrentEstimateDraftSnapshot() {
  const client = state.clients.find((item) => item.id === Number(elements.estimateForm.elements.clientId.value || 0));
  const totals = getEstimateDraftTotals();
  return {
    estimateNumber: elements.estimateForm.elements.estimateNumber.value || "Estimate",
    workTitle: elements.estimateForm.elements.workTitle.value || "New job",
    businessName: elements.estimateForm.elements.businessName.value || "Your business",
    businessLogoUrl: elements.estimateForm.elements.businessLogoUrl.value || "",
    issueDate: elements.estimateForm.elements.issueDate.value || "",
    validUntil: elements.estimateForm.elements.validUntil.value || "",
    description: elements.estimateForm.elements.description.value || "",
    notes: elements.estimateForm.elements.notes.value || "",
    client,
    items: state.estimateItemsDraft,
    totals,
  };
}

function openEstimatePdf() {
  const snapshot = getCurrentEstimateDraftSnapshot();
  const cs = state.companySettings;
  const popup = window.open("", "_blank", "width=960,height=1080");

  if (!popup) {
    showToast("Could not open the PDF window.", "error");
    return;
  }

  const itemsHtml = snapshot.items
    .filter((item) => item.description)
    .map((item, idx) => {
      const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      return `
        <div class="item-card">
          <div class="item-number">${idx + 1}</div>
          <div class="item-body">
            <div class="item-title">${escapeHtml(item.description)}</div>
            ${item.process ? `<div class="item-process">${escapeHtml(item.process).replace(/\n/g, "<br>")}</div>` : ""}
          </div>
          <div class="item-meta">
            <div class="item-qty-price">${escapeHtml(String(item.quantity))} × ${escapeHtml(formatCurrency(item.unitPrice))}</div>
            <div class="item-total">${escapeHtml(formatCurrency(lineTotal))}</div>
          </div>
        </div>
      `;
    })
    .join("") || `<div class="no-items">No items added.</div>`;

  popup.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(snapshot.estimateNumber)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          body {
            font-family: "Inter", sans-serif;
            margin: 0;
            background: #f0ede8;
            color: #1c1a18;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          h1, h2, h3, h4, p { margin: 0; }

          .page {
            max-width: 860px;
            margin: 32px auto;
            background: #fff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 8px 48px rgba(0,0,0,0.12);
          }

          /* ── HEADER ── */
          .page-header {
            background: linear-gradient(135deg, #2d5016 0%, #4a7c20 100%);
            color: #fff;
            padding: 36px 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }
          .header-left { flex: 1; }
          .header-tag {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.65);
            margin-bottom: 8px;
          }
          .header-estimate-num {
            font-size: 26px;
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -0.5px;
          }
          .header-business {
            margin-top: 6px;
            font-size: 14px;
            font-weight: 600;
            color: rgba(255,255,255,0.9);
          }
          .header-sub {
            margin-top: 3px;
            font-size: 12px;
            color: rgba(255,255,255,0.65);
            line-height: 1.4;
          }
          .work-badge {
            display: inline-block;
            margin-top: 14px;
            padding: 5px 14px;
            border-radius: 999px;
            background: rgba(255,255,255,0.18);
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            border: 1px solid rgba(255,255,255,0.3);
          }
          .header-right { text-align: right; flex-shrink: 0; }
          .header-logo {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            margin-bottom: 12px;
            display: block;
            margin-left: auto;
          }
          .header-dates { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.8; }
          .header-dates strong { color: #fff; font-weight: 600; }

          /* ── BODY ── */
          .page-body { padding: 36px 40px; }

          /* ── CLIENT CARD ── */
          .client-card {
            background: #f7f5f2;
            border: 1px solid #e8e4de;
            border-radius: 16px;
            padding: 20px 24px;
            display: flex;
            gap: 32px;
            margin-bottom: 32px;
          }
          .client-section { flex: 1; }
          .client-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #8a7e70;
            margin-bottom: 6px;
          }
          .client-name { font-size: 16px; font-weight: 700; color: #1c1a18; }
          .client-detail { font-size: 13px; color: #6b6157; margin-top: 2px; line-height: 1.5; }

          /* ── SECTION TITLE ── */
          .section-title {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #8a7e70;
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e8e4de;
          }

          /* ── ITEM CARDS ── */
          .items-section { margin-bottom: 32px; }
          .item-card {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 18px 0;
            border-bottom: 1px solid #f0ede8;
          }
          .item-card:last-child { border-bottom: none; }
          .item-number {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: #2d5016;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .item-body { flex: 1; min-width: 0; }
          .item-title { font-size: 15px; font-weight: 600; color: #1c1a18; }
          .item-process {
            margin-top: 6px;
            font-size: 12.5px;
            color: #6b6157;
            line-height: 1.6;
            background: #f7f5f2;
            border-left: 3px solid #b5cf8a;
            padding: 8px 12px;
            border-radius: 0 8px 8px 0;
          }
          .item-meta { text-align: right; flex-shrink: 0; }
          .item-qty-price { font-size: 12px; color: #8a7e70; margin-bottom: 4px; }
          .item-total { font-size: 16px; font-weight: 700; color: #2d5016; }

          /* ── TOTALS ── */
          .totals-section {
            margin-left: auto;
            max-width: 300px;
            background: #f7f5f2;
            border: 1px solid #e8e4de;
            border-radius: 16px;
            padding: 20px 24px;
            margin-bottom: 32px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 13.5px;
            color: #4a4035;
            border-bottom: 1px solid #e8e4de;
          }
          .total-row:last-child {
            border-bottom: none;
            padding-top: 14px;
            margin-top: 4px;
            font-size: 17px;
            font-weight: 800;
            color: #1c1a18;
          }
          .total-row span { color: #6b6157; }
          .total-row strong { color: inherit; }
          .total-row.grand strong { color: #2d5016; }

          /* ── FOOTER ── */
          .page-footer {
            border-top: 1px solid #e8e4de;
            padding: 24px 40px 32px;
            display: flex;
            gap: 32px;
          }
          .footer-block { flex: 1; }
          .footer-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #8a7e70;
            margin-bottom: 8px;
          }
          .footer-text { font-size: 13px; color: #6b6157; line-height: 1.7; }

          .no-items { font-size: 14px; color: #8a7e70; padding: 16px 0; }

          /* ── PRINT ── */
          @media print {
            body { background: white; }
            .page {
              margin: 0;
              max-width: none;
              border-radius: 0;
              box-shadow: none;
            }
            .item-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="page">

          <div class="page-header">
            <div class="header-left">
              <div class="header-tag">Estimate</div>
              <div class="header-estimate-num">${escapeHtml(snapshot.estimateNumber)}</div>
              <div class="header-business">${escapeHtml(cs.company_name || snapshot.businessName)}</div>
              ${cs.responsible_name ? `<div class="header-sub">Resp: ${escapeHtml(cs.responsible_name)}</div>` : ""}
              ${[cs.phone, cs.email, cs.website].filter(Boolean).length ? `<div class="header-sub">${[cs.phone, cs.email, cs.website].filter(Boolean).map(escapeHtml).join(" &nbsp;·&nbsp; ")}</div>` : ""}
              ${cs.address ? `<div class="header-sub">${escapeHtml(cs.address)}</div>` : ""}
              <span class="work-badge">${escapeHtml(snapshot.workTitle)}</span>
            </div>
            <div class="header-right">
              ${(cs.logo_url || snapshot.businessLogoUrl) ? `<img class="header-logo" src="${escapeHtml(cs.logo_url || snapshot.businessLogoUrl)}" alt="Logo" />` : ""}
              <div class="header-dates">
                <div><strong>Issued on</strong> ${escapeHtml(formatDate(snapshot.issueDate))}</div>
                <div><strong>Valid until</strong> ${escapeHtml(formatDate(snapshot.validUntil))}</div>
              </div>
            </div>
          </div>

          <div class="page-body">

            <div class="client-card">
              <div class="client-section">
                <div class="client-label">Client</div>
                <div class="client-name">${escapeHtml(snapshot.client?.name || "Not provided")}</div>
                ${snapshot.client?.companyName ? `<div class="client-detail">${escapeHtml(snapshot.client.companyName)}</div>` : ""}
                ${snapshot.client?.phone ? `<div class="client-detail">${escapeHtml(snapshot.client.phone)}</div>` : ""}
              </div>
              ${snapshot.client?.address ? `
              <div class="client-section">
                <div class="client-label">Address</div>
                <div class="client-detail">${escapeHtml(snapshot.client.address)}</div>
              </div>` : ""}
            </div>

            <div class="items-section">
              <div class="section-title">Estimate items</div>
              ${itemsHtml}
            </div>

            <div style="display:flex; justify-content:flex-end;">
              <div class="totals-section">
                <div class="section-title" style="margin-bottom:10px;">Financial summary</div>
                <div class="total-row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(snapshot.totals.subtotal))}</strong></div>
                ${snapshot.totals.discountAmount > 0 ? `<div class="total-row"><span>Discount</span><strong>- ${escapeHtml(formatCurrency(snapshot.totals.discountAmount))}</strong></div>` : ""}
                ${snapshot.totals.taxAmount > 0 ? `<div class="total-row"><span>Taxes (${escapeHtml(formatPercent(snapshot.totals.taxPercent))})</span><strong>${escapeHtml(formatCurrency(snapshot.totals.taxAmount))}</strong></div>` : ""}
                <div class="total-row grand"><span>Total</span><strong>${escapeHtml(formatCurrency(snapshot.totals.totalAmount))}</strong></div>
              </div>
            </div>

          </div>

          ${(snapshot.description || snapshot.notes || cs.notes) ? `
          <div class="page-footer">
            ${snapshot.description ? `
            <div class="footer-block">
              <div class="footer-label">Service description</div>
              <div class="footer-text">${escapeHtml(snapshot.description).replace(/\n/g, "<br>")}</div>
            </div>` : ""}
            ${(snapshot.notes || cs.notes) ? `
            <div class="footer-block">
              <div class="footer-label">Notes</div>
              <div class="footer-text">${escapeHtml(snapshot.notes || cs.notes || "").replace(/\n/g, "<br>")}</div>
            </div>` : ""}
          </div>` : ""}

        </div>
        <script>window.onload = () => { window.print(); };</script>
      </body>
    </html>
  `);
  popup.document.close();
}

function loadEstimateIntoForm(estimate) {
  state.editingEstimateId = estimate.id;
  state.estimateItemsDraft = estimate.items?.length
    ? estimate.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        process: item.process || "",
        materialResponsibility: item.materialResponsibility || "empresa",
        materialDescription: item.materialDescription || "",
      }))
    : [{ description: "", quantity: 1, unitPrice: 0, process: "", materialResponsibility: "empresa", materialDescription: "" }];
  elements.estimateForm.elements.estimateRecordId.value = String(estimate.id);
  elements.estimateForm.elements.estimateNumber.value = estimate.estimateNumber || "";
  elements.estimateForm.elements.workTitle.value = estimate.workTitle || "";
  elements.estimateForm.elements.clientId.value = estimate.clientId ? String(estimate.clientId) : "";
  elements.estimateForm.elements.projectId.value = estimate.projectId ? String(estimate.projectId) : "";
  elements.estimateForm.elements.businessName.value = estimate.businessName || "";
  elements.estimateForm.elements.businessLogoUrl.value = estimate.businessLogoUrl || "";
  elements.estimateForm.elements.issueDate.value = estimate.issueDate || "";
  elements.estimateForm.elements.validUntil.value = estimate.validUntil || "";
  elements.estimateForm.elements.status.value = estimate.status || "rascunho";
  elements.estimateForm.elements.discountAmount.value = estimate.discountAmount ?? "";
  elements.estimateForm.elements.taxPercent.value = estimate.taxPercent ?? "";
  elements.estimateForm.elements.description.value = estimate.description || "";
  elements.estimateForm.elements.notes.value = estimate.notes || "";
  elements.estimateSubmitButton.textContent = "Save changes";
  elements.estimateEditStatus.textContent = `Editing: ${estimate.estimateNumber}`;

  renderEstimateItemsEditor();
  renderEstimatePreview();
  elements.estimateForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetEstimateForm() {
  state.editingEstimateId = null;
  state.estimateItemsDraft = [{ description: "", quantity: 1, unitPrice: 0, process: "", materialResponsibility: "empresa", materialDescription: "" }];
  elements.estimateForm.reset();
  elements.estimateForm.elements.estimateRecordId.value = "";
  elements.estimateForm.elements.status.value = "rascunho";
  elements.estimateSubmitButton.textContent = "Save estimate";
  elements.estimateEditStatus.textContent = "New estimate";
  setupDefaults();
  renderEstimateItemsEditor();
  renderEstimatePreview();
}

function updateCalculatedLaborAmount() {
  const employeeId = Number(elements.laborForm.elements.employeeId.value || 0);
  const daysWorked = Number(elements.laborForm.elements.daysWorked.value || 0);
  const employee = state.employees.find((item) => item.id === employeeId);
  const dailyRate = Number(employee?.dailyRate || 0);
  const amountPaid = dailyRate * daysWorked;
  elements.laborForm.elements.amountPaid.value = amountPaid ? amountPaid.toFixed(2) : "0.00";
}

function updateAssignmentCostPreview() {
  const employeeId = Number(elements.assignmentEmployeeSelect.value || 0);
  const days = Number(elements.assignmentDaysWorked.value || 0);
  const employee = state.employees.find((item) => item.id === employeeId);
  const dailyRate = Number(employee?.dailyRate || 0);
  elements.assignmentDailyRateDisplay.value = dailyRate ? formatCurrency(dailyRate) : "";
  elements.assignmentTotalDisplay.value = days && dailyRate ? formatCurrency(days * dailyRate) : "";
}

function loadLaborRecordIntoForm(record) {
  state.editingLaborRecordId = record.id;
  elements.laborForm.elements.recordId.value = String(record.id);
  elements.laborForm.elements.projectId.value = String(record.projectId);
  elements.laborForm.elements.employeeId.value = String(record.employeeId);
  elements.laborForm.elements.daysWorked.value = String(record.daysWorked ?? "");
  elements.laborForm.elements.amountPaid.value = String(record.amountPaid ?? "");
  elements.laborForm.elements.workStartDate.value = record.workStartDate || "";
  elements.laborForm.elements.workEndDate.value = record.workEndDate || "";
  elements.laborForm.elements.notes.value = record.notes || "";
  updateCalculatedLaborAmount();
  elements.laborSubmitButton.textContent = "Save changes";
  elements.laborEditStatus.textContent = `Editing: ${record.employeeName} - ${record.projectClient}`;
}

function resetLaborForm() {
  state.editingLaborRecordId = null;
  elements.laborForm.reset();
  elements.laborForm.elements.recordId.value = "";
  elements.laborSubmitButton.textContent = "Save payment";
  elements.laborEditStatus.textContent = "New entry mode";
  setupDefaults();
  if (state.selectedProjectId) {
    elements.laborForm.elements.projectId.value = String(state.selectedProjectId);
  }
  updateCalculatedLaborAmount();
}

function updateCalculatedMaterialCost() {
  const quantity = Number(elements.materialForm.elements.quantity.value || 0);
  const unitPrice = Number(elements.materialForm.elements.unitPrice.value || 0);
  const costField = elements.materialForm.elements.cost;
  const autoCost = quantity * unitPrice;

  if (!costField.dataset.manual || !Number(costField.value || 0)) {
    costField.value = autoCost ? autoCost.toFixed(2) : "";
  }
}

function loadMaterialIntoForm(material) {
  state.editingMaterialId = material.id;
  elements.materialForm.elements.materialId.value = String(material.id);
  elements.materialForm.elements.projectId.value = String(material.projectId);
  elements.materialForm.elements.name.value = material.name || "";
  elements.materialForm.elements.category.value = material.category || "";
  elements.materialForm.elements.supplier.value = material.supplier || "";
  elements.materialForm.elements.invoiceNumber.value = material.invoiceNumber || "";
  elements.materialForm.elements.unit.value = material.unit || "";
  elements.materialForm.elements.quantity.value = material.quantity ?? "";
  elements.materialForm.elements.unitPrice.value = material.unitPrice ?? "";
  elements.materialForm.elements.cost.value = material.cost ?? "";
  elements.materialForm.elements.cost.dataset.manual = "true";
  elements.materialForm.elements.paymentStatus.value = material.paymentStatus || "pago";
  elements.materialForm.elements.purchasedAt.value = material.purchasedAt || "";
  elements.materialSubmitButton.textContent = "Save changes";
  elements.materialEditStatus.textContent = `Editing: ${material.name}`;
}

function resetMaterialForm() {
  state.editingMaterialId = null;
  elements.materialForm.reset();
  elements.materialForm.elements.materialId.value = "";
  delete elements.materialForm.elements.cost.dataset.manual;
  elements.materialSubmitButton.textContent = "Save material";
  elements.materialEditStatus.textContent = "New entry mode";
  setupDefaults();
  if (state.selectedProjectId) {
    elements.materialForm.elements.projectId.value = String(state.selectedProjectId);
  }
}

function loadReceiptIntoForm(receipt) {
  state.editingReceiptId = receipt.id;
  elements.receiptForm.elements.receiptId.value = String(receipt.id);
  elements.receiptForm.elements.projectId.value = String(receipt.projectId);
  elements.receiptForm.elements.amount.value = receipt.amount ?? "";
  elements.receiptForm.elements.receivedAt.value = receipt.receivedAt || "";
  elements.receiptForm.elements.notes.value = receipt.notes || "";
  elements.receiptSubmitButton.textContent = "Save changes";
  elements.receiptEditStatus.textContent = `Editing receipt: ${receipt.projectClient}`;
}

function resetReceiptForm() {
  state.editingReceiptId = null;
  elements.receiptForm.reset();
  elements.receiptForm.elements.receiptId.value = "";
  elements.receiptSubmitButton.textContent = "Save receipt";
  elements.receiptEditStatus.textContent = "New entry mode";
  setupDefaults();
  if (state.selectedProjectId) {
    elements.receiptForm.elements.projectId.value = String(state.selectedProjectId);
  }
}

function loadForecastIntoForm(forecast) {
  state.editingForecastId = forecast.id;
  elements.forecastForm.elements.forecastId.value = String(forecast.id);
  elements.forecastForm.elements.clientName.value = forecast.clientName || "";
  elements.forecastForm.elements.title.value = forecast.title || "";
  elements.forecastForm.elements.expectedStartDate.value = forecast.expectedStartDate || "";
  elements.forecastForm.elements.status.value = forecast.status || "planejada";
  elements.forecastForm.elements.totalValue.value = forecast.totalValue ?? "";
  elements.forecastForm.elements.estimatedLaborCost.value = forecast.estimatedLaborCost ?? "";
  elements.forecastForm.elements.estimatedMaterialCost.value = forecast.estimatedMaterialCost ?? "";
  elements.forecastForm.elements.companyPercent.value = forecast.companyPercent ?? "";
  elements.forecastForm.elements.taxAmount.value = forecast.taxAmount ?? "";
  elements.forecastForm.elements.description.value = forecast.description || "";
  elements.forecastForm.elements.notes.value = forecast.notes || "";
  elements.forecastSubmitButton.textContent = "Save changes";
  elements.forecastEditStatus.textContent = `Editing: ${forecast.title}`;
  openSlideOver(document.querySelector("#fpanel-forecast"), "Edit Forecast", "Planning");
}

function resetForecastForm() {
  state.editingForecastId = null;
  elements.forecastForm.reset();
  elements.forecastForm.elements.forecastId.value = "";
  elements.forecastForm.elements.status.value = "planejada";
  elements.forecastSubmitButton.textContent = "Save forecast";
  elements.forecastEditStatus.textContent = "New forecast mode";
  setupDefaults();
  closeSlideOver();
}

function loadOverheadExpenseIntoForm(expense) {
  state.editingOverheadExpenseId = expense.id;
  elements.overheadForm.elements.overheadExpenseId.value = String(expense.id);
  elements.overheadForm.elements.category.value = expense.category || "outros";
  elements.overheadForm.elements.description.value = expense.description || "";
  elements.overheadForm.elements.amount.value = expense.amount ?? "";
  elements.overheadForm.elements.spentAt.value = expense.spentAt || "";
  elements.overheadForm.elements.notes.value = expense.notes || "";
  elements.overheadSubmitButton.textContent = "Save changes";
  elements.overheadEditStatus.textContent = `Editing: ${expense.category}`;
  openSlideOver(document.querySelector("#fpanel-extras"), "Edit Expense", "Control");
}

function resetOverheadForm() {
  state.editingOverheadExpenseId = null;
  elements.overheadForm.reset();
  elements.overheadForm.elements.overheadExpenseId.value = "";
  elements.overheadForm.elements.category.value = "gasolina";
  elements.overheadSubmitButton.textContent = "Save extra expense";
  elements.overheadEditStatus.textContent = "New entry mode";
  setupDefaults();
  closeSlideOver();
}

function renderProjectAssignments() {
  const statusFilter = elements.globalStatusFilter.value;
  const projectsInProgress = state.projects.filter(
    (project) => project.status === "em andamento" && (!statusFilter || project.status === statusFilter),
  );
  const scopedProjects = state.selectedProjectId
    ? projectsInProgress.filter((project) => project.id === state.selectedProjectId)
    : projectsInProgress;

  if (!scopedProjects.length) {
    elements.projectAssignmentsList.innerHTML = '<div class="empty-state">No active projects found.</div>';
    return;
  }

  elements.projectAssignmentsList.innerHTML = scopedProjects
    .map((project) => {
      const assignments = state.projectAssignments.filter((assignment) => assignment.projectId === project.id);
      return `
        <section class="detail-block">
          <strong>${project.clientName} - ${project.description}</strong>
          <p>Allocated team: ${assignments.length}</p>
          ${
            assignments.length
              ? assignments
                  .map((assignment) => {
                    const laborEntries = state.laborRecords.filter(
                      (r) => r.projectId === project.id && r.employeeId === assignment.employeeId,
                    );
                    const totalDays = laborEntries.reduce((sum, r) => sum + Number(r.daysWorked || 0), 0);
                    const totalPaid = laborEntries.reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);
                    return `
                      <article class="list-item">
                        <strong>${assignment.employeeName}${assignment.role ? ` - ${assignment.role}` : ""}</strong>
                        <p>Phone: ${assignment.phone || "Not provided"}</p>
                        <p>Daily rate: ${formatCurrency(assignment.dailyRate)}</p>
                        <p>Added on: ${formatDate(assignment.assignedAt)}</p>
                        ${totalDays > 0
                          ? `<p>Days recorded: <strong>${totalDays}</strong> &nbsp;|&nbsp; Total cost: <strong class="money-negative">${formatCurrency(totalPaid)}</strong></p>`
                          : `<p style="color:var(--muted);font-size:0.82rem;">No payments recorded yet.</p>`
                        }
                        <div class="inline-actions">
                          <button class="button-danger" data-remove-assignment="${project.id}:${assignment.id}">Remove</button>
                        </div>
                      </article>
                    `;
                  })
                  .join("")
              : '<p>No employees linked.</p>'
          }
        </section>
      `;
    })
    .join("");

  document.querySelectorAll("[data-remove-assignment]").forEach((button) => {
    button.addEventListener("click", async () => {
      const [projectId, assignmentId] = button.dataset.removeAssignment.split(":");
      await api(`/api/projects/${projectId}/assignments/${assignmentId}`, { method: "DELETE" });
      await refreshAll();
    });
  });
}

function renderLaborRecords() {
  const range = getDateRangeForFilters();
  const scopedRecords = state.selectedProjectId
    ? state.laborRecords.filter((record) => record.projectId === state.selectedProjectId)
    : state.laborRecords.filter((record) => !elements.globalStatusFilter.value || (state.projects.find((project) => project.id === record.projectId) || {}).status === elements.globalStatusFilter.value);
  const recordsInRange = scopedRecords.filter((record) => inDateRange(record.workEndDate || record.workStartDate, range));

  renderList(
    elements.laborRecordsList,
    recordsInRange.slice(0, 6),
    (record) => `
      <article class="list-item">
        <strong>${record.employeeName} - ${record.projectClient}</strong>
        <p>${record.daysWorked} day(s) | ${formatCurrency(record.amountPaid)}</p>
        <p>${formatDate(record.workStartDate)}${record.workEndDate ? ` to ${formatDate(record.workEndDate)}` : ""}</p>
      </article>
    `,
  );

  renderList(
    elements.employeePaymentsList,
    recordsInRange,
    (record) => `
      <article class="list-item">
        <strong>${record.employeeName}${record.role ? ` - ${record.role}` : ""}</strong>
        <p>Project: ${record.projectClient}</p>
        <p>Paid: ${formatCurrency(record.amountPaid)} | Days: ${record.daysWorked}</p>
        <p>${formatDate(record.workStartDate)}${record.workEndDate ? ` to ${formatDate(record.workEndDate)}` : ""}</p>
        <p>${record.notes || "No notes."}</p>
        <div class="inline-actions">
          <button class="button-secondary" data-edit-labor-record="${record.id}">Edit</button>
          <button class="button-danger" data-delete-labor-record="${record.id}">Delete</button>
        </div>
      </article>
    `,
  );

  document.querySelectorAll("[data-edit-labor-record]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = state.laborRecords.find((item) => item.id === Number(button.dataset.editLaborRecord));
      if (record) {
        loadLaborRecordIntoForm(record);
      }
    });
  });

  document.querySelectorAll("[data-delete-labor-record]").forEach((button) => {
    button.addEventListener("click", async () => {
      const record = state.laborRecords.find((item) => item.id === Number(button.dataset.deleteLaborRecord));
      if (!record || !await showConfirm("Delete payment", `Delete payment for ${record.employeeName}?`)) {
        return;
      }

      await api(`/api/labor-records/${record.id}`, { method: "DELETE" });
      if (state.editingLaborRecordId === record.id) {
        resetLaborForm();
      }
      await refreshAll();
    });
  });
}

function renderMaterials() {
  const range = getDateRangeForFilters();
  const scopedMaterials = state.selectedProjectId
    ? state.materials.filter((material) => material.projectId === state.selectedProjectId)
    : state.materials.filter((material) => !elements.globalStatusFilter.value || (state.projects.find((project) => project.id === material.projectId) || {}).status === elements.globalStatusFilter.value);
  const materialsInRange = scopedMaterials.filter((material) => inDateRange(material.purchasedAt, range));
  const visibleCatalogMaterials = scopedMaterials.filter((material) =>
    matchesSearch(
      state.search.materials,
      material.name,
      material.projectClient,
      material.category,
      material.supplier,
      material.invoiceNumber,
    ),
  );

  renderList(
    elements.materialsList,
    materialsInRange.slice(0, 6),
    (material) => `
      <article class="list-item">
        <strong>${material.name} - ${material.projectClient}</strong>
        <p>${material.supplier || "Supplier not provided"}</p>
        <p>${material.quantity} ${material.unit || ""} | ${formatCurrency(material.cost)}</p>
        <p>Status: ${material.paymentStatus}</p>
      </article>
    `,
  );

  renderList(
    elements.materialsCatalogList,
    visibleCatalogMaterials,
    (material) => `
      <article class="list-item">
        <strong>${material.name}</strong>
        <p>Project: ${material.projectClient}</p>
        <p>${material.quantity} ${material.unit || ""} | Unit price: ${formatCurrency(material.unitPrice)}</p>
        <p>Total: ${formatCurrency(material.cost)} | ${material.paymentStatus}</p>
        <p>${material.supplier || "Supplier not provided"}</p>
        <div class="inline-actions">
          <button class="button-secondary" data-edit-material="${material.id}">Edit</button>
          <button class="button-danger" data-delete-material="${material.id}">Delete</button>
        </div>
      </article>
    `,
    getSearchEmptyMarkup("No materials found with this filter."),
  );

  document.querySelectorAll("[data-edit-material]").forEach((button) => {
    button.addEventListener("click", () => {
      const material = state.materials.find((item) => item.id === Number(button.dataset.editMaterial));
      if (material) {
        loadMaterialIntoForm(material);
      }
    });
  });

  document.querySelectorAll("[data-delete-material]").forEach((button) => {
    button.addEventListener("click", async () => {
      const material = state.materials.find((item) => item.id === Number(button.dataset.deleteMaterial));
      if (!material || !await showConfirm("Delete material", `Delete "${material.name}"?`)) {
        return;
      }

      await api(`/api/materials/${material.id}`, { method: "DELETE" });
      if (state.editingMaterialId === material.id) {
        resetMaterialForm();
      }
      await refreshAll();
    });
  });
}

function renderWeeklyPayments() {
  const report = state.weeklyPayments;
  if (!report) {
    return;
  }

  const scopedProject = state.selectedProjectId
    ? report.projectPayments.find((project) => project.projectId === state.selectedProjectId)
    : null;
  const scopedMaterials = state.selectedProjectId
    ? report.materialPayments.filter((material) => material.projectId === state.selectedProjectId)
    : report.materialPayments;
  const scopedEmployees = state.selectedProjectId
    ? report.employeePayments.filter((employee) =>
        employee.projects.includes((state.projects.find((project) => project.id === state.selectedProjectId) || {}).clientName),
      )
    : report.employeePayments;
  const scopedLaborTotal = scopedProject ? scopedProject.laborPaid : report.totalLaborPaid;
  const scopedMaterialTotal = scopedProject ? scopedProject.materialPaid : report.totalMaterialPaid;
  const totalOverall = Number(scopedLaborTotal || 0) + Number(scopedMaterialTotal || 0);

  elements.weeklyLaborTotal.textContent = formatCurrency(scopedLaborTotal);
  elements.weeklyMaterialTotal.textContent = formatCurrency(scopedMaterialTotal);
  elements.weeklyOverallTotal.textContent = formatCurrency(totalOverall);
  elements.weeklyPeriodLabel.textContent = `${formatDate(report.startDate)} to ${formatDate(report.endDate)}`;

  renderList(
    elements.weeklyEmployeesList,
    scopedEmployees,
    (employee) => `
      <article class="list-item">
        <strong>${employee.employeeName}</strong>
        <p>Total paid: ${formatCurrency(employee.totalPaid)}</p>
        <p>Days: ${employee.totalDaysWorked}</p>
        <p>Payments: ${employee.paymentCount}</p>
        <p>Projects: ${employee.projects.join(", ") || "None"}</p>
      </article>
    `,
  );

  renderList(
    elements.weeklyProjectsList,
    state.selectedProjectId ? (scopedProject ? [scopedProject] : []) : report.projectPayments,
    (project) => `
      <article class="list-item">
        <strong>${project.projectClient}</strong>
        <p>${project.projectDescription}</p>
        <p>Labor: ${formatCurrency(project.laborPaid)}</p>
        <p>Materials: ${formatCurrency(project.materialPaid)}</p>
        <p>Total: ${formatCurrency(project.totalPaid)}</p>
      </article>
    `,
  );

  renderList(
    elements.weeklyMaterialsList,
    scopedMaterials,
    (material) => `
      <article class="list-item">
        <strong>${material.name}</strong>
        <p>${material.projectClient}</p>
        <p>${material.quantity} ${material.unit || ""}</p>
        <p>${formatCurrency(material.cost)}</p>
      </article>
    `,
  );
}

function renderReceipts() {
  const range = getDateRangeForFilters();
  const scopedReceipts = state.selectedProjectId
    ? state.receipts.filter((receipt) => receipt.projectId === state.selectedProjectId)
    : state.receipts.filter((receipt) => !elements.globalStatusFilter.value || (state.projects.find((project) => project.id === receipt.projectId) || {}).status === elements.globalStatusFilter.value);
  const receiptsInRange = scopedReceipts.filter((receipt) => inDateRange(receipt.receivedAt, range));

  renderList(
    elements.receiptsList,
    receiptsInRange,
    (receipt) => `
      <article class="list-item">
        <strong>${receipt.projectClient}</strong>
        <p>${formatCurrency(receipt.amount)} on ${formatDate(receipt.receivedAt)}</p>
        <p>${receipt.notes || "No notes."}</p>
        <div class="inline-actions">
          <button class="button-secondary" data-edit-receipt="${receipt.id}">Edit</button>
          <button class="button-danger" data-delete-receipt="${receipt.id}">Delete</button>
        </div>
      </article>
    `,
  );

  document.querySelectorAll("[data-edit-receipt]").forEach((button) => {
    button.addEventListener("click", () => {
      const receipt = state.receipts.find((item) => item.id === Number(button.dataset.editReceipt));
      if (receipt) {
        loadReceiptIntoForm(receipt);
      }
    });
  });

  document.querySelectorAll("[data-delete-receipt]").forEach((button) => {
    button.addEventListener("click", async () => {
      const receipt = state.receipts.find((item) => item.id === Number(button.dataset.deleteReceipt));
      if (!receipt || !await showConfirm("Delete receipt", `Delete receipt of ${formatCurrency(receipt.amount)}?`)) {
        return;
      }

      await api(`/api/receipts/${receipt.id}`, { method: "DELETE" });
      if (state.editingReceiptId === receipt.id) {
        resetReceiptForm();
      }
      await refreshAll();
    });
  });
}

function renderForecasts() {
  const visibleForecasts = state.forecasts.filter((forecast) =>
    matchesSearch(
      state.search.forecasts,
      forecast.clientName,
      forecast.title,
      forecast.status,
      forecast.description,
      forecast.notes,
    ),
  );

  renderList(
    elements.forecastsList,
    visibleForecasts,
    (forecast) => `
      <article class="list-item">
        <strong>${forecast.clientName} - ${forecast.title}</strong>
        <p>Source: ${forecast.estimateId ? "From estimate" : "Created manually"}</p>
        <p>Status: ${forecast.status}</p>
        <p>Expected start: ${formatDate(forecast.expectedStartDate)}</p>
        <p>Total value: ${formatCurrency(forecast.totalValue)}</p>
        <p>Labor: ${formatCurrency(forecast.estimatedLaborCost)}</p>
        <p>Materials: ${formatCurrency(forecast.estimatedMaterialCost)}</p>
        <p>Estimated total cost: ${formatCurrency(forecast.estimatedTotalCost)}</p>
        <p>Estimated gross profit: <span class="${forecast.grossProfit >= 0 ? "money-positive" : "money-negative"}">${formatCurrency(forecast.grossProfit)}</span></p>
        <p>Company share (${forecast.companyPercent}%): ${formatCurrency(forecast.companyAmount)}</p>
        <p>Reserved tax: ${formatCurrency(forecast.taxAmount)}</p>
        <p>Estimated final net: <span class="${forecast.projectedNet >= 0 ? "money-positive" : "money-negative"}">${formatCurrency(forecast.projectedNet)}</span></p>
        <p>${forecast.description || "No description."}</p>
        <p>${forecast.notes || "No notes."}</p>
        <div class="inline-actions">
          <button class="button-secondary" data-edit-forecast="${forecast.id}">Edit</button>
          <button class="button-primary" data-convert-forecast-to-project="${forecast.id}">Convert to project</button>
          <button class="button-danger" data-delete-forecast="${forecast.id}">Delete</button>
        </div>
      </article>
    `,
    getSearchEmptyMarkup("No forecasts found with this filter."),
  );

  document.querySelectorAll("[data-edit-forecast]").forEach((button) => {
    button.addEventListener("click", () => {
      const forecast = state.forecasts.find((item) => item.id === Number(button.dataset.editForecast));
      if (forecast) {
        loadForecastIntoForm(forecast);
      }
    });
  });

  document.querySelectorAll("[data-delete-forecast]").forEach((button) => {
    button.addEventListener("click", async () => {
      const forecast = state.forecasts.find((item) => item.id === Number(button.dataset.deleteForecast));
      if (!forecast || !await showConfirm("Delete forecast", `Delete "${forecast.title}"?`)) {
        return;
      }

      await api(`/api/forecasts/${forecast.id}`, { method: "DELETE" });
      if (state.editingForecastId === forecast.id) {
        resetForecastForm();
      }
      await refreshAll();
    });
  });

  document.querySelectorAll("[data-convert-forecast-to-project]").forEach((button) => {
    button.addEventListener("click", async () => {
      const forecast = state.forecasts.find((item) => item.id === Number(button.dataset.convertForecastToProject));
      if (!forecast || !await showConfirm("Convert forecast", `Convert "${forecast.title}" to project?`)) {
        return;
      }

      await api(`/api/forecasts/${forecast.id}/convert-to-project`, {
        method: "POST",
        body: JSON.stringify({ startDate: forecast.expectedStartDate || new Date().toISOString().slice(0, 10), estimatedDays: 30 }),
      });
      await refreshAll();
    });
  });
}

function renderAuditLogs() {
  renderList(
    elements.auditLogList,
    state.auditLogs,
    (log) => `
      <article class="list-item">
        <strong>${log.summary}</strong>
        <p>${log.entityType} | ${log.action}</p>
        <p>${formatDateTime(log.createdAt)}</p>
      </article>
    `,
  );
}

function renderOpsResumo() {
  const container = document.querySelector("#ops-resumo-content");
  if (!container) return;

  const scopedProjects = state.selectedProjectId
    ? state.projects.filter((p) => p.id === state.selectedProjectId)
    : state.projects;
  const scopedIds = new Set(scopedProjects.map((p) => p.id));

  const laborRecords = state.laborRecords.filter((r) => scopedIds.has(r.projectId));
  const materials = state.materials.filter((m) => scopedIds.has(m.projectId));

  const totalLabor = laborRecords.reduce((s, r) => s + Number(r.amountPaid || 0), 0);
  const totalMaterial = materials.reduce((s, m) => s + Number(m.cost || 0), 0);
  const totalGeral = totalLabor + totalMaterial;
  const totalAReceber = scopedProjects.reduce((s, p) => s + Number(p.remainingToReceive || 0), 0);

  // Per-project breakdown
  const projectRows = scopedProjects.map((project) => {
    const pLabor = laborRecords
      .filter((r) => r.projectId === project.id)
      .reduce((s, r) => s + Number(r.amountPaid || 0), 0);
    const pMaterial = materials
      .filter((m) => m.projectId === project.id)
      .reduce((s, m) => s + Number(m.cost || 0), 0);
    return { project, pLabor, pMaterial, pTotal: pLabor + pMaterial };
  }).sort((a, b) => b.pTotal - a.pTotal);

  // Labor breakdown by employee
  const laborByEmployee = laborRecords.reduce((map, r) => {
    const key = r.employeeName;
    if (!map.has(key)) map.set(key, { name: key, days: 0, total: 0 });
    const entry = map.get(key);
    entry.days += Number(r.daysWorked || 0);
    entry.total += Number(r.amountPaid || 0);
    return map;
  }, new Map());

  // Material breakdown by category
  const matByCategory = materials.reduce((map, m) => {
    const key = m.category || "No category";
    map.set(key, (map.get(key) || 0) + Number(m.cost || 0));
    return map;
  }, new Map());

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">
      <div style="background:#e8f4fd;border:1px solid #90c8f0;border-radius:12px;padding:18px 20px;">
        <p style="margin:0 0 6px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#2a6496;">Total Labor</p>
        <strong style="font-size:1.5rem;color:#1a4f72;">${formatCurrency(totalLabor)}</strong>
        <p style="margin:6px 0 0;font-size:0.78rem;color:#2a6496;">${laborRecords.length} record${laborRecords.length !== 1 ? "s" : ""}</p>
      </div>
      <div style="background:#f3eeff;border:1px solid #c3a8f5;border-radius:12px;padding:18px 20px;">
        <p style="margin:0 0 6px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5b3a9e;">Total Materials</p>
        <strong style="font-size:1.5rem;color:#3d2070;">${formatCurrency(totalMaterial)}</strong>
        <p style="margin:6px 0 0;font-size:0.78rem;color:#5b3a9e;">${materials.length} item${materials.length !== 1 ? "s" : ""}</p>
      </div>
      <div style="background:#fef6e4;border:1px solid #f5c842;border-radius:12px;padding:18px 20px;">
        <p style="margin:0 0 6px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#8a6000;">Total Spending</p>
        <strong style="font-size:1.5rem;color:#6b4c00;">${formatCurrency(totalGeral)}</strong>
        <p style="margin:6px 0 0;font-size:0.78rem;color:#8a6000;">${totalGeral > 0 ? Math.round((totalLabor / totalGeral) * 100) : 0}% labor &nbsp;|&nbsp; ${totalGeral > 0 ? Math.round((totalMaterial / totalGeral) * 100) : 0}% material</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <article class="panel" style="margin:0;">
        <p class="section-tag" style="margin:0 0 12px;">Labor by Employee</p>
        ${laborByEmployee.size ? Array.from(laborByEmployee.values()).sort((a, b) => b.total - a.total).map((e) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);font-size:0.84rem;">
            <div>
              <strong style="display:block;">${e.name}</strong>
              <span style="color:var(--muted);font-size:0.76rem;">${e.days} day${e.days !== 1 ? "s" : ""} worked</span>
            </div>
            <strong style="color:#1a4f72;">${formatCurrency(e.total)}</strong>
          </div>`).join("") : '<p style="color:var(--muted);font-size:0.83rem;">No payments recorded.</p>'}
      </article>

      <article class="panel" style="margin:0;">
        <p class="section-tag" style="margin:0 0 12px;">Materials by Category</p>
        ${matByCategory.size ? Array.from(matByCategory.entries()).sort((a, b) => b[1] - a[1]).map(([cat, val]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);font-size:0.84rem;">
            <span style="text-transform:capitalize;">${cat}</span>
            <strong style="color:#3d2070;">${formatCurrency(val)}</strong>
          </div>`).join("") : '<p style="color:var(--muted);font-size:0.83rem;">No materials registered.</p>'}
      </article>
    </div>

    <article class="panel" style="margin:0;">
      <p class="section-tag" style="margin:0 0 12px;">Spending by Project</p>
      ${projectRows.length ? `
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.84rem;">
            <thead>
              <tr style="border-bottom:2px solid var(--line);">
                <th style="text-align:left;padding:8px 10px;color:var(--muted);font-size:0.72rem;text-transform:uppercase;letter-spacing:.06em;">Project</th>
                <th style="text-align:right;padding:8px 10px;color:#2a6496;font-size:0.72rem;text-transform:uppercase;letter-spacing:.06em;">Labor</th>
                <th style="text-align:right;padding:8px 10px;color:#5b3a9e;font-size:0.72rem;text-transform:uppercase;letter-spacing:.06em;">Materials</th>
                <th style="text-align:right;padding:8px 10px;color:#8a6000;font-size:0.72rem;text-transform:uppercase;letter-spacing:.06em;">Total Spending</th>
                <th style="text-align:right;padding:8px 10px;color:#1e6e3a;font-size:0.72rem;text-transform:uppercase;letter-spacing:.06em;">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              ${projectRows.map((row) => `
                <tr style="border-bottom:1px solid var(--line);">
                  <td style="padding:9px 10px;">
                    <strong style="display:block;">${row.project.clientName}</strong>
                    <span style="color:var(--muted);font-size:0.76rem;">${row.project.projectType || ""}</span>
                  </td>
                  <td style="padding:9px 10px;text-align:right;color:#1a4f72;font-weight:600;">${formatCurrency(row.pLabor)}</td>
                  <td style="padding:9px 10px;text-align:right;color:#3d2070;font-weight:600;">${formatCurrency(row.pMaterial)}</td>
                  <td style="padding:9px 10px;text-align:right;font-weight:700;">${formatCurrency(row.pTotal)}</td>
                  <td style="padding:9px 10px;text-align:right;color:#1e6e3a;font-weight:700;">${formatCurrency(row.project.remainingToReceive || 0)}</td>
                </tr>`).join("")}
              <tr style="background:#e8f7ee;border-top:2px solid #7ecf96;">
                <td style="padding:11px 10px;font-weight:700;color:#155229;">Total Outstanding</td>
                <td style="padding:11px 10px;text-align:right;color:#1a4f72;font-weight:700;">${formatCurrency(totalLabor)}</td>
                <td style="padding:11px 10px;text-align:right;color:#3d2070;font-weight:700;">${formatCurrency(totalMaterial)}</td>
                <td style="padding:11px 10px;text-align:right;font-weight:700;">${formatCurrency(totalGeral)}</td>
                <td style="padding:11px 10px;text-align:right;font-size:1.05rem;font-weight:800;color:#155229;">${formatCurrency(totalAReceber)}</td>
              </tr>
            </tbody>
          </table>
        </div>` : '<p style="color:var(--muted);font-size:0.83rem;">No projects found.</p>'}
    </article>

    <div style="margin-top:16px;background:#e8f7ee;border:2px solid #7ecf96;border-radius:12px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <p style="margin:0 0 4px;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#1e6e3a;">Total Outstanding</p>
        <p style="margin:0;font-size:0.82rem;color:#2a7a45;">${scopedProjects.length} project${scopedProjects.length !== 1 ? "s" : ""} &nbsp;·&nbsp; Contracted: ${formatCurrency(scopedProjects.reduce((s, p) => s + Number(p.totalValue || 0), 0))} &nbsp;·&nbsp; Already received: ${formatCurrency(scopedProjects.reduce((s, p) => s + Number(p.receivedAmount || 0), 0))}</p>
      </div>
      <strong style="font-size:2rem;color:#155229;white-space:nowrap;margin-left:24px;">${formatCurrency(totalAReceber)}</strong>
    </div>
  `;
}

function renderOverheadExpenses() {
  const range = getDateRangeForFilters();
  const expenses = state.overheadExpenses.filter((expense) => inDateRange(expense.spentAt, range));
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const average = expenses.length ? total / expenses.length : 0;
  const groupedByCategory = expenses.reduce((map, expense) => {
    map.set(expense.category, (map.get(expense.category) || 0) + Number(expense.amount || 0));
    return map;
  }, new Map());
  const topCategory = Array.from(groupedByCategory.entries()).sort((a, b) => b[1] - a[1])[0];
  const profitBasis = Number(elements.summaryProfit.textContent.replace(/[^0-9.-]+/g, "")) || 0;
  const impact = profitBasis > 0 ? (total / profitBasis) * 100 : total > 0 ? 100 : 0;

  renderList(
    elements.overheadExpensesList,
    expenses,
    (expense) => `
      <article class="list-item">
        <strong>${expense.category}</strong>
        <p>${expense.description || "No description."}</p>
        <p>${formatCurrency(expense.amount)} on ${formatDate(expense.spentAt)}</p>
        <p>${expense.notes || "No notes."}</p>
        <div class="inline-actions">
          <button class="button-secondary" data-edit-overhead-expense="${expense.id}">Edit</button>
          <button class="button-danger" data-delete-overhead-expense="${expense.id}">Delete</button>
        </div>
      </article>
    `,
  );

  elements.overheadInsights.innerHTML = [
    ["Total in period", formatCurrency(total)],
    ["Average per entry", formatCurrency(average)],
    ["Top category", topCategory ? `${topCategory[0]} (${formatCurrency(topCategory[1])})` : "No data"],
    ["Estimated impact on result", formatPercent(impact)],
  ]
    .map(
      ([label, value]) => `
        <div class="metric-chip">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");

  document.querySelectorAll("[data-edit-overhead-expense]").forEach((button) => {
    button.addEventListener("click", () => {
      const expense = state.overheadExpenses.find((item) => item.id === Number(button.dataset.editOverheadExpense));
      if (expense) {
        loadOverheadExpenseIntoForm(expense);
      }
    });
  });

  document.querySelectorAll("[data-delete-overhead-expense]").forEach((button) => {
    button.addEventListener("click", async () => {
      const expense = state.overheadExpenses.find((item) => item.id === Number(button.dataset.deleteOverheadExpense));
      if (!expense || !await showConfirm("Delete expense", `Delete expense for ${expense.category}?`)) {
        return;
      }

      await api(`/api/overhead-expenses/${expense.id}`, { method: "DELETE" });
      if (state.editingOverheadExpenseId === expense.id) {
        resetOverheadForm();
      }
      await refreshAll();
    });
  });
}

function renderClients() {
  const visibleClients = state.clients.filter((client) =>
    matchesSearch(
      state.search.clients,
      client.name,
      client.companyName,
      client.phone,
      client.email,
      client.address,
    ),
  );

  renderList(
    elements.clientsList,
    visibleClients,
    (client) => {
      const isSelected = client.id === state.selectedClientId;
      return `
        <div class="client-sidebar-item${isSelected ? " selected" : ""}" data-select-client="${client.id}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div style="min-width:0;flex:1">
              <div style="font-weight:700;font-size:14px;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${client.name}</div>
              ${client.companyName ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${client.companyName}</div>` : ""}
              ${client.email ? `<div style="font-size:11px;color:#9ca3af;margin-top:1px">${client.email}</div>` : ""}
            </div>
            <div style="display:flex;gap:4px;flex-shrink:0;margin-top:2px">
              <button class="button-secondary" style="padding:3px 8px;font-size:11px" data-edit-client="${client.id}">Edit</button>
              <button class="button-danger" style="padding:3px 8px;font-size:11px" data-delete-client="${client.id}">Del</button>
            </div>
          </div>
        </div>
      `;
    },
    getSearchEmptyMarkup("No clients found."),
  );

  document.querySelectorAll("[data-select-client]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      const clientId = Number(el.dataset.selectClient);
      state.selectedClientId = clientId === state.selectedClientId ? null : clientId;
      renderClients();
      renderClientEstimatesView();
    });
  });

  document.querySelectorAll("[data-edit-client]").forEach((button) => {
    button.addEventListener("click", () => {
      const client = state.clients.find((item) => item.id === Number(button.dataset.editClient));
      if (client) loadClientIntoForm(client);
    });
  });

  document.querySelectorAll("[data-delete-client]").forEach((button) => {
    button.addEventListener("click", async () => {
      const client = state.clients.find((item) => item.id === Number(button.dataset.deleteClient));
      if (!client || !(await showConfirm("Delete client", `Delete "${client.name}"?`))) return;

      await api(`/api/clients/${client.id}`, { method: "DELETE" });
      if (state.editingClientId === client.id) resetClientForm();
      if (state.selectedClientId === client.id) state.selectedClientId = null;
      await refreshAll();
    });
  });

  renderClientEstimatesView();
}

function renderClientEstimatesView() {
  const panel = document.querySelector("#client-estimates-panel");
  if (!panel) return;

  if (!state.selectedClientId) {
    panel.innerHTML = `
      <div class="panel" style="text-align:center;padding:64px 24px;color:#9ca3af">
        <div style="font-size:48px;margin-bottom:16px">&#128101;</div>
        <p style="font-size:16px;font-weight:600;color:#374151;margin-bottom:8px">Select a client</p>
        <p style="font-size:14px">Click on a name in the list to view their estimates</p>
      </div>
    `;
    return;
  }

  const client = state.clients.find((c) => c.id === state.selectedClientId);
  if (!client) return;

  const clientEstimates = state.estimates.filter((e) => e.clientId === state.selectedClientId);

  const byYear = {};
  clientEstimates.forEach((est) => {
    const year = est.issueDate ? est.issueDate.slice(0, 4) : "—";
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(est);
  });
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  const statusStyle = {
    rascunho:             { label: "Draft",        color: "#6b7280", bg: "#f3f4f6" },
    enviado:              { label: "Sent",          color: "#1d4ed8", bg: "#eff6ff" },
    aprovado:             { label: "Approved",      color: "#15803d", bg: "#f0fdf4" },
    ajustes_solicitados:  { label: "Adjustments",   color: "#d97706", bg: "#fffbeb" },
    recusado:             { label: "Declined",      color: "#dc2626", bg: "#fef2f2" },
    convertido:           { label: "Converted",     color: "#7c3aed", bg: "#f5f3ff" },
  };

  const yearSections = years.map((year) => {
    const ests = byYear[year];
    const yearTotal = ests.reduce((sum, e) => sum + Number(e.totalAmount || 0), 0);

    const estRows = ests.map((est) => {
      const s = statusStyle[est.status] || { label: est.status, color: "#6b7280", bg: "#f3f4f6" };
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f3f4f6">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#111827">${est.estimateNumber} — ${est.workTitle}</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:2px">${formatDate(est.issueDate)}</div>
          </div>
          <span style="padding:3px 9px;border-radius:12px;font-size:11px;font-weight:700;flex-shrink:0;background:${s.bg};color:${s.color}">${s.label}</span>
          <div style="font-size:14px;font-weight:700;color:#111827;white-space:nowrap;min-width:90px;text-align:right">${formatCurrency(est.totalAmount)}</div>
          <button class="button-secondary" style="padding:4px 10px;font-size:12px;flex-shrink:0" data-edit-estimate-from-client="${est.id}">Edit</button>
        </div>
      `;
    }).join("");

    return `
      <div class="panel" style="margin-bottom:12px;padding:20px 24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:12px;border-bottom:2px solid #f3f4f6">
          <div style="display:flex;align-items:baseline;gap:10px">
            <span style="font-size:20px;font-weight:800;color:#111827">${year}</span>
            <span style="font-size:13px;color:#9ca3af">${ests.length} estimate${ests.length !== 1 ? "s" : ""}</span>
          </div>
          <strong style="font-size:17px;color:#1a5446">${formatCurrency(yearTotal)}</strong>
        </div>
        ${estRows}
      </div>
    `;
  }).join("");

  const overallTotal = clientEstimates.reduce((sum, e) => sum + Number(e.totalAmount || 0), 0);
  const approvedCount = clientEstimates.filter((e) => e.status === "aprovado").length;

  panel.innerHTML = `
    <div class="panel" style="margin-bottom:16px;padding:20px 24px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
        <div>
          <h3 style="font-size:18px;margin:0 0 4px">${client.name}</h3>
          ${client.companyName ? `<p style="color:#6b7280;font-size:14px;margin:0 0 2px">${client.companyName}</p>` : ""}
          ${client.email ? `<p style="color:#9ca3af;font-size:13px;margin:0 0 2px">${client.email}</p>` : ""}
          ${client.phone ? `<p style="color:#9ca3af;font-size:13px;margin:0">${client.phone}</p>` : ""}
        </div>
        <button class="button-secondary" style="flex-shrink:0" data-edit-client="${client.id}">Edit client</button>
      </div>
      <div style="display:flex;gap:28px;margin-top:16px;padding-top:16px;border-top:1px solid #f3f4f6;flex-wrap:wrap">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:4px">Estimates</div>
          <div style="font-size:22px;font-weight:800;color:#111827">${clientEstimates.length}</div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:4px">Total value</div>
          <div style="font-size:22px;font-weight:800;color:#1a5446">${formatCurrency(overallTotal)}</div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:4px">Approved</div>
          <div style="font-size:22px;font-weight:800;color:#15803d">${approvedCount}</div>
        </div>
      </div>
    </div>

    ${years.length > 0 ? yearSections : `
      <div class="panel" style="text-align:center;padding:40px 24px;color:#9ca3af">
        <p style="font-size:14px">No estimates for this client yet.</p>
        <button class="button-primary" style="margin-top:16px" data-new-estimate-for-client="${client.id}">+ Create first estimate</button>
      </div>
    `}
  `;

  panel.querySelectorAll("[data-edit-client]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = state.clients.find((c) => c.id === Number(btn.dataset.editClient));
      if (c) loadClientIntoForm(c);
    });
  });

  panel.querySelectorAll("[data-edit-estimate-from-client]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const est = state.estimates.find((e) => e.id === Number(btn.dataset.editEstimateFromClient));
      if (!est) return;
      document.querySelector('[data-tab="estimates-orcamentos"]')?.click();
      loadEstimateIntoForm(est);
    });
  });

  panel.querySelectorAll("[data-new-estimate-for-client]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector('[data-tab="estimates-orcamentos"]')?.click();
      resetEstimateForm();
      const sel = elements.estimateForm?.elements?.clientId;
      if (sel) sel.value = String(btn.dataset.newEstimateForClient);
    });
  });
}

function renderEstimates() {
  const statusFilter = elements.estimateStatusFilter.value;
  const estimates = statusFilter
    ? state.estimates.filter((estimate) => estimate.status === statusFilter)
    : state.estimates;
  const visibleEstimates = estimates.filter((estimate) =>
    matchesSearch(
      state.search.estimates,
      estimate.estimateNumber,
      estimate.workTitle,
      estimate.clientName,
      estimate.projectDescription,
      estimate.status,
    ),
  );

  renderList(
    elements.estimatesList,
    visibleEstimates,
    (estimate) => `
      <article class="list-item">
        <strong>${estimate.estimateNumber} - ${estimate.workTitle}</strong>
        <p>Client: ${estimate.clientName || "Not linked"}</p>
        <p>Status: ${estimate.status} | Total: ${formatCurrency(estimate.totalAmount)}</p>
        <p>Valid until: ${formatDate(estimate.validUntil)}</p>
        <p>Linked project: ${estimate.projectDescription || "None"}</p>
        <div class="inline-actions">
          <button class="button-secondary" data-edit-estimate="${estimate.id}">Edit</button>
          <button class="button-secondary" data-print-estimate="${estimate.id}">PDF</button>
          <button class="button-secondary" data-convert-estimate-to-forecast="${estimate.id}">Convert to forecast</button>
          <button class="button-primary" data-convert-estimate="${estimate.id}">Convert to project</button>
          <button class="button-danger" data-delete-estimate="${estimate.id}">Delete</button>
        </div>
      </article>
    `,
    getSearchEmptyMarkup("No estimates found with this filter."),
  );

  document.querySelectorAll("[data-edit-estimate]").forEach((button) => {
    button.addEventListener("click", () => {
      const estimate = state.estimates.find((item) => item.id === Number(button.dataset.editEstimate));
      if (estimate) {
        loadEstimateIntoForm(estimate);
      }
    });
  });

  document.querySelectorAll("[data-convert-estimate]").forEach((button) => {
    button.addEventListener("click", async () => {
      const estimate = state.estimates.find((item) => item.id === Number(button.dataset.convertEstimate));
      if (!estimate || !await showConfirm("Convert estimate", `Convert "${estimate.estimateNumber}" to project?`)) {
        return;
      }

      await api(`/api/estimates/${estimate.id}/convert-to-project`, {
        method: "POST",
        body: JSON.stringify({ startDate: new Date().toISOString().slice(0, 10), estimatedDays: 30 }),
      });
      await refreshAll();
    });
  });

  document.querySelectorAll("[data-convert-estimate-to-forecast]").forEach((button) => {
    button.addEventListener("click", async () => {
      const estimate = state.estimates.find((item) => item.id === Number(button.dataset.convertEstimateToForecast));
      if (!estimate || !await showConfirm("Convert estimate", `Convert "${estimate.estimateNumber}" to forecast?`)) {
        return;
      }

      await api(`/api/estimates/${estimate.id}/convert-to-forecast`, {
        method: "POST",
        body: JSON.stringify({ expectedStartDate: estimate.validUntil || new Date().toISOString().slice(0, 10) }),
      });
      await refreshAll();
    });
  });

  document.querySelectorAll("[data-print-estimate]").forEach((button) => {
    button.addEventListener("click", () => {
      const estimate = state.estimates.find((item) => item.id === Number(button.dataset.printEstimate));
      if (!estimate) {
        return;
      }

      loadEstimateIntoForm(estimate);
      openEstimatePdf();
    });
  });

  document.querySelectorAll("[data-delete-estimate]").forEach((button) => {
    button.addEventListener("click", async () => {
      const estimate = state.estimates.find((item) => item.id === Number(button.dataset.deleteEstimate));
      if (!estimate || !await showConfirm("Delete estimate", `Delete "${estimate.estimateNumber}"?`)) {
        return;
      }

      await api(`/api/estimates/${estimate.id}`, { method: "DELETE" });
      if (state.editingEstimateId === estimate.id) {
        resetEstimateForm();
      }
      await refreshAll();
    });
  });
}

function renderProductionBoard() {
  const estimateStage = state.estimates.filter((estimate) => !state.forecasts.some((forecast) => forecast.estimateId === estimate.id));
  const forecastStage = state.forecasts.filter((forecast) => !forecast.projectId);
  const projectStage = state.projects.filter((project) => project.estimateId || project.forecastId);

  renderList(
    elements.productionEstimatesList,
    estimateStage,
    (estimate) => `
      <article class="list-item">
        <strong>${estimate.estimateNumber}</strong>
        <p>${estimate.workTitle}</p>
        <p>${estimate.clientName || "No client"}</p>
        <p>${formatCurrency(estimate.totalAmount)}</p>
      </article>
    `,
  );

  renderList(
    elements.productionForecastsList,
    forecastStage,
    (forecast) => `
      <article class="list-item">
        <strong>${forecast.title}</strong>
        <p>${forecast.clientName}</p>
        <p>Status: ${forecast.status}</p>
        <p>${formatCurrency(forecast.totalValue)}</p>
      </article>
    `,
  );

  renderList(
    elements.productionProjectsList,
    projectStage,
    (project) => `
      <article class="list-item">
        <strong>${project.clientName}</strong>
        <p>${project.description}</p>
        <p>${makeStatusPill(project.status)}</p>
        <p>${formatCurrency(project.totalValue)}</p>
      </article>
    `,
  );
}

function updateExportLinks() {
  const status = elements.globalStatusFilter.value;
  const range = getDateRangeForFilters();
  const projectId = state.selectedProjectId ? String(state.selectedProjectId) : "";
  const projectsParams = new URLSearchParams();
  const cashflowParams = new URLSearchParams();

  if (status) {
    projectsParams.set("status", status);
  }

  if (projectId) {
    cashflowParams.set("projectId", projectId);
  }

  if (range) {
    cashflowParams.set("startDate", range.startDate);
    cashflowParams.set("endDate", range.endDate);
  }

  elements.exportProjectsLink.href = `/api/reports/exports/projects.csv${projectsParams.toString() ? `?${projectsParams}` : ""}`;
  elements.exportCashflowLink.href = `/api/reports/exports/cashflow.csv${cashflowParams.toString() ? `?${cashflowParams}` : ""}`;
}

function renderProjectsTable() {
  const statusFilter = elements.globalStatusFilter.value;
  const scopedProjects = state.selectedProjectId
    ? state.projects.filter((project) => project.id === state.selectedProjectId)
    : state.projects.filter((project) => !statusFilter || project.status === statusFilter);
  const visibleProjects = scopedProjects.filter((project) =>
    matchesSearch(
      state.search.projects,
      project.clientName,
      project.projectType,
      project.description,
      project.address,
      project.managerName,
    ),
  );

  if (!visibleProjects.length) {
    elements.projectsTableBody.innerHTML = "<tr><td colspan=\"7\">No projects found with this filter.</td></tr>";
    return;
  }

  elements.projectsTableBody.innerHTML = visibleProjects
    .map(
      (project) => `
        <tr>
          <td>${project.clientName}</td>
          <td>${project.description}</td>
          <td>${project.assignedEmployees}</td>
          <td>${formatCurrency(project.totalValue)}</td>
          <td>${formatCurrency(project.receivedAmount)}</td>
          <td>${formatCurrency(project.totalCosts)}</td>
          <td class="${project.profit >= 0 ? "money-positive" : "money-negative"}">${formatCurrency(project.profit)}</td>
        </tr>
      `,
    )
    .join("");
}

function populateSelect(select, options, placeholder) {
  select.innerHTML = [
    `<option value="">${placeholder}</option>`,
    ...options.map((option) => `<option value="${option.id}">${option.label}</option>`),
  ].join("");
}

function renderSelects() {
  const statusFilter = elements.globalStatusFilter.value;
  const projectOptions = state.projects
    .filter((project) => !statusFilter || project.status === statusFilter)
    .map((project) => ({
      id: project.id,
      label: `${project.clientName} - ${project.description}`,
    }));

  const activeProjectOptions = state.projects
    .filter((project) => project.status === "em andamento")
    .map((project) => ({
      id: project.id,
      label: `${project.clientName} - ${project.description}`,
    }));

  const employeeOptions = state.employees.map((employee) => ({
    id: employee.id,
    label: `${employee.name}${employee.role ? ` - ${employee.role}` : ""}${employee.isActive ? "" : " (inactive)"}`,
  }));
  const clientOptions = state.clients.map((client) => ({
    id: client.id,
    label: `${client.name}${client.companyName ? ` - ${client.companyName}` : ""}`,
  }));

  populateSelect(elements.assignmentProjectSelect, activeProjectOptions, "Select project");
  populateSelect(elements.assignmentEmployeeSelect, employeeOptions, "Select employee");
  populateSelect(elements.laborProjectSelect, projectOptions, "Select project");
  populateSelect(elements.materialProjectSelect, projectOptions, "Select project");
  populateSelect(elements.receiptProjectSelect, projectOptions, "Select project");
  populateSelect(elements.laborEmployeeSelect, employeeOptions, "Select employee");
  populateSelect(elements.estimateClientSelect, clientOptions, "Select client");
  populateSelect(elements.estimateProjectSelect, projectOptions, "No linked project");

  elements.globalProjectSelect.innerHTML = [
    '<option value="">All projects</option>',
    ...projectOptions.map((option) => `<option value="${option.id}">${option.label}</option>`),
  ].join("");

  elements.globalProjectSelect.value = state.selectedProjectId ? String(state.selectedProjectId) : "";

  if (state.selectedProjectId) {
    elements.assignmentProjectSelect.value = String(state.selectedProjectId);
    elements.laborProjectSelect.value = String(state.selectedProjectId);
    elements.materialProjectSelect.value = String(state.selectedProjectId);
    elements.receiptProjectSelect.value = String(state.selectedProjectId);
  }

  if (state.editingEstimateId) {
    const estimate = state.estimates.find((item) => item.id === state.editingEstimateId);
    if (estimate) {
      elements.estimateClientSelect.value = estimate.clientId ? String(estimate.clientId) : "";
      elements.estimateProjectSelect.value = estimate.projectId ? String(estimate.projectId) : "";
    }
  }

  renderEstimatePreview();
}

async function refreshProjects() {
  const statusFilter = elements.reportStatusFilter.value;
  const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
  state.projects = await api(`/api/reports/projects${query}`);

  if (state.selectedProjectId !== null && !state.projects.find((project) => project.id === state.selectedProjectId)) {
    state.selectedProjectId = state.projects[0]?.id || null;
  }
}

async function refreshWeeklyPayments() {
  const startDate = elements.weekStartDate.value;
  const { endDate } = getWeekDates(startDate);
  state.weeklyPayments = await api(
    `/api/reports/weekly-payments?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
}

async function refreshAssignments() {
  const activeProjects = state.projects.filter((project) => project.status === "em andamento");
  const assignments = await Promise.all(
    activeProjects.map((project) => api(`/api/projects/${project.id}/assignments`)),
  );
  state.projectAssignments = assignments.flat();
}

async function refreshSelectedProjectOverview() {
  if (!state.selectedProjectId) {
    state.selectedProjectOverview = null;
    return;
  }

  state.selectedProjectOverview = await api(`/api/projects/${state.selectedProjectId}/overview`);
}

async function refreshAll() {
  const [dashboard, clients, estimates, employees, laborRecords, materials, receipts, overheadExpenses, forecasts, auditLogs] = await Promise.all([
    api("/api/dashboard"),
    api("/api/clients"),
    api("/api/estimates"),
    api("/api/employees"),
    api("/api/labor-records"),
    api("/api/materials"),
    api("/api/receipts"),
    api("/api/overhead-expenses"),
    api("/api/forecasts"),
    api("/api/audit-logs?limit=12"),
  ]);

  state.dashboard = dashboard;
  state.clients = clients;
  state.estimates = estimates;
  state.employees = employees;
  state.laborRecords = laborRecords;
  state.materials = materials;
  state.receipts = receipts;
  state.overheadExpenses = overheadExpenses;
  state.forecasts = forecasts;
  state.auditLogs = auditLogs;

  await Promise.all([refreshProjects(), refreshWeeklyPayments()]);
  await Promise.all([refreshAssignments(), refreshSelectedProjectOverview()]);

  renderDashboard();
  renderClients();
  renderEstimates();
  renderProductionBoard();
  renderProjectsList();
  renderProjectDetail();
  renderEmployees();
  renderProjectAssignments();
  renderLaborRecords();
  renderMaterials();
  renderReceipts();
  renderOverheadExpenses();
  renderOpsResumo();
  renderWeeklyPayments();
  renderForecasts();
  renderAuditLogs();
  renderProjectsTable();
  renderSelects();
  updateExportLinks();
}

function formDataToJson(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setupNavigation() {
  const sectionTitles = {
    dashboard: "Dashboard",
    estimates: "Estimates & Clients",
    projects: "Projects",
    team: "Team",
    operations: "Operations",
    forecasts: "Forecasts",
    reports: "Reports",
    settings: "Company settings",
  };

  document.querySelectorAll(".section-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;
      const parentSection = tab.closest(".content-section");
      parentSection.querySelectorAll(".section-tab").forEach((t) => t.classList.remove("active"));
      parentSection.querySelectorAll(".tab-pane-block").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const pane = parentSection.querySelector(`#tab-${tabId}`);
      if (pane) pane.classList.add("active");
      if (tabId === "ops-resumo") renderOpsResumo();
    });
  });

  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.section;
      closeSlideOver();
      elements.navButtons.forEach((item) => item.classList.toggle("active", item === button));
      elements.sections.forEach((section) => {
        section.classList.toggle("active", section.id === `section-${target}`);
      });
      elements.sectionTitle.textContent = sectionTitles[target];
    });
  });
}

function setupForms() {
  elements.clientForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.clientForm);
    const clientId = state.editingClientId;
    delete payload.clientRecordId;
    delete payload.logoFile;

    await api(clientId ? `/api/clients/${clientId}` : "/api/clients", {
      method: clientId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetClientForm();
    showToast(clientId ? "Client updated" : "Client saved", "success");
    await refreshAll();
  });

  elements.estimateSubmitButton.addEventListener("click", async () => {
    const payload = formDataToJson(elements.estimateForm);
    payload.items = state.estimateItemsDraft;
    const estimateId = state.editingEstimateId;
    delete payload.estimateRecordId;
    delete payload.businessLogoFile;

    await api(estimateId ? `/api/estimates/${estimateId}` : "/api/estimates", {
      method: estimateId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetEstimateForm();
    showToast(estimateId ? "Estimate updated" : "Estimate saved", "success");
    await refreshAll();
  });

  elements.estimatePdfButton.addEventListener("click", () => {
    openEstimatePdf();
  });

  document.querySelector("#estimate-send-email-button")?.addEventListener("click", async () => {
    if (!state.editingEstimateId) {
      showToast("Save the estimate before sending by email.", "info");
      return;
    }
    const btn = document.querySelector("#estimate-send-email-button");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending...";
    try {
      const result = await api(`/api/estimates/${state.editingEstimateId}/send-approval`, { method: "POST" });
      showToast(result.message || "Email sent successfully!", "success");
      await refreshAll();
      loadNotifications();
    } catch (err) {
      showToast(err.message || "Error sending email.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  elements.estimateConvertButton.addEventListener("click", async () => {
    if (!state.editingEstimateId) {
      showToast("Save the estimate before converting to project.", "info");
      return;
    }

    await api(`/api/estimates/${state.editingEstimateId}/convert-to-project`, {
      method: "POST",
      body: JSON.stringify({ startDate: new Date().toISOString().slice(0, 10), estimatedDays: 30 }),
    });
    await refreshAll();
  });

  elements.projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.projectForm);
    const projectId = state.editingProjectId;
    delete payload.projectId;

    await api(projectId ? `/api/projects/${projectId}` : "/api/projects", {
      method: projectId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetProjectForm();
    showToast(projectId ? "Project updated" : "Project saved", "success");
    await refreshAll();
  });

  elements.employeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.employeeForm);
    const employeeId = state.editingEmployeeId;
    delete payload.employeeId;

    await api(employeeId ? `/api/employees/${employeeId}` : "/api/employees", {
      method: employeeId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetEmployeeForm();
    showToast(employeeId ? "Employee updated" : "Employee saved", "success");
    await refreshAll();
  });

  elements.assignmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.assignmentForm);
    const daysWorked = Number(payload.daysWorked || 0);
    const workStartDate = payload.assignedAt;

    await api(`/api/projects/${payload.projectId}/assignments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (daysWorked > 0) {
      await api("/api/labor-records", {
        method: "POST",
        body: JSON.stringify({
          projectId: payload.projectId,
          employeeId: payload.employeeId,
          daysWorked,
          workStartDate,
          notes: payload.notes || null,
        }),
      });
    }

    elements.assignmentForm.reset();
    updateAssignmentCostPreview();
    setupDefaults();
    await refreshAll();
  });

  elements.laborForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.laborForm);
    const recordId = payload.recordId;
    delete payload.recordId;

    await api(recordId ? `/api/labor-records/${recordId}` : "/api/labor-records", {
      method: recordId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetLaborForm();
    showToast(recordId ? "Payment updated" : "Payment saved", "success");
    await refreshAll();
  });

  elements.materialForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.materialForm);
    const materialId = state.editingMaterialId;
    delete payload.materialId;

    await api(materialId ? `/api/materials/${materialId}` : "/api/materials", {
      method: materialId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetMaterialForm();
    showToast(materialId ? "Material updated" : "Material saved", "success");
    await refreshAll();
  });

  elements.forecastForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.forecastForm);
    const forecastId = state.editingForecastId;
    delete payload.forecastId;

    await api(forecastId ? `/api/forecasts/${forecastId}` : "/api/forecasts", {
      method: forecastId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetForecastForm();
    showToast(forecastId ? "Forecast updated" : "Forecast saved", "success");
    await refreshAll();
  });

  elements.receiptForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.receiptForm);
    const receiptId = state.editingReceiptId;
    delete payload.receiptId;

    await api(receiptId ? `/api/receipts/${receiptId}` : "/api/receipts", {
      method: receiptId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetReceiptForm();
    showToast(receiptId ? "Receipt updated" : "Receipt saved", "success");
    await refreshAll();
  });

  elements.overheadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(elements.overheadForm);
    const expenseId = state.editingOverheadExpenseId;
    delete payload.overheadExpenseId;

    await api(expenseId ? `/api/overhead-expenses/${expenseId}` : "/api/overhead-expenses", {
      method: expenseId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    resetOverheadForm();
    showToast(expenseId ? "Expense updated" : "Expense saved", "success");
    await refreshAll();
  });

  elements.reportStatusFilter.addEventListener("change", async () => {
    await refreshAll();
    updateExportLinks();
  });

  elements.weeklyReportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await refreshWeeklyPayments();
    renderWeeklyPayments();
  });

  elements.laborForm.elements.employeeId.addEventListener("change", updateCalculatedLaborAmount);
  elements.laborForm.elements.daysWorked.addEventListener("input", updateCalculatedLaborAmount);

  elements.assignmentEmployeeSelect.addEventListener("change", updateAssignmentCostPreview);
  elements.assignmentDaysWorked.addEventListener("input", updateAssignmentCostPreview);

  elements.laborCancelEdit.addEventListener("click", () => {
    resetLaborForm();
  });

  elements.employeeCancelEdit.addEventListener("click", () => {
    resetEmployeeForm();
  });

  elements.projectCancelEdit.addEventListener("click", () => {
    resetProjectForm();
  });

  elements.materialCancelEdit.addEventListener("click", () => {
    resetMaterialForm();
  });

  elements.receiptCancelEdit.addEventListener("click", () => {
    resetReceiptForm();
  });

  elements.forecastCancelEdit.addEventListener("click", () => {
    resetForecastForm();
  });

  elements.overheadCancelEdit.addEventListener("click", () => {
    resetOverheadForm();
  });

  elements.clientCancelEdit.addEventListener("click", () => {
    resetClientForm();
  });

  elements.estimateCancelEdit.addEventListener("click", () => {
    resetEstimateForm();
  });

  elements.globalProjectSelect.addEventListener("change", async () => {
    const value = elements.globalProjectSelect.value;
    state.selectedProjectId = value ? Number(value) : null;
    await refreshSelectedProjectOverview();
    renderDashboard();
    renderProjectsList();
    renderProjectDetail();
    renderProjectAssignments();
    renderLaborRecords();
    renderMaterials();
    renderReceipts();
    renderOverheadExpenses();
    renderOpsResumo();
    renderWeeklyPayments();
    renderProjectsTable();
    renderSelects();
    updateExportLinks();
  });

  elements.globalStatusFilter.addEventListener("change", async () => {
    renderDashboard();
    renderProjectsList();
    renderProjectAssignments();
    renderLaborRecords();
    renderMaterials();
    renderReceipts();
    renderOverheadExpenses();
    renderOpsResumo();
    renderWeeklyPayments();
    renderProjectsTable();
    renderSelects();
    updateExportLinks();
  });

  elements.globalPeriodFilter.addEventListener("change", () => {
    renderDashboard();
    renderLaborRecords();
    renderMaterials();
    renderReceipts();
    renderOverheadExpenses();
    renderOpsResumo();
    updateExportLinks();
  });

  elements.globalReferenceDate.addEventListener("change", () => {
    renderDashboard();
    renderLaborRecords();
    renderMaterials();
    renderReceipts();
    renderOverheadExpenses();
    renderOpsResumo();
    updateExportLinks();
  });

  elements.materialForm.elements.quantity.addEventListener("input", updateCalculatedMaterialCost);
  elements.materialForm.elements.unitPrice.addEventListener("input", updateCalculatedMaterialCost);
  elements.materialForm.elements.cost.addEventListener("input", () => {
    elements.materialForm.elements.cost.dataset.manual = elements.materialForm.elements.cost.value ? "true" : "";
  });

  ["clientId", "businessName", "businessLogoUrl", "issueDate", "validUntil", "workTitle", "discountAmount", "taxPercent"].forEach((field) => {
    elements.estimateForm.elements[field].addEventListener("input", renderEstimatePreview);
    elements.estimateForm.elements[field].addEventListener("change", renderEstimatePreview);
  });

  elements.estimateAddItemButton.addEventListener("click", () => {
    state.estimateItemsDraft.push({ description: "", quantity: 1, unitPrice: 0, process: "", materialResponsibility: "empresa", materialDescription: "" });
    renderEstimateItemsEditor();
    renderEstimatePreview();
  });

  elements.clientForm.elements.logoFile.addEventListener("change", async () => {
    const file = elements.clientForm.elements.logoFile.files?.[0];
    if (!file) {
      return;
    }

    elements.clientForm.elements.logoUrl.value = await readFileAsDataUrl(file);
  });

  elements.estimateForm.elements.businessLogoFile.addEventListener("change", async () => {
    const file = elements.estimateForm.elements.businessLogoFile.files?.[0];
    if (!file) {
      return;
    }

    elements.estimateForm.elements.businessLogoUrl.value = await readFileAsDataUrl(file);
    renderEstimatePreview();
  });

  elements.estimateStatusFilter.addEventListener("change", () => {
    renderEstimates();
  });

  elements.dashboardEstimateStatusFilter.addEventListener("change", () => {
    renderDashboard();
  });

  [
    ["clients", elements.clientSearch, () => renderClients()],
    ["employees", elements.employeeSearch, () => renderEmployees()],
    ["estimates", elements.estimateSearch, () => renderEstimates()],
    ["forecasts", elements.forecastSearch, () => renderForecasts()],
    ["materials", elements.materialSearch, () => renderMaterials()],
    ["projects", elements.projectSearch, () => {
      renderProjectsList();
      renderProjectsTable();
    }],
  ].forEach(([key, input, render]) => {
    if (!input) {
      return;
    }

    input.addEventListener("input", () => {
      state.search[key] = input.value;
      render();
    });
  });
}

function setupDefaults() {
  const today = new Date().toISOString().slice(0, 10);
  [
    elements.estimateForm.elements.issueDate,
    elements.projectForm.elements.startDate,
    elements.assignmentForm.elements.assignedAt,
    elements.laborForm.elements.workStartDate,
    elements.receiptForm.elements.receivedAt,
    elements.materialForm.elements.purchasedAt,
    elements.overheadForm.elements.spentAt,
  ].forEach((input) => {
    if (input && !input.value) {
      input.value = today;
    }
  });
  if (!elements.weekStartDate.value) {
    elements.weekStartDate.value = getCurrentWeekStart();
  }
  if (!elements.globalReferenceDate.value) {
    elements.globalReferenceDate.value = today;
  }
  updateCalculatedLaborAmount();
  updateCalculatedMaterialCost();
}

/* ══════════════════════════════════════════
   COMPANY SETTINGS
═══════════════════════════════════════════ */
const settingsForm = document.querySelector("#settings-form");
const settingsPreview = document.querySelector("#settings-preview");
const settingsPreviewLogo = document.querySelector("#settings-preview-logo");
const settingsPreviewInitials = document.querySelector("#settings-preview-initials");
const settingsPreviewName = document.querySelector("#settings-preview-name");
const settingsPreviewResponsible = document.querySelector("#settings-preview-responsible");
const settingsPreviewContact = document.querySelector("#settings-preview-contact");
const settingsPreviewAddress = document.querySelector("#settings-preview-address");

function updateSettingsPreview() {
  const data = formDataToJson(settingsForm);
  const hasAny = data.company_name || data.logo_url;
  settingsPreview.style.display = hasAny ? "block" : "none";

  if (data.logo_url) {
    settingsPreviewLogo.src = data.logo_url;
    settingsPreviewLogo.style.display = "block";
    settingsPreviewInitials.style.display = "none";
  } else if (data.company_name) {
    const initials = data.company_name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
    settingsPreviewInitials.textContent = initials;
    settingsPreviewInitials.style.display = "flex";
    settingsPreviewLogo.style.display = "none";
  } else {
    settingsPreviewLogo.style.display = "none";
    settingsPreviewInitials.style.display = "none";
  }

  settingsPreviewName.textContent = data.company_name || "";
  settingsPreviewResponsible.textContent = data.responsible_name ? `Resp: ${data.responsible_name}` : "";

  const contact = [data.phone, data.email, data.website].filter(Boolean).join(" · ");
  settingsPreviewContact.textContent = contact;
  settingsPreviewAddress.textContent = data.address || "";
}

function applySettingsToEstimateForm(settings) {
  const ef = elements.estimateForm.elements;
  if (!ef.businessName.value && settings.company_name) ef.businessName.value = settings.company_name;
  if (!ef.businessLogoUrl.value && settings.logo_url) ef.businessLogoUrl.value = settings.logo_url;
}

async function loadSettings() {
  const settings = await api("/api/settings");
  state.companySettings = settings;
  const fields = ["company_name", "responsible_name", "phone", "email", "website", "address", "logo_url", "notes"];
  fields.forEach((field) => {
    const el = settingsForm.elements[field];
    if (el) el.value = settings[field] || "";
  });
  updateSettingsPreview();
  applySettingsToEstimateForm(settings);
  return settings;
}

function setupSettings() {
  settingsForm.addEventListener("input", updateSettingsPreview);

  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formDataToJson(settingsForm);
    try {
      const settings = await api("/api/settings", { method: "PUT", body: JSON.stringify(payload) });
      state.companySettings = settings;
      applySettingsToEstimateForm(settings);
      updateSettingsPreview();
      showToast("Settings saved successfully.", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function bootstrap() {
  setupNavigation();
  setupDefaults();
  setupForms();
  setupSlideOver();
  setupSettings();
  renderEstimateItemsEditor();
  renderEstimatePreview();

  try {
    await refreshAll();
    await loadSettings();
  } catch (error) {
    showToast(error.message, "error");
  }
}

/* ══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
function showToast(message, type = "info") {
  const icons = { success: "✓", error: "✕", info: "i" };
  const container = document.querySelector("#toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] ?? "i"}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3200);
}

/* ══════════════════════════════════════════
   CONFIRM MODAL
═══════════════════════════════════════════ */
let _confirmResolve = null;

function showConfirm(title, message) {
  return new Promise((resolve) => {
    _confirmResolve = resolve;
    document.querySelector("#confirm-title").textContent = title;
    document.querySelector("#confirm-message").textContent = message;
    document.querySelector("#confirm-overlay").classList.add("active");
  });
}

document.querySelector("#confirm-ok").addEventListener("click", () => {
  document.querySelector("#confirm-overlay").classList.remove("active");
  _confirmResolve?.(true);
  _confirmResolve = null;
});

document.querySelector("#confirm-cancel").addEventListener("click", () => {
  document.querySelector("#confirm-overlay").classList.remove("active");
  _confirmResolve?.(false);
  _confirmResolve = null;
});

/* ══════════════════════════════════════════
   SLIDE-OVER
═══════════════════════════════════════════ */
const _slide = {
  panel: document.querySelector("#slide-over"),
  body: document.querySelector("#slide-over-body"),
  titleEl: document.querySelector("#slide-over-title"),
  tagEl: document.querySelector("#slide-over-tag"),
  backdrop: document.querySelector("#slide-backdrop"),
  closeBtn: document.querySelector("#slide-over-close"),
  origParent: null,
  origNext: null,
};

function openSlideOver(panelEl, title, tag = "") {
  if (!panelEl) return;
  _slide.origParent = panelEl.parentElement;
  _slide.origNext = panelEl.nextElementSibling;
  _slide.titleEl.textContent = title;
  _slide.tagEl.textContent = tag;
  _slide.body.appendChild(panelEl);
  document.body.classList.add("slide-open");
  setTimeout(() => panelEl.querySelector("input:not([type=hidden]),select,textarea")?.focus(), 350);
}

function closeSlideOver() {
  if (!_slide.origParent || !_slide.body.firstElementChild) return;
  const el = _slide.body.firstElementChild;
  if (_slide.origNext) {
    _slide.origParent.insertBefore(el, _slide.origNext);
  } else {
    _slide.origParent.appendChild(el);
  }
  document.body.classList.remove("slide-open");
  _slide.origParent = null;
  _slide.origNext = null;
}

_slide.closeBtn.addEventListener("click", closeSlideOver);
_slide.backdrop.addEventListener("click", closeSlideOver);

function setupSlideOver() {
  const map = [
    ["#btn-new-project",  "#fpanel-project",  "New Project",         "Registration", resetProjectForm],
    ["#btn-new-employee", "#fpanel-employee",  "New Employee",        "Team",         resetEmployeeForm],
    ["#btn-new-client",   "#fpanel-client",   "New Client",          "Clients",      resetClientForm],
    ["#btn-new-forecast", "#fpanel-forecast",  "New Forecast",        "Planning",     resetForecastForm],
    ["#btn-new-extras",   "#fpanel-extras",    "New Extra Expense",   "Control",      resetOverheadForm],
  ];

  // "Cadastrar novo cliente" link inside estimate form → navigate to clients section
  document.querySelector("#btn-goto-clients")?.addEventListener("click", () => {
    const estimatesBtn = document.querySelector('[data-section="estimates"]');
    if (estimatesBtn) estimatesBtn.click();
    const clientesTab = document.querySelector('[data-tab="estimates-clientes"]');
    if (clientesTab) clientesTab.click();
  });
  map.forEach(([btnSel, panelSel, title, tag, resetFn]) => {
    document.querySelector(btnSel)?.addEventListener("click", () => {
      resetFn();
      openSlideOver(document.querySelector(panelSel), title, tag);
    });
  });
}

/* ══════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════ */
async function loadNotifications() {
  try {
    const notifications = await api("/api/notifications");
    const unread = notifications.filter((n) => !n.read);
    const badge = document.querySelector("#notifications-badge");
    if (badge) {
      badge.textContent = unread.length || "";
      badge.style.display = unread.length ? "block" : "none";
    }

    const list = document.querySelector("#notifications-list");
    if (!list) return;

    if (!notifications.length) {
      list.innerHTML = '<p style="padding:24px;text-align:center;color:var(--muted);font-size:0.85rem;">No notifications yet.</p>';
      return;
    }

    list.innerHTML = notifications.map((n) => `
      <div data-notif-id="${n.id}" style="padding:14px 18px;border-bottom:1px solid var(--line);background:${n.read ? "#fff" : "#f0f9f6"};cursor:pointer;" onclick="markNotificationRead(${n.id}, this)">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">
          <strong style="font-size:0.85rem;color:${n.read ? "var(--ink)" : "var(--primary)"};">${n.title}</strong>
          ${!n.read ? '<span style="width:8px;height:8px;background:var(--primary);border-radius:50%;flex-shrink:0;margin-top:4px;display:block;"></span>' : ""}
        </div>
        <p style="font-size:0.78rem;color:var(--muted);margin:4px 0 0;line-height:1.5;">${n.body}</p>
        <p style="font-size:0.72rem;color:var(--muted);margin:4px 0 0;">${new Date(n.created_at).toLocaleString("en-US")}</p>
      </div>
    `).join("");
  } catch (_) {}
}

async function markNotificationRead(id, el) {
  await api(`/api/notifications/${id}/read`, { method: "PATCH" }).catch(() => {});
  if (el) el.style.background = "#fff";
  const dot = el?.querySelector("span[style*='border-radius:50%']");
  if (dot) dot.remove();
  loadNotifications();
}

function setupNotifications() {
  const bell = document.querySelector("#notifications-bell");
  const panel = document.querySelector("#notifications-panel");
  if (!bell || !panel) return;

  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = panel.style.display === "flex";
    panel.style.display = isOpen ? "none" : "flex";
    if (!isOpen) loadNotifications();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== bell) {
      panel.style.display = "none";
    }
  });

  document.querySelector("#notifications-mark-all")?.addEventListener("click", async () => {
    const items = document.querySelectorAll("[data-notif-id]");
    for (const item of items) {
      await api(`/api/notifications/${item.dataset.notifId}/read`, { method: "PATCH" }).catch(() => {});
    }
    loadNotifications();
  });

  loadNotifications();
  setInterval(loadNotifications, 30000);
}

bootstrap();
setupNotifications();
