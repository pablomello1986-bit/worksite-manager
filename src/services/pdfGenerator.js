const PDFDocument = require("pdfkit");

async function fetchImageBuffer(url) {
  if (!url) return null;
  try {
    if (url.startsWith("data:")) {
      const base64Data = url.split(",")[1];
      if (!base64Data) return null;
      return Buffer.from(base64Data, "base64");
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

async function generateEstimatePDF(estimate) {
  const logoBuffer = await fetchImageBuffer(estimate.businessLogoUrl);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primary = "#1a5446";
    const muted = "#6b7280";
    const light = "#f3f4f6";

    const headerH = logoBuffer ? 110 : 90;

    // Header background
    doc.rect(0, 0, doc.page.width, headerH).fill(primary);

    // Logo — right side of header
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, doc.page.width - 120, 15, { fit: [80, 80] });
      } catch {}
    }

    // Header text
    doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold")
      .text(estimate.businessName || "Orcamento", 50, 22);
    doc.fontSize(10).font("Helvetica")
      .text(`Orcamento No ${estimate.estimateNumber || estimate.id}`, 50, 52)
      .text(`Data: ${formatDate(estimate.issueDate)}`, 50, 65);

    if (estimate.validUntil) {
      doc.text(`Valido ate: ${formatDate(estimate.validUntil)}`, 300, 65);
    }

    doc.fillColor(primary);

    // Client & Company info
    doc.y = headerH + 20;
    const colW = 240;

    doc.fontSize(8).font("Helvetica-Bold").fillColor(muted)
      .text("CLIENTE", 50, doc.y, { width: colW });
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#111827")
      .text(estimate.clientName || "—", 50, doc.y, { width: colW });
    if (estimate.clientCompanyName) {
      doc.fontSize(9).font("Helvetica").fillColor(muted)
        .text(estimate.clientCompanyName, 50, doc.y, { width: colW });
    }
    if (estimate.clientEmail) {
      doc.fontSize(9).fillColor(muted)
        .text(estimate.clientEmail, 50, doc.y, { width: colW });
    }
    if (estimate.clientPhone) {
      doc.fontSize(9).fillColor(muted)
        .text(estimate.clientPhone, 50, doc.y, { width: colW });
    }

    // Work title
    const titleY = headerH + 20;
    doc.fontSize(8).font("Helvetica-Bold").fillColor(muted)
      .text("TITULO DO TRABALHO", 310, titleY, { width: colW });
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#111827")
      .text(estimate.workTitle || "—", 310, titleY + 14, { width: colW });

    if (estimate.description) {
      doc.fontSize(9).font("Helvetica").fillColor(muted)
        .text(estimate.description, 310, doc.y + 4, { width: colW });
    }

    // Divider
    const divY = Math.max(doc.y, headerH + 95) + 16;
    doc.moveTo(50, divY).lineTo(doc.page.width - 50, divY)
      .strokeColor("#e5e7eb").lineWidth(1).stroke();

    // Items table header
    const tableY = divY + 14;
    doc.rect(50, tableY, doc.page.width - 100, 22).fill(light);

    const cols = { desc: 50, qty: 310, price: 380, total: 460 };
    doc.fontSize(8).font("Helvetica-Bold").fillColor(muted);
    doc.text("DESCRICAO", cols.desc + 6, tableY + 7, { width: 250 });
    doc.text("QTD", cols.qty, tableY + 7, { width: 60, align: "right" });
    doc.text("PRECO UNIT.", cols.price, tableY + 7, { width: 70, align: "right" });
    doc.text("TOTAL", cols.total, tableY + 7, { width: 80, align: "right" });

    let rowY = tableY + 24;
    const items = estimate.items || [];
    items.forEach((item, i) => {
      if (rowY > doc.page.height - 140) {
        doc.addPage();
        rowY = 50;
      }
      if (i % 2 === 0) {
        doc.rect(50, rowY - 3, doc.page.width - 100, 20).fill("#fafafa");
      }
      doc.fontSize(9).font("Helvetica").fillColor("#111827");
      doc.text(item.description || "", cols.desc + 6, rowY, { width: 250 });
      doc.text(String(item.quantity || 0), cols.qty, rowY, { width: 60, align: "right" });
      doc.text(formatCurrency(item.unitPrice), cols.price, rowY, { width: 70, align: "right" });
      doc.fillColor(primary).font("Helvetica-Bold")
        .text(formatCurrency(item.lineTotal), cols.total, rowY, { width: 80, align: "right" });
      rowY += 20;
    });

    // Totals
    if (rowY > doc.page.height - 100) { doc.addPage(); rowY = 50; }
    rowY += 10;
    doc.moveTo(50, rowY).lineTo(doc.page.width - 50, rowY)
      .strokeColor("#e5e7eb").lineWidth(1).stroke();
    rowY += 12;

    const totals = [
      ["Subtotal", formatCurrency(estimate.subtotal), false],
      estimate.discountAmount > 0 ? [`Desconto`, `- ${formatCurrency(estimate.discountAmount)}`, false] : null,
      estimate.taxAmount > 0 ? [`Taxa (${estimate.taxPercent || 0}%)`, formatCurrency(estimate.taxAmount), false] : null,
      ["TOTAL", formatCurrency(estimate.totalAmount), true],
    ].filter(Boolean);

    totals.forEach(([label, value, bold]) => {
      doc.fontSize(bold ? 12 : 9)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fillColor(bold ? primary : muted)
        .text(label, 350, rowY, { width: 100 })
        .fillColor(bold ? primary : "#111827")
        .text(value, 460, rowY, { width: 80, align: "right" });
      rowY += bold ? 18 : 15;
    });

    // Notes
    if (estimate.notes) {
      rowY += 16;
      doc.fontSize(8).font("Helvetica-Bold").fillColor(muted).text("OBSERVACOES", 50, rowY);
      rowY += 12;
      doc.fontSize(9).font("Helvetica").fillColor("#374151").text(estimate.notes, 50, rowY, { width: 500 });
    }

    // Footer
    const footY = doc.page.height - 50;
    doc.rect(0, footY - 10, doc.page.width, 60).fill(light);
    doc.fontSize(8).font("Helvetica").fillColor(muted)
      .text("Este orcamento foi gerado pelo WorkSite Manager.", 50, footY, { align: "center", width: doc.page.width - 100 });

    doc.end();
  });
}

module.exports = { generateEstimatePDF };
