import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportResponse } from "./types";

/* ── Professional navy colour palette ── */
const NAVY: [number, number, number] = [15, 23, 42];
const NAVY_MID: [number, number, number] = [30, 41, 59];
const ACCENT: [number, number, number] = [232, 88, 26]; // brand orange for subtle highlights
const GRAY: [number, number, number] = [100, 116, 139];
const LIGHT_BG: [number, number, number] = [248, 250, 252];
const WHITE: [number, number, number] = [255, 255, 255];

/* ── Load logo from /logo.png with aspect ratio ── */
type LogoData = { dataUrl: string; aspect: number };

function loadLogo(): Promise<LogoData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const scale = Math.min(1, 400 / img.naturalWidth);
      c.width = img.naturalWidth * scale;
      c.height = img.naturalHeight * scale;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve({
        dataUrl: c.toDataURL("image/png"),
        aspect: img.naturalWidth / img.naturalHeight,
      });
    };
    img.onerror = () => reject(new Error("Logo load failed"));
    img.src = "/logo.png";
  });
}

/* ── Date formatting (ASCII-safe, no unicode arrows) ── */
function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function fmtDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const AGENCY_TITLES: Record<string, string> = {
  CBN: "CBN Fraud Incident Report",
  NCC: "NCC Incident Disclosure Report",
  GENERAL: "Internal Summary Report",
};

/* ══════════════════════════════════════════════════════
   MAIN EXPORT - generates + downloads a professional PDF
   ══════════════════════════════════════════════════════ */
export async function generateReportPDF(report: ReportResponse): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PW = 210;
  const PH = 297;
  const M = 18;
  const CW = PW - M * 2;

  let y = 0;

  /* ── Load logo ── */
  let logoData: LogoData | null = null;
  try {
    logoData = await loadLogo();
  } catch {
    /* continue without logo */
  }

  const reportTitle = AGENCY_TITLES[report.agencyType] || "Threat Intelligence Report";

  /* ── Draw page header ── */
  function drawHeader(): number {
    // Navy bar at top
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PW, 22, "F");
    doc.setFillColor(...NAVY_MID);
    doc.rect(0, 19, PW, 3, "F");

    // Logo — proportional, vertically centered in the 22mm bar
    let textX = M;
    if (logoData) {
      try {
        const logoH = 8;
        const logoW = logoH * logoData.aspect;
        const logoY = (22 - logoH) / 2; // center vertically
        doc.addImage(logoData.dataUrl, "PNG", M, logoY, logoW, logoH);
        textX = M + logoW + 4;
      } catch {
        /* skip */
      }
    }

    // NaijaShield title — vertically centered alongside logo
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text("NaijaShield", textX, 10.5);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 200, 220);
    doc.text("Fraud Intelligence Platform", textX, 15);

    // Thin orange accent line
    doc.setFillColor(...ACCENT);
    doc.rect(0, 22, PW, 0.7, "F");

    return 28;
  }

  /* ── Page footer (applied at end) ── */
  function drawFooter(page: number, total: number) {
    // Thin line
    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(0.15);
    doc.line(M, PH - 14, PW - M, PH - 14);

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text("CONFIDENTIAL - " + (report.complianceMetadata?.classification ?? "INTERNAL"), M, PH - 9);
    doc.text(report.id ?? "", PW / 2, PH - 9, { align: "center" });
    doc.text("Page " + page + " of " + total, PW - M, PH - 9, { align: "right" });
  }

  /* ── Ensure space or new page ── */
  function ensureSpace(need: number) {
    if (y + need > PH - 22) {
      doc.addPage();
      y = drawHeader();
    }
  }

  /* ── Section heading ── */
  function section(title: string) {
    ensureSpace(16);

    // Navy pill behind the title
    doc.setFillColor(...NAVY);
    doc.roundedRect(M, y - 1, CW, 8, 1, 1, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(title.toUpperCase(), M + 4, y + 4.5);
    y += 11;
  }

  /* ── Metadata row ── */
  function metaRow(label: string, value: string) {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRAY);
    doc.text(label, M + 4, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...NAVY);
    doc.text(value, M + 45, y);
    y += 5.5;
  }

  /* ═══════════════════════════════════
     PAGE 1 - Cover + Executive Summary
     ═══════════════════════════════════ */
  y = drawHeader();

  // Report title banner (navy rounded rect)
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(M, y, CW, 14, 2, 2, "F");
  doc.setDrawColor(200, 210, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 14, 2, 2, "S");

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(reportTitle, PW / 2, y + 9, { align: "center" });
  y += 20;

  // Metadata block
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(M, y, CW, 35, 1.5, 1.5, "F");
  y += 6;
  metaRow("Report ID", report.id ?? "N/A");
  metaRow("Generated", fmtDate(report.generatedAt ?? ""));
  metaRow("Period", fmtDate(report.periodFrom ?? "") + "  to  " + fmtDate(report.periodTo ?? ""));
  metaRow("Generated By", report.generatedBy ?? "N/A");
  metaRow("Organisation", report.complianceMetadata?.reportingEntity ?? "NaijaShield Platform");
  y += 5;

  // Executive Summary
  section("Executive Summary");

  const s = report.summary;
  const kpis = [
    { label: "Total Incidents", value: String(s?.totalIncidents ?? 0) },
    { label: "Blocked", value: String(s?.blocked ?? 0) },
    { label: "Monitoring", value: String(s?.monitoring ?? 0) },
    { label: "Allowed", value: String(s?.allowed ?? 0) },
    { label: "Avg Risk", value: (s?.averageRiskScore ?? 0) + "/100" },
    { label: "Interventions", value: String(s?.interventionsTriggered ?? 0) },
  ];

  const boxW = (CW - 5 * 3) / 6;
  kpis.forEach((kpi, i) => {
    const bx = M + i * (boxW + 3);

    // White card with border
    doc.setFillColor(...WHITE);
    doc.roundedRect(bx, y, boxW, 20, 1, 1, "F");
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.2);
    doc.roundedRect(bx, y, boxW, 20, 1, 1, "S");

    // Navy top accent
    doc.setFillColor(...NAVY);
    doc.rect(bx + 0.5, y, boxW - 1, 1.5, "F");

    // Value
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(kpi.value, bx + boxW / 2, y + 10, { align: "center" });

    // Label
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(kpi.label, bx + boxW / 2, y + 16, { align: "center" });
  });
  y += 26;

  /* ═══════════════════════════════════
     Classification Breakdown
     ═══════════════════════════════════ */
  const totalInc = s?.totalIncidents || 1;

  if (report.byClassification && report.byClassification.length > 0) {
    section("Classification Breakdown");
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["Classification", "Count", "Share"]],
      body: report.byClassification.map((c) => {
        const pct =
          c.percentage != null
            ? c.percentage
            : totalInc > 0
            ? (c.count / totalInc) * 100
            : 0;
        return [c.classification ?? "", String(c.count ?? 0), pct.toFixed(1) + "%"];
      }),
      headStyles: {
        fillColor: [...NAVY],
        textColor: [...WHITE],
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 50] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3, lineColor: [220, 225, 230], lineWidth: 0.15 },
      theme: "grid",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  /* ═══════════════════════════════════
     Channel Distribution
     ═══════════════════════════════════ */
  if (report.byChannel && report.byChannel.length > 0) {
    section("Channel Distribution");
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["Channel", "Count", "Share"]],
      body: report.byChannel.map((c) => {
        const pct =
          c.percentage != null
            ? c.percentage
            : totalInc > 0
            ? (c.count / totalInc) * 100
            : 0;
        return [c.channel ?? "", String(c.count ?? 0), pct.toFixed(1) + "%"];
      }),
      headStyles: {
        fillColor: [...NAVY],
        textColor: [...WHITE],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 50] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3, lineColor: [220, 225, 230], lineWidth: 0.15 },
      theme: "grid",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  /* ═══════════════════════════════════
     Geographic Distribution
     ═══════════════════════════════════ */
  if (report.byState && report.byState.length > 0) {
    section("Geographic Distribution");
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["State", "Incidents"]],
      body: report.byState.slice(0, 15).map((st) => [st.state ?? "", String(st.count ?? 0)]),
      headStyles: {
        fillColor: [...NAVY],
        textColor: [...WHITE],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 50] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3, lineColor: [220, 225, 230], lineWidth: 0.15 },
      theme: "grid",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  /* ═══════════════════════════════════
     Incident Details
     ═══════════════════════════════════ */
  if (report.topIncidents && report.topIncidents.length > 0) {
    ensureSpace(30);
    section("Incident Details");
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["ID", "Time", "Channel", "Risk", "Status", "Explanation"]],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: report.topIncidents.map((inc: any) => {
        const expl = inc.explanation ?? inc.preview ?? inc.description ?? "";
        return [
          inc.id ?? "",
          fmtDateShort(inc.timestamp ?? ""),
          inc.channel ?? "",
          String(inc.riskScore ?? inc.risk ?? 0),
          inc.status ?? "",
          expl.length > 90 ? expl.slice(0, 87) + "..." : expl,
        ];
      }),
      headStyles: {
        fillColor: [...NAVY],
        textColor: [...WHITE],
        fontSize: 7,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 6.5, textColor: [40, 40, 50] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 20 },
        2: { cellWidth: 14 },
        3: { cellWidth: 10, halign: "center" },
        4: { cellWidth: 16 },
        5: { cellWidth: "auto" },
      },
      styles: {
        cellPadding: 2,
        overflow: "linebreak",
        lineColor: [220, 225, 230],
        lineWidth: 0.15,
      },
      theme: "grid",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  /* ═══════════════════════════════════
     Narrative Analysis
     ═══════════════════════════════════ */
  if (report.narrative) {
    ensureSpace(20);
    section("Narrative Analysis");

    // Convert all ISO date strings to readable format
    const readableNarrative = report.narrative.replace(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2}|Z)/g,
      (match) => {
        try {
          return new Date(match).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        } catch {
          return match;
        }
      }
    );

    const paragraphs = readableNarrative.split(/\n\n+/);
    doc.setFontSize(8);

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Detect section headers (e.g. "1.0 Executive Summary" or ALL CAPS lines)
      const isHeader =
        /^\d+\.\d+\s/.test(trimmed) || trimmed === trimmed.toUpperCase();

      if (isHeader) {
        ensureSpace(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...NAVY);
        const headerLines = doc.splitTextToSize(trimmed, CW - 4);
        doc.text(headerLines, M, y);
        y += headerLines.length * 4 + 3;
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 55, 65);
        const lines: string[] = doc.splitTextToSize(trimmed, CW - 4);

        for (let i = 0; i < lines.length; i++) {
          if (y > PH - 22) {
            doc.addPage();
            y = drawHeader();
          }
          doc.text(lines[i], M, y);
          y += 3.8;
        }
        y += 2;
      }
    }
  }

  /* ═══════════════════════════════════
     Compliance Information
     ═══════════════════════════════════ */
  if (report.complianceMetadata) {
    ensureSpace(40);
    section("Compliance Information");

    const cm = report.complianceMetadata;
    const entries = [
      ["Framework", cm.framework],
      ["Data Protection", cm.dataProtection],
      ["Report Version", cm.reportVersion],
      ["Classification", cm.classification],
      ["Reporting Entity", cm.reportingEntity],
    ];

    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(M, y, CW, entries.length * 6 + 6, 1.5, 1.5, "F");
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.2);
    doc.roundedRect(M, y, CW, entries.length * 6 + 6, 1.5, 1.5, "S");
    y += 5;

    for (const [label, value] of entries) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRAY);
      doc.text(label + ":", M + 5, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...NAVY);
      doc.text(value ?? "", M + 52, y);
      y += 6;
    }
  }

  /* ═══════════════════════════════════
     Apply footers to all pages
     ═══════════════════════════════════ */
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p, totalPages);
  }

  /* ── Save / Download ── */
  const dateStr = fmtDateShort(report.generatedAt ?? "").replace(/[\s,]+/g, "-");
  doc.save("NaijaShield-" + report.agencyType + "-" + (report.id ?? "report") + "-" + dateStr + ".pdf");
}
