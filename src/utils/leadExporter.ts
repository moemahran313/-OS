import { LeadCompany, LeadContact } from "@/src/types/leadGen";

/**
 * Calculates lead score for company
 */
function getScore(c: LeadCompany): number {
  let score = 50;
  if (c.crStatus === "VALID") score += 10;
  if (c.employeeCount > 50) score += 10;
  if (c.email) score += 10;
  if (c.socialLinks?.linkedin) score += 10;
  if (c.webAudit?.hasSsl === false) score += 10; // Sales gap opportunity!
  return Math.min(100, score);
}

function getTier(score: number): string {
  if (score >= 80) return "Hot (عالي الأولوية)";
  if (score >= 60) return "Warm (متوسط)";
  return "Cold (عادي)";
}

/**
 * Clean cell text for CSV to escape commas and quotes
 */
function escapeCsvCell(cell: string | number | undefined | null): string {
  if (cell === undefined || cell === null) return '""';
  const str = String(cell).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export companies and insights to UTF-8 CSV file
 */
export function exportLeadsToCsv(
  companies: LeadCompany[],
  contacts: LeadContact[] = [],
  filename: string = "mudarij_lead_insights"
) {
  const headers = [
    "اسم الشركة (عربي)",
    "اسم الشركة (إنجليزي)",
    "القطاع / النشاط",
    "المدينة",
    "الدولة",
    "العنوان الوطني",
    "الهاتف",
    "البريد الإلكتروني",
    "الموقع الإلكتروني",
    "رابط لينكدإن",
    "رقم الواتساب",
    "عدد الموظفين",
    "نطاق الإيرادات",
    "السجل التجاري (CR)",
    "حالة السجل التجاري",
    "درجة التقييم AI",
    "تصنيف الفرصة (Tier)",
    "مقترح العرض المبيعي (AI Sales Pitch)",
    "الاحتياجات المحتملة",
    "فجوات الموقع والتقنية",
    "التقنيات المستخدمة (Tech Stack)",
    "أصحاب القرار (Decision Makers)",
    "تاريخ الاستكشاف",
  ];

  const rows: string[][] = [headers];

  companies.forEach((comp) => {
    const score = getScore(comp);
    const tier = getTier(score);
    const companyContacts = contacts.filter((cnt) => cnt.companyId === comp.id);
    const contactsStr = companyContacts
      .map((cnt) => `${cnt.firstName} ${cnt.lastName} (${cnt.position} - ${cnt.email || cnt.mobile})`)
      .join(" | ");

    rows.push([
      comp.nameAr || comp.name,
      comp.name,
      comp.industry,
      comp.city,
      comp.country,
      comp.address,
      comp.phone,
      comp.email,
      comp.website,
      comp.socialLinks?.linkedin || "",
      comp.socialLinks?.whatsapp || "",
      String(comp.employeeCount || 0),
      comp.revenueRange || "",
      comp.crNumber || "",
      comp.crStatus || "PENDING",
      String(score),
      tier,
      comp.enrichment?.suggestedSalesPitch || "",
      comp.enrichment?.potentialNeeds?.join(" ; ") || "",
      comp.webAudit?.keyGaps?.join(" ; ") || "",
      comp.webAudit?.techStack?.join(" ; ") || "",
      contactsStr,
      new Date(comp.createdAt).toLocaleDateString("ar-SA"),
    ]);
  });

  const csvContent =
    "\uFEFF" + // UTF-8 BOM for Microsoft Excel Arabic rendering
    rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export companies to Excel XML format (.xls) with multi-sheet structure and clean table formatting
 */
export function exportLeadsToExcel(
  companies: LeadCompany[],
  contacts: LeadContact[] = [],
  filename: string = "mudarij_leads_report"
) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataStyle">
   <Font ss:FontName="Segoe UI" ss:Size="10"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="HotStyle">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#D97706"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="قائمة الفرص المستهدفة">
  <Table>
   <Row ss:Height="25">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">اسم الشركة (عربي)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">القطاع</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">المدينة</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">الهاتف</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">البريد الإلكتروني</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">الموقع الإلكتروني</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">لينكدإن LinkedIn</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">الموظفين</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">تقييم AI Score</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">مقترح العرض المبيعي AI Pitch</Data></Cell>
   </Row>`;

  companies.forEach((comp) => {
    const score = getScore(comp);
    xml += `
   <Row ss:Height="20">
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(comp.nameAr || comp.name)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(comp.industry)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(comp.city)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(comp.phone)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(comp.email)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(comp.website)}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(comp.socialLinks?.linkedin || "")}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="Number">${comp.employeeCount || 0}</Data></Cell>
    <Cell ss:StyleID="${score >= 80 ? "HotStyle" : "DataStyle"}"><Data ss:Type="Number">${score}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(comp.enrichment?.suggestedSalesPitch || "")}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
