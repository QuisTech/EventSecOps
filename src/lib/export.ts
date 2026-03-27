import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { scheduleData } from '../data';

export const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text("Staff Schedule", 14, 15);
  autoTable(doc, {
    startY: 20,
    head: [['Date', 'Shift', 'Location', 'Manager', 'Staff']],
    body: scheduleData.map(row => [row.date, row.shift, row.location, row.manager, row.staff]),
  });
  doc.save('schedule.pdf');
};

export const exportReportsToPDF = (reports: any[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Surveillance Report Summary", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  
  autoTable(doc, {
    startY: 35,
    head: [['Type', 'Who', 'What', 'When', 'Where', 'Why', 'How']],
    body: reports.map(r => [r.reportType, r.who, r.what, new Date(r.when).toLocaleString(), r.where, r.why, r.how]),
    theme: 'grid',
    headStyles: { fillColor: [39, 39, 42] }, // Zinc-900
    styles: { fontSize: 8, cellPadding: 2 },
  });
  doc.save('surveillance_reports.pdf');
};

export const exportToWord = async () => {
  const tableRows = scheduleData.map(row => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph(row.date)] }),
      new TableCell({ children: [new Paragraph(row.shift)] }),
      new TableCell({ children: [new Paragraph(row.location)] }),
      new TableCell({ children: [new Paragraph(row.manager)] }),
      new TableCell({ children: [new Paragraph(row.staff)] }),
    ],
  }));

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: "Staff Schedule", heading: "Heading1" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: ['Date', 'Shift', 'Location', 'Manager', 'Staff'].map(h => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })),
            }),
            ...tableRows
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'schedule.docx');
};

export const exportReportsToWord = async (reports: any[]) => {
  const tableRows = reports.map(r => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph(r.reportType)] }),
      new TableCell({ children: [new Paragraph(r.who)] }),
      new TableCell({ children: [new Paragraph(r.what)] }),
      new TableCell({ children: [new Paragraph(new Date(r.when).toLocaleString())] }),
      new TableCell({ children: [new Paragraph(r.where)] }),
      new TableCell({ children: [new Paragraph(r.why)] }),
      new TableCell({ children: [new Paragraph(r.how)] }),
    ],
  }));

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: "Surveillance Report Summary", heading: "Heading1" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: ['Type', 'Who', 'What', 'When', 'Where', 'Why', 'How'].map(h => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })),
            }),
            ...tableRows
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'surveillance_reports.docx');
};

// ==================== COMBINED SECURITY REPORT PDF ====================
export const exportReportTemplateToPDF = () => {
  const doc = new jsPDF();

  // Helper to add an interactive text field
  const addTextField = (fieldName: string, x: number, y: number, w: number, h: number, multiline = false) => {
    const tf = new (doc as any).AcroFormTextField();
    tf.Rect = [x, y, w, h];
    tf.fieldName = fieldName;
    tf.value = '';
    tf.defaultValue = '';
    tf.multiline = multiline;
    tf.fontSize = 9;
    doc.addField(tf);
    doc.setDrawColor(160);
    doc.rect(x, y, w, h);
    doc.setDrawColor(0);
  };

  // Helper to draw a label
  const drawLabel = (text: string, x: number, y: number, size = 10) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.text(text, x, y);
    doc.setFont('helvetica', 'normal');
  };

  // ───── DOCUMENT HEADER ─────
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("SECURITY SURVEILLANCE REPORT", 105, 15, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("CONFIDENTIAL — For Internal Use Only", 105, 21, { align: 'center' });
  doc.setDrawColor(39, 39, 42);
  doc.setLineWidth(0.5);
  doc.line(14, 24, 196, 24);
  doc.setLineWidth(0.2);

  // ───── SECURITY REPORT TEMPLATE (5W1H) ─────
  let y = 30;
  drawLabel("Security Report Template", 14, y, 13);
  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text("Please fill out the details below.", 14, y);
  doc.setFont('helvetica', 'normal');
  y += 6;

  const reportFields = [
    { label: 'Report Type (Activity / Incident)', fieldName: 'report_type' },
    { label: 'Who (Involved)', fieldName: 'who_involved' },
    { label: 'What (Incident/Activity)', fieldName: 'what_incident' },
    { label: 'When (Timestamp)', fieldName: 'when_timestamp' },
    { label: 'Where (Zone/Location)', fieldName: 'where_location' },
    { label: 'Latitude', fieldName: 'latitude' },
    { label: 'Longitude', fieldName: 'longitude' },
    { label: 'Why (Context)', fieldName: 'why_context' },
    { label: 'How (Methodology)', fieldName: 'how_method' },
  ];

  reportFields.forEach(field => {
    drawLabel(field.label + ':', 14, y, 10);
    addTextField(field.fieldName, 14, y + 2, 182, 10);
    y += 16;
  });

  y += 4;

  // ═══════════════════════════════════════════════════
  // PAGE 2 — SECTION A + B (OFFICER DETAILS + ACTIVITY)
  // ═══════════════════════════════════════════════════
  doc.addPage();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("SECURITY SURVEILLANCE REPORT", 105, 15, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("CONFIDENTIAL — For Internal Use Only", 105, 21, { align: 'center' });
  doc.setDrawColor(39, 39, 42);
  doc.setLineWidth(0.5);
  doc.line(14, 24, 196, 24);
  doc.setLineWidth(0.2);

  y = 30;
  drawLabel("SECTION A — OFFICER DETAILS", 14, y, 12);
  y += 8;

  const officerFields = [
    ['Officer Name', 'officer_name', 14, 90],
    ['Badge / ID No.', 'officer_badge', 105, 90],
    ['Date', 'report_date', 14, 42],
    ['Shift (Day / Night / Swing)', 'shift_type', 61, 42],
    ['Post / Zone Assignment', 'post_zone', 108, 86],
  ];

  // Row 1: Officer Name (half) | Badge/ID (half)
  drawLabel('Officer Name:', 14, y);
  addTextField('officer_name', 14, y + 2, 86, 10);
  drawLabel('Badge / ID No.:', 105, y);
  addTextField('officer_badge', 105, y + 2, 91, 10);
  y += 18;

  // Row 2: Date | Shift | Post
  drawLabel('Date:', 14, y);
  addTextField('report_date', 14, y + 2, 40, 10);
  drawLabel('Shift:', 60, y);
  addTextField('shift_type', 60, y + 2, 40, 10);
  drawLabel('Post / Zone:', 106, y);
  addTextField('post_zone', 106, y + 2, 90, 10);
  y += 18;

  // Supervisor
  drawLabel('Supervisor on Duty:', 14, y);
  addTextField('supervisor', 14, y + 2, 86, 10);
  drawLabel('Contact No.:', 105, y);
  addTextField('contact_no', 105, y + 2, 91, 10);
  y += 20;

  // ═══════════════════════════════════════════════════
  // SECTION B — ACTIVITY REPORT
  // ═══════════════════════════════════════════════════
  doc.setDrawColor(39, 39, 42);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  doc.setLineWidth(0.2);
  y += 7;
  drawLabel("SECTION B — DAILY ACTIVITY REPORT", 14, y, 12);
  y += 8;

  // Duty Summary
  drawLabel('Duty Summary / Briefing Notes:', 14, y);
  addTextField('duty_summary', 14, y + 3, 182, 20, true);
  y += 28;

  // Patrol / Activity Log — interactive table
  drawLabel('Patrol & Activity Log:', 14, y);
  y += 5;

  // Table header
  const colWidths = [25, 40, 70, 47]; // Time, Area, Observations, Action
  const colHeaders = ['Time', 'Area / Zone Patrolled', 'Observations & Findings', 'Action Taken'];
  const rowHeight = 18;
  let xPos = 14;

  // Draw header row
  doc.setFillColor(39, 39, 42);
  doc.rect(14, y, 182, 10, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  xPos = 14;
  colHeaders.forEach((header, i) => {
    doc.text(header, xPos + 2, y + 7);
    xPos += colWidths[i];
  });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 10;

  // Draw data row with interactive fields
  xPos = 14;
  colWidths.forEach((w, i) => {
    doc.setDrawColor(160);
    doc.rect(xPos, y, w, rowHeight);
    doc.setDrawColor(0);
    addTextField(`patrol_row1_col${i}`, xPos + 1, y + 1, w - 2, rowHeight - 2, true);
    xPos += w;
  });
  y += rowHeight + 6;


  // Equipment / Asset Check
  drawLabel('Equipment & Asset Status:', 14, y);
  addTextField('equipment_status', 14, y + 3, 182, 15, true);
  y += 24;

  // End of Shift Remark
  drawLabel('End of Shift Remarks:', 14, y);
  addTextField('eod_remarks', 14, y + 3, 182, 18, true);
  y += 26;

  // Signature block for Activity
  doc.setFontSize(9);
  doc.text("Officer Signature: ____________________", 14, y + 2);
  doc.text("Supervisor Signature: ____________________", 110, y + 2);
  y += 10;
  doc.text("Date / Time: ____________________", 14, y);
  doc.text("Date / Time: ____________________", 110, y);

  // ═══════════════════════════════════════════════════
  // PAGE 2 — SECTION C — INCIDENT REPORT
  // ═══════════════════════════════════════════════════
  doc.addPage();
  let y2 = 15;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("SECURITY SURVEILLANCE REPORT", 105, y2, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("CONFIDENTIAL — For Internal Use Only", 105, y2 + 6, { align: 'center' });
  doc.setDrawColor(39, 39, 42);
  doc.setLineWidth(0.5);
  doc.line(14, y2 + 9, 196, y2 + 9);
  doc.setLineWidth(0.2);
  y2 += 16;

  drawLabel("SECTION C — INCIDENT REPORT", 14, y2, 12);
  y2 += 8;

  // Incident Details
  drawLabel('Incident Reference No.:', 14, y2);
  addTextField('inc_ref_no', 14, y2 + 2, 86, 10);
  drawLabel('Severity (Low / Medium / High / Critical):', 105, y2);
  addTextField('inc_severity', 105, y2 + 2, 91, 10);
  y2 += 18;

  drawLabel('Date & Time of Incident:', 14, y2);
  addTextField('inc_datetime', 14, y2 + 2, 86, 10);
  drawLabel('Location / Zone:', 105, y2);
  addTextField('inc_location', 105, y2 + 2, 91, 10);
  y2 += 18;

  drawLabel('Type of Incident:', 14, y2);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text("(Theft / Intrusion / Vandalism / Assault / Fire / Medical / Suspicious Activity / Other)", 50, y2);
  doc.setFont('helvetica', 'normal');
  addTextField('inc_type', 14, y2 + 2, 182, 10);
  y2 += 18;

  // Persons Involved
  drawLabel('Person(s) Involved / Witnesses:', 14, y2);
  addTextField('inc_persons', 14, y2 + 3, 182, 18, true);
  y2 += 26;

  // Incident Narrative
  drawLabel('Incident Narrative (detailed description):', 14, y2);
  addTextField('inc_narrative', 14, y2 + 3, 182, 30, true);
  y2 += 38;

  // Evidence & Exhibits
  drawLabel('Evidence / Exhibits Collected:', 14, y2);
  addTextField('inc_evidence', 14, y2 + 3, 182, 15, true);
  y2 += 24;

  // Immediate Action Taken
  drawLabel('Immediate Action Taken:', 14, y2);
  addTextField('inc_action', 14, y2 + 3, 182, 18, true);
  y2 += 26;

  // Notifications
  drawLabel('Notifications Made:', 14, y2);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text("(Police / Fire Service / Medical / Management / Other — include time notified)", 52, y2);
  doc.setFont('helvetica', 'normal');
  addTextField('inc_notifications', 14, y2 + 3, 182, 12, true);
  y2 += 20;

  // Follow-Up Required
  drawLabel('Follow-Up Action Required:', 14, y2);
  addTextField('inc_followup', 14, y2 + 3, 182, 15, true);
  y2 += 24;

  // Signature block for Incident
  doc.setFontSize(9);
  doc.text("Reporting Officer Signature: ____________________", 14, y2);
  doc.text("Supervisor Signature: ____________________", 110, y2);
  y2 += 8;
  doc.text("Date / Time: ____________________", 14, y2);
  doc.text("Date / Time: ____________________", 110, y2);

  doc.save('security_surveillance_report.pdf');
};

// ==================== COMBINED SECURITY REPORT WORD ====================
export const exportReportTemplateToWord = async () => {
  // Helper: create a label paragraph
  const label = (text: string, heading?: "Heading1" | "Heading2") =>
    new Paragraph({
      text,
      ...(heading ? { heading } : {}),
      children: heading ? undefined : [new TextRun({ text, bold: true, size: 20 })],
      spacing: { before: heading ? 300 : 160, after: 60 },
    });

  // Helper: create an input cell (bordered, with empty lines for typing space)
  const inputCell = (lines = 2) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [new TableCell({ children: Array(lines).fill(0).map(() => new Paragraph("")) })] })],
    });

  // Helper: create a two-column field row
  const twoFieldRow = (label1: string, label2: string) => [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        children: [
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: label1, bold: true, size: 18 })] }), new Paragraph("")] }),
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: label2, bold: true, size: 18 })] }), new Paragraph("")] }),
        ]
      })],
    }),
  ];

  const doc = new Document({
    sections: [
      // ───── PAGE 1: OFFICER DETAILS + ACTIVITY REPORT ─────
      {
        children: [
          new Paragraph({ children: [new TextRun({ text: "SECURITY SURVEILLANCE REPORT", bold: true, size: 32 })], alignment: 'center' as any }),
          new Paragraph({ children: [new TextRun({ text: "CONFIDENTIAL — For Internal Use Only", italics: true, size: 16, color: '666666' })], alignment: 'center' as any, spacing: { after: 200 } }),

          // ───── Security Report Template (5W1H) ─────
          label("Security Report Template", "Heading2"),
          new Paragraph({ children: [new TextRun({ text: "Please fill out the details below.", italics: true, size: 18, color: '666666' })], spacing: { after: 100 } }),
          ...['Report Type (Activity / Incident)', 'Who (Involved)', 'What (Incident/Activity)', 'When (Timestamp)', 'Where (Zone/Location)', 'Latitude', 'Longitude', 'Why (Context)', 'How (Methodology)'].flatMap(fieldLabel => [
            new Paragraph({ children: [new TextRun({ text: fieldLabel, bold: true, size: 20 })], spacing: { before: 120, after: 40 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph(""), new Paragraph("")] })] })],
            }),
          ]),

          label("SECTION A — OFFICER DETAILS", "Heading2"),
          ...twoFieldRow("Officer Name:", "Badge / ID No.:"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [new TableRow({
              children: [
                new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Date:", bold: true, size: 18 })] }), new Paragraph("")] }),
                new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Shift (Day / Night / Swing):", bold: true, size: 18 })] }), new Paragraph("")] }),
                new TableCell({ width: { size: 34, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Post / Zone Assignment:", bold: true, size: 18 })] }), new Paragraph("")] }),
              ]
            })],
          }),
          ...twoFieldRow("Supervisor on Duty:", "Contact No.:"),

          label("SECTION B — DAILY ACTIVITY REPORT", "Heading2"),
          label("Duty Summary / Briefing Notes:"),
          inputCell(4),

          label("Patrol & Activity Log:"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['Time', 'Area / Zone Patrolled', 'Observations & Findings', 'Action Taken'].map(h =>
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })] })
                ),
              }),
              new TableRow({ children: Array(4).fill(0).map(() => new TableCell({ children: [new Paragraph(""), new Paragraph("")] })) }),
            ],
          }),

          label("Equipment & Asset Status:"),
          inputCell(3),

          label("End of Shift Remarks:"),
          inputCell(3),

          new Paragraph({ children: [new TextRun({ text: "Officer Signature: ____________________          Supervisor Signature: ____________________", size: 18 })], spacing: { before: 400 } }),
          new Paragraph({ children: [new TextRun({ text: "Date / Time: ____________________                      Date / Time: ____________________", size: 18 })], spacing: { before: 200 } }),
        ],
      },
      // ───── PAGE 2: INCIDENT REPORT ─────
      {
        children: [
          new Paragraph({ children: [new TextRun({ text: "SECURITY SURVEILLANCE REPORT", bold: true, size: 32 })], alignment: 'center' as any }),
          new Paragraph({ children: [new TextRun({ text: "CONFIDENTIAL — For Internal Use Only", italics: true, size: 16, color: '666666' })], alignment: 'center' as any, spacing: { after: 200 } }),

          label("SECTION C — INCIDENT REPORT", "Heading2"),
          ...twoFieldRow("Incident Reference No.:", "Severity (Low / Medium / High / Critical):"),
          ...twoFieldRow("Date & Time of Incident:", "Location / Zone:"),
          label("Type of Incident:"),
          new Paragraph({ children: [new TextRun({ text: "(Theft / Intrusion / Vandalism / Assault / Fire / Medical / Suspicious Activity / Other)", italics: true, size: 16, color: '888888' })], spacing: { after: 40 } }),
          inputCell(2),

          label("Person(s) Involved / Witnesses:"),
          inputCell(3),

          label("Incident Narrative (detailed description):"),
          inputCell(5),

          label("Evidence / Exhibits Collected:"),
          inputCell(3),

          label("Immediate Action Taken:"),
          inputCell(3),

          label("Notifications Made:"),
          new Paragraph({ children: [new TextRun({ text: "(Police / Fire Service / Medical / Management / Other — include time notified)", italics: true, size: 16, color: '888888' })], spacing: { after: 40 } }),
          inputCell(2),

          label("Follow-Up Action Required:"),
          inputCell(3),

          new Paragraph({ children: [new TextRun({ text: "Reporting Officer Signature: ____________________          Supervisor Signature: ____________________", size: 18 })], spacing: { before: 400 } }),
          new Paragraph({ children: [new TextRun({ text: "Date / Time: ____________________                                  Date / Time: ____________________", size: 18 })], spacing: { before: 200 } }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'security_surveillance_report.docx');
};

// ==================== FILLED REPORT PDF ====================
export interface FilledReportData {
  // Report Classification
  reportType: string; eventName: string; client: string; venue: string; reportDate: string;
  // Core Snapshot (5W1H)
  who: string; what: string; when: string; where: string; latLong: string; why: string; how: string;
  // Officer Details
  officerName: string; badgeId: string; shift: string; postZone: string; supervisor: string; contactNo: string;
  // Activity Report
  dutySummary: string;
  patrolTime: string; patrolArea: string; patrolObservations: string; patrolAction: string;
  crowdSize: string; crowdBehavior: string;
  equipmentStatus: string; endOfShiftRemarks: string;
  // Incident Report
  incidentRefNo: string; incidentSeverity: string; incidentDateTime: string; incidentLocation: string;
  incidentType: string; personsInvolved: string; incidentNarrative: string;
  evidenceCollected: string; immediateAction: string; notificationsMade: string; followUpAction: string;
}

export const exportFilledReportToPDF = (data: FilledReportData) => {
  const doc = new jsPDF();

  const drawLabel = (text: string, x: number, y: number, size = 10) => {
    doc.setFontSize(size); doc.setFont('helvetica', 'bold'); doc.text(text, x, y); doc.setFont('helvetica', 'normal');
  };

  const drawFieldRow = (label: string, value: string, yPos: number, lw = 55) => {
    drawLabel(label, 14, yPos);
    doc.setDrawColor(200); doc.rect(14 + lw, yPos - 4, 182 - lw, 8); doc.setDrawColor(0);
    doc.setFontSize(9); doc.text(value || '', 14 + lw + 2, yPos);
    return yPos + 11;
  };

  const drawTwoCol = (l1: string, v1: string, l2: string, v2: string, yPos: number) => {
    drawLabel(l1, 14, yPos, 9);
    doc.setDrawColor(200); doc.rect(14, yPos + 2, 86, 10); doc.setDrawColor(0);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(v1 || '', 16, yPos + 9);
    drawLabel(l2, 105, yPos, 9);
    doc.setDrawColor(200); doc.rect(105, yPos + 2, 91, 10); doc.setDrawColor(0);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(v2 || '', 107, yPos + 9);
    return yPos + 16;
  };

  const drawTextBlock = (labelText: string, value: string, yPos: number, blockH = 18) => {
    drawLabel(labelText, 14, yPos); yPos += 4;
    doc.setDrawColor(200); doc.rect(14, yPos, 182, blockH); doc.setDrawColor(0);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(value || '', 178), 16, yPos + 5);
    return yPos + blockH + 4;
  };

  const drawPageHeader = () => {
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text("SECURITY SURVEILLANCE REPORT", 105, 14, { align: 'center' });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text("CONFIDENTIAL — For Internal & Client Use Only", 105, 19, { align: 'center' });
    doc.setDrawColor(39, 39, 42); doc.setLineWidth(0.5); doc.line(14, 22, 196, 22); doc.setLineWidth(0.2); doc.setDrawColor(0);
  };

  const drawSectionLine = (yPos: number) => {
    doc.setDrawColor(39, 39, 42); doc.setLineWidth(0.4); doc.line(14, yPos, 196, yPos); doc.setLineWidth(0.2); doc.setDrawColor(0);
    return yPos + 6;
  };

  // ═══ PAGE 1: REPORT CLASSIFICATION + 5W1H ═══
  drawPageHeader();
  let y = 27;

  drawLabel("REPORT CLASSIFICATION", 14, y, 11); y += 7;
  y = drawFieldRow('Report Type:', data.reportType, y, 40);
  y = drawTwoCol('Event Name:', data.eventName, 'Client / Organizer:', data.client, y);
  y = drawTwoCol('Venue / Location:', data.venue, 'Date:', data.reportDate, y);

  y = drawSectionLine(y + 2);
  drawLabel("CORE INCIDENT SNAPSHOT", 14, y, 11); y += 7;
  y = drawFieldRow('Who (Involved):', data.who, y, 40);
  y = drawFieldRow('What (Incident/Activity):', data.what, y, 50);
  y = drawTwoCol('When (Timestamp):', data.when, 'Where (Zone/Location):', data.where, y);
  y = drawTwoCol('Lat / Long:', data.latLong, 'Why (Context / Trigger):', data.why, y);
  y = drawFieldRow('How (Methodology / Source):', data.how, y, 55);

  // ═══ PAGE 2: OFFICER DETAILS + ACTIVITY REPORT ═══
  doc.addPage();
  drawPageHeader();
  y = 27;

  drawLabel("SECTION A — OFFICER DETAILS", 14, y, 11); y += 7;
  y = drawTwoCol('Officer Name:', data.officerName, 'Badge / ID No.:', data.badgeId, y);
  y = drawTwoCol('Shift:', data.shift, 'Post / Zone Assigned:', data.postZone, y);
  y = drawTwoCol('Supervisor on Duty:', data.supervisor, 'Contact No.:', data.contactNo, y);

  y = drawSectionLine(y + 2);
  drawLabel("SECTION B — DAILY ACTIVITY REPORT", 14, y, 11); y += 7;
  y = drawTextBlock('Duty Summary / Briefing Notes:', data.dutySummary, y, 18);

  // Patrol Log table
  drawLabel('Patrol & Activity Log:', 14, y); y += 5;
  const cw = [25, 40, 70, 47];
  const ch = ['Time', 'Area / Zone', 'Observations & Findings', 'Action Taken'];
  const cv = [data.patrolTime, data.patrolArea, data.patrolObservations, data.patrolAction];
  doc.setFillColor(39, 39, 42); doc.rect(14, y, 182, 9, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(255);
  let xp = 14;
  ch.forEach((h, i) => { doc.text(h, xp + 2, y + 6); xp += cw[i]; });
  doc.setTextColor(0); doc.setFont('helvetica', 'normal'); y += 9;
  xp = 14;
  cw.forEach((w, i) => {
    doc.setDrawColor(200); doc.rect(xp, y, w, 14); doc.setDrawColor(0);
    doc.setFontSize(7); doc.text(doc.splitTextToSize(cv[i] || '', w - 4), xp + 2, y + 5);
    xp += w;
  });
  y += 19;

  // Crowd fields
  y = drawTwoCol('Estimated Crowd Size:', data.crowdSize, 'Crowd Behavior:', data.crowdBehavior, y);

  y = drawTextBlock('Equipment & Asset Status:', data.equipmentStatus, y, 15);
  y = drawTextBlock('End of Shift Remarks:', data.endOfShiftRemarks, y, 15);

  // Signature block
  doc.setFontSize(9);
  doc.text("Officer Signature: ____________________", 14, y + 2);
  doc.text("Supervisor Signature: ____________________", 110, y + 2);
  y += 10;
  doc.text("Date / Time: ____________________", 14, y);
  doc.text("Date / Time: ____________________", 110, y);

  // ═══ PAGE 3: INCIDENT REPORT + SIGN-OFF ═══
  doc.addPage();
  drawPageHeader();
  y = 27;

  drawLabel("SECTION C — INCIDENT REPORT", 14, y, 11); y += 7;
  y = drawTwoCol('Incident Ref No.:', data.incidentRefNo, 'Severity:', data.incidentSeverity, y);
  y = drawTwoCol('Date & Time:', data.incidentDateTime, 'Location / Zone:', data.incidentLocation, y);
  y = drawFieldRow('Type of Incident:', data.incidentType, y, 40);
  y = drawTextBlock('Person(s) Involved / Witnesses:', data.personsInvolved, y, 16);
  y = drawTextBlock('Incident Narrative:', data.incidentNarrative, y, 28);
  y = drawTextBlock('Evidence / Exhibits:', data.evidenceCollected, y, 14);
  y = drawTextBlock('Immediate Action Taken:', data.immediateAction, y, 16);
  y = drawTextBlock('Notifications Made:', data.notificationsMade, y, 12);
  y = drawTextBlock('Follow-Up Action Required:', data.followUpAction, y, 14);

  // Sign-Off
  y = drawSectionLine(y + 2);
  drawLabel("SIGN-OFF", 14, y, 11); y += 10;
  doc.setFontSize(9);
  doc.text("Reporting Officer Signature: ____________________", 14, y);
  doc.text("Supervisor Signature: ____________________", 110, y);
  y += 10;
  doc.text("Date / Time: ____________________", 14, y);
  doc.text("Date / Time: ____________________", 110, y);

  doc.save('security_surveillance_report_filled.pdf');
};

