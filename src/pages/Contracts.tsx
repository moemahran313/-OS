import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { toPng } from 'html-to-image';
import NafathAuth from "@/src/components/NafathAuth";
import { QRCodeSVG } from "qrcode.react";
import {
  FileSignature,
  Download,
  Info,
  CheckCircle2,
  ChevronRight,
  Calculator,
  ShieldCheck,
  Scale,
  Globe2,
  Building,
  User,
  Settings2,
  Image as ImageIcon
} from "lucide-react";

interface ContractData {
  employerName: string;
  employerNameEn: string;
  employerCR: string;
  employerAddress: string;
  employerAddressEn: string;
  employerRep: string;
  employerRepEn: string;
  employeeName: string;
  employeeNameEn: string;
  employeeId: string;
  employeeNationality: string;
  employeeNationalityEn: string;
  employeeAddress: string;
  employeeAddressEn: string;
  employeeEmail: string;
  employeeMobile: string;
  jobTitle: string;
  jobTitleEn: string;
  contractType: "fixed" | "indefinite";
  startDate: string;
  durationMonths: string;
  probationDays: string;
  basicSalary: string;
  housingAllowance: string;
  transportAllowance: string;
  otherAllowances: string;
  workingHours: string;
  workingDays: string;
  annualLeaveDays: string;
  disputeResolution: "SA_COURTS" | "SCCA" | "DIFC";
  themeColor: string;
}

const DEFAULT_DATA: ContractData = {
  employerName: "الشركة العربية المتقدمة",
  employerNameEn: "Advanced Arabian Co.",
  employerCR: "1010123456",
  employerAddress: "الرياض, المملكة العربية السعودية",
  employerAddressEn: "Riyadh, Saudi Arabia",
  employerRep: "أحمد عبدالله",
  employerRepEn: "Ahmed Abdullah",
  employeeName: "محمد سعيد",
  employeeNameEn: "Mohammed Saeed",
  employeeId: "2000123456",
  employeeNationality: "سعودي",
  employeeNationalityEn: "Saudi",
  employeeAddress: "جدة, المملكة العربية السعودية",
  employeeAddressEn: "Jeddah, Saudi Arabia",
  employeeEmail: "mohammad@example.com",
  employeeMobile: "0501234567",
  jobTitle: "مطور برمجيات",
  jobTitleEn: "Software Developer",
  contractType: "fixed",
  startDate: new Date().toISOString().split("T")[0],
  durationMonths: "12",
  probationDays: "90",
  basicSalary: "8000",
  housingAllowance: "2000",
  transportAllowance: "800",
  otherAllowances: "0",
  workingHours: "8",
  workingDays: "5",
  annualLeaveDays: "21",
  disputeResolution: "SA_COURTS",
  themeColor: "#0f172a" // Midnight Navy
};

export default function Contracts() {
  const [data, setData] = useState<ContractData>(DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState<"employer" | "employee" | "terms" | "settings" | "templates">("templates");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // High resolution for printing
        canvas.width = 1600;
        canvas.height = 2400;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 120px "IBM Plex Sans Arabic", Tajawal, sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add rotation and repeat Pattern
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        
        // Draw multiple lines of watermark
        for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
            const x = i * 600;
            const y = j * 400;
            ctx.fillText(data.employerCR || 'CONFIDENTIAL', x, y);
            
            // Add a smaller sub-watermark for extra security
            ctx.font = 'bold 40px monospace';
            ctx.fillText(data.employeeId, x, y + 60);
            ctx.font = 'bold 120px "IBM Plex Sans Arabic", Tajawal, sans-serif';
          }
        }
      }
    }
  }, [data.employerCR, data.employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const [isExporting, setIsExporting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const handleSignatureSuccess = () => {
    setIsSigned(true);
    setQrCodeData(`NAFEZ_AUTH_${data.employeeId}_${Date.now()}`);
  };

  const handlePrint = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading('جاري توليد ملف PDF...');

    // Wait for React to re-render without Tailwind color components (NafathAuth)
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const contractElement = document.getElementById("contract-document");
      if (!contractElement) {
        toast.error('لم يتم العثور على مستند العقد');
        setIsExporting(false);
        return;
      }

      const imgData = await toPng(contractElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList?.contains('print:hidden')) {
            return false;
          }
          return true;
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4' // typical A4 size
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Handle multi-page
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Employment_Contract.pdf');
      toast.success('تم تصدير العقد بصيغة PDF بنجاح', { id: loadingToast });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف PDF', { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  const renderDisputeClause = () => {
    switch (data.disputeResolution) {
      case "SCCA":
        return {
          ar: "يتم تسوية أي نزاع ينشأ عن هذا العقد عن طريق التحكيم وفقًا لقواعد المركز السعودي للتحكيم التجاري (SCCA).",
          en: "Any dispute arising out of this contract shall be settled by arbitration in accordance with the rules of the Saudi Center for Commercial Arbitration (SCCA)."
        };
      case "DIFC":
        return {
          ar: "يخضع هذا العقد حصريًا لاختصاص محاكم مركز دبي المالي العالمي (DIFC).",
          en: "This contract is subject exclusively to the jurisdiction of the DIFC Courts."
        };
      case "SA_COURTS":
      default:
        return {
          ar: "تختص المحاكم العمالية في المملكة العربية السعودية بالنظر في أي نزاع ينشأ عن هذا العقد.",
          en: "Labor courts in the Kingdom of Saudi Arabia shall have jurisdiction over any dispute arising from this contract."
        };
    }
  };

  const disputeText = renderDisputeClause();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-hidden bg-zinc-50 font-sans" dir="rtl">
      
      {/* LEFT PANE: The Questionnaire (Editor) */}
      <div className="w-full lg:w-[45%] h-full flex flex-col border-l border-zinc-200 bg-white print:hidden shadow-xl z-10">
        <header className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">CLM الذكي</h1>
            <p className="text-xs font-bold text-[#10b981] mt-1 tracking-wider uppercase">Next-Gen Legal Engine</p>
          </div>
          <button
            onClick={handlePrint}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#0f172a] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1e293b] disabled:opacity-50 transition-colors shadow-md"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent animate-spin rounded-full" /> : <Download className="w-4 h-4 text-[#d4af37]" />} 
            {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
          </button>
        </header>

        <div className="flex border-b border-zinc-100 shrink-0 bg-white px-4 pt-2 gap-2 overflow-x-auto">
          {[
            { id: "templates", icon: FileSignature, label: "النماذج الجاهزة" },
            { id: "employer", icon: Building, label: "المنشأة" },
            { id: "employee", icon: User, label: "العامل" },
            { id: "terms", icon: Scale, label: "الشروط والرواتب" },
            { id: "settings", icon: Settings2, label: "الإعدادات الذكية" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#10b981] text-[#0f172a] bg-zinc-50 rounded-t-lg"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50/50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#10b981]' : ''}`} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <form className="space-y-8 pb-10">
            {activeTab === "templates" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-[#10b981] mb-1">النماذج الجاهزة الذكية</h3>
                  <p className="text-sm text-zinc-600">اختر نموذجاً للبدء وسيقوم النظام بتعبئة البنود القانونية وتفاصيل الراتب تلقائياً لتناسب الدور الوظيفي.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setData(prev => ({ ...prev, jobTitle: 'مدير مبيعات', jobTitleEn: 'Sales Manager', contractType: 'fixed', basicSalary: '6000', housingAllowance: '1500', transportAllowance: '500', otherAllowances: '2000' }))} className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group">
                    <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">عقد موظف مبيعات</h4>
                    <p className="text-xs text-zinc-500">يتضمن بدلات وتسويات العمولات</p>
                  </button>
                  <button type="button" onClick={() => setData(prev => ({ ...prev, jobTitle: 'مطور برمجيات', jobTitleEn: 'Software Developer', contractType: 'indefinite', basicSalary: '12000', housingAllowance: '3000', transportAllowance: '1000', otherAllowances: '0' }))} className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group">
                    <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">عقد مهندس / تقني</h4>
                    <p className="text-xs text-zinc-500">يتضمن شروط السرية وعدم المنافسة</p>
                  </button>
                  <button type="button" onClick={() => setData(prev => ({ ...prev, jobTitle: 'محاسب', jobTitleEn: 'Accountant', contractType: 'fixed', basicSalary: '5000', housingAllowance: '1250', transportAllowance: '400', otherAllowances: '0' }))} className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group">
                    <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">عقد مالي / محاسب</h4>
                    <p className="text-xs text-zinc-500">يتضمن بند عهدة ومسؤولية مالية</p>
                  </button>
                  <button type="button" onClick={() => setData(prev => ({ ...prev, jobTitle: 'عامل صيانة', jobTitleEn: 'Maintenance Worker', contractType: 'fixed', basicSalary: '2000', housingAllowance: '500', transportAllowance: '200', otherAllowances: '0' }))} className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group">
                    <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">عقد عمالة مهنية</h4>
                    <p className="text-xs text-zinc-500">يتضمن توفير سكن وإعاشة</p>
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === "employer" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">اسم المنشأة (عربي)</label>
                    <input type="text" name="employerName" value={data.employerName} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">اسم المنشأة (English)</label>
                    <input type="text" name="employerNameEn" value={data.employerNameEn} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none transition-all" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">السجل التجاري (CR)</label>
                  <input type="text" name="employerCR" value={data.employerCR} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">ممثل المنشأة (عربي)</label>
                    <input type="text" name="employerRep" value={data.employerRep} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-[#10b981]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Representative (English)</label>
                    <input type="text" name="employerRepEn" value={data.employerRepEn} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-[#10b981]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">مقر العمل (عربي)</label>
                    <input type="text" name="employerAddress" value={data.employerAddress} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-[#10b981]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">HQ Address (English)</label>
                    <input type="text" name="employerAddressEn" value={data.employerAddressEn} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-[#10b981]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "employee" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">اسم العامل (عربي)</label>
                    <input type="text" name="employeeName" value={data.employeeName} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Employee Name (English)</label>
                    <input type="text" name="employeeNameEn" value={data.employeeNameEn} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">رقم الهوية / الإقامة</label>
                    <input type="text" name="employeeId" value={data.employeeId} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                  </div>
                  <div className="space-y-2 flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-zinc-700">الجنسية</label>
                      <input type="text" name="employeeNationality" value={data.employeeNationality} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-zinc-700">Nationality (EN)</label>
                      <input type="text" name="employeeNationalityEn" value={data.employeeNationalityEn} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">العنوان الوطني</label>
                    <input type="text" name="employeeAddress" value={data.employeeAddress} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">National Address</label>
                    <input type="text" name="employeeAddressEn" value={data.employeeAddressEn} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">الجوال / Mobile</label>
                    <input type="text" name="employeeMobile" value={data.employeeMobile} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none block" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">البريد الإلكتروني / Email</label>
                    <input type="email" name="employeeEmail" value={data.employeeEmail} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">المسمى الوظيفي (عربي)</label>
                    <input type="text" name="jobTitle" value={data.jobTitle} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Job Title (English)</label>
                    <input type="text" name="jobTitleEn" value={data.jobTitleEn} onChange={handleChange} dir="ltr" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">تاريخ المباشرة</label>
                    <input type="date" name="startDate" value={data.startDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none text-right" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">نوع العقد</label>
                    <select name="contractType" value={data.contractType} onChange={handleChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none">
                      <option value="fixed">محدد المدة (Fixed)</option>
                      <option value="indefinite">غير محدد (Indefinite)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">المدة (أشهر)</label>
                    <input type="number" name="durationMonths" value={data.durationMonths} onChange={handleChange} disabled={data.contractType === "indefinite"} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold disabled:opacity-50 focus:border-[#10b981] outline-none" />
                  </div>
                </div>

                <div className="p-5 border border-[#10b981]/20 bg-[#10b981]/5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-[#10b981]"></div>
                  <h3 className="text-xs font-black text-[#0f172a] mb-4 uppercase tracking-wider">الحزمة المالية / Financial Package</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">الراتب الأساسي / Basic</label>
                      <input type="number" name="basicSalary" value={data.basicSalary} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">السكن / Housing</label>
                      <input type="number" name="housingAllowance" value={data.housingAllowance} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">النقل / Transport</label>
                      <input type="number" name="transportAllowance" value={data.transportAllowance} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">أخرى / Other</label>
                      <input type="number" name="otherAllowances" value={data.otherAllowances} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Globe2 className="w-5 h-5 text-[#d4af37]" /> آلية تسوية المنازعات
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-[#10b981] transition-all">
                      <input type="radio" name="disputeResolution" value="SA_COURTS" checked={data.disputeResolution === "SA_COURTS"} onChange={handleChange} className="mt-1" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">المحاكم العمالية السعودية (الافتراضي)</p>
                        <p className="text-xs text-slate-500 font-medium">Saudi Labor Courts (Default for locals/standard hires)</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-[#10b981] transition-all">
                      <input type="radio" name="disputeResolution" value="SCCA" checked={data.disputeResolution === "SCCA"} onChange={handleChange} className="mt-1" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">المركز السعودي للتحكيم التجاري (SCCA)</p>
                        <p className="text-xs text-slate-500 font-medium">Saudi Center for Commercial Arbitration (Best for executives)</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-[#10b981] transition-all">
                      <input type="radio" name="disputeResolution" value="DIFC" checked={data.disputeResolution === "DIFC"} onChange={handleChange} className="mt-1" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">محاكم مركز دبي المالي (DIFC)</p>
                        <p className="text-xs text-slate-500 font-medium">DIFC Courts (Best for cross-border international hires)</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-[#0f172a]" /> الهوية البصرية (Brand Identity)
                  </h3>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700">لون العقد الأساسي</label>
                    <div className="flex gap-3">
                      {["#0f172a", "#10b981", "#d4af37", "#3b82f6", "#ef4444"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setData(prev => ({ ...prev, themeColor: color }))}
                          className={`w-8 h-8 rounded-full border-2 ${data.themeColor === color ? 'border-zinc-900 scale-110 shadow-md' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] text-white p-5 rounded-2xl flex gap-3 shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                  <div>
                    <p className="font-bold text-sm">حماية التستر والموثوقية (Nafath)</p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">عند إرسال العقد للتوقيع الإلكتروني، سيتم توجيه الممثل القانوني للمصادقة عبر النفاذ الوطني لتأكيد الصلاحية (CR Audit Trail).</p>
                  </div>
                </div>

              </div>
            )}
          </form>
        </div>
      </div>

      {/* RIGHT PANE: Split-Screen PDF Preview */}
      <div className="flex-1 bg-zinc-400 p-8 overflow-y-auto print:p-0 print:bg-white custom-scrollbar flex justify-center">
        
        <div 
          className="w-[210mm] min-h-[297mm] p-0 print:w-full print:h-auto overflow-hidden relative"
          style={{ backgroundColor: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', color: '#0f172a', fontVariantLigatures: 'none', wordBreak: 'break-word', fontFamily: 'CairoPDF, sans-serif' }}
          id="contract-document"
        >
          {/* SECURE CANVAS WATERMARK */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 mix-blend-multiply"
          />

          <div className="h-4 w-full relative z-10" style={{ backgroundColor: data.themeColor }}></div>
          
          <div className="p-12 relative z-10 bg-[rgba(255,255,255,0.4)]">
            {/* Header Content */}
            <div className="flex justify-between items-center mb-12 border-b-2 pb-6" style={{ borderColor: data.themeColor }}>
              <div className="text-right">
                <h1 className="text-2xl font-black text-[#0f172a]" style={{ color: data.themeColor, fontVariantLigatures: 'none', wordBreak: 'break-word' }}>عقد عمل (نموذج مزدوج)</h1>
                <p className="text-sm font-bold text-[#64748b] mt-1">Employment Contract (Dual-Language)</p>
              </div>
              <div className="text-left" dir="ltr">
                <p className="text-[10px] font-bold text-[#94a3b8] font-mono uppercase">Document Ref: EV-{new Date().getTime().toString().slice(-6)}</p>
                <p className="text-[10px] font-bold text-[#94a3b8] mt-1 font-mono">{new Date().toISOString().split("T")[0]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm text-justify">
              
              {/* Employer Definition */}
              <div dir="rtl" className="space-y-2 border-r-4 pr-4" style={{ borderColor: data.themeColor }}>
                <h3 className="font-black text-[#0f172a]">الطرف الأول (صاحب العمل):</h3>
                <p className="text-[#334155] leading-relaxed font-medium">الاسم: {data.employerName}<br/>سجل تجاري: {data.employerCR}<br/>العنوان: {data.employerAddress}<br/>يمثلها: {data.employerRep}</p>
              </div>
              <div dir="ltr" className="space-y-2 border-l-4 pl-4" style={{ borderColor: data.themeColor }}>
                <h3 className="font-black text-[#0f172a]">First Party (Employer):</h3>
                <p className="text-[#334155] leading-relaxed font-medium">Name: {data.employerNameEn}<br/>CR No: {data.employerCR}<br/>Address: {data.employerAddressEn}<br/>Represented By: {data.employerRepEn}</p>
              </div>

              {/* Employee Definition */}
              <div dir="rtl" className="space-y-2 border-r-4 pr-4 mt-6" style={{ borderColor: data.themeColor }}>
                <h3 className="font-black text-[#0f172a]">الطرف الثاني (العامل):</h3>
                <p className="text-[#334155] leading-relaxed font-medium">الاسم: {data.employeeName}<br/>الجنسية: {data.employeeNationality} - هوية رقم: {data.employeeId}<br/>العنوان: {data.employeeAddress}<br/>الجوال: <span dir="ltr">{data.employeeMobile}</span> - إيميل: <span dir="ltr">{data.employeeEmail}</span></p>
              </div>
              <div dir="ltr" className="space-y-2 border-l-4 pl-4 mt-6" style={{ borderColor: data.themeColor }}>
                <h3 className="font-black text-[#0f172a]">Second Party (Employee):</h3>
                <p className="text-[#334155] leading-relaxed font-medium">Name: {data.employeeNameEn}<br/>Nationality: {data.employeeNationalityEn} - ID: {data.employeeId}<br/>Address: {data.employeeAddressEn}<br/>Mobile: {data.employeeMobile} - Email: {data.employeeEmail}</p>
              </div>

              {/* CLR: Divider */}
              <div className="col-span-2 my-2 border-b border-[#f1f5f9]"></div>

              {/* Clause 1: Position */}
              <div dir="rtl">
                <h3 className="font-black text-[#0f172a] mb-2 whitespace-nowrap">البند الأول: الوظيفة والمهام</h3>
                <p className="text-[#334155] leading-relaxed font-medium">سيعمل الطرف الثاني بمهنة ({data.jobTitle}) استجابة لتوجيهات الطرف الأول.</p>
              </div>
              <div dir="ltr">
                <h3 className="font-black text-[#0f172a] mb-2 whitespace-nowrap">Clause 1: Position & Duties</h3>
                <p className="text-[#334155] leading-relaxed font-medium">The Second Party shall serve as ({data.jobTitleEn}) under the direction of the First Party.</p>
              </div>

              {/* Clause 2: Duration */}
              <div dir="rtl">
                <h3 className="font-black text-[#0f172a] mb-2 whitespace-nowrap">البند الثاني: المدة والتجربة</h3>
                <p className="text-[#334155] leading-relaxed font-medium">
                  {data.contractType === 'fixed' ? `مدة العقد (${data.durationMonths}) شهراً تبدأ من ${data.startDate}.` : `هذا العقد غير محدد المدة يبدأ من ${data.startDate}.`} وفترة التجربة ({data.probationDays}) يوماً.
                </p>
              </div>
              <div dir="ltr">
                <h3 className="font-black text-[#0f172a] mb-2 whitespace-nowrap">Clause 2: Duration & Probation</h3>
                <p className="text-[#334155] leading-relaxed font-medium">
                  {data.contractType === 'fixed' ? `Contract duration is (${data.durationMonths}) months starting ${data.startDate}.` : `This is an indefinite contract starting ${data.startDate}.`} Probation period is ({data.probationDays}) days.
                </p>
              </div>

              {/* Clause 3: Compensation */}
              <div dir="rtl">
                <h3 className="font-black text-[#0f172a] mb-2 whitespace-nowrap">البند الثالث: التعويضات</h3>
                <ul className="list-disc list-inside text-[#334155] leading-relaxed font-medium marker:text-[#10b981]">
                  <li>الأساسي: {data.basicSalary} ر.س</li>
                  <li>السكن: {data.housingAllowance} ر.س</li>
                  <li>النقل: {data.transportAllowance} ر.س</li>
                </ul>
              </div>
              <div dir="ltr">
                <h3 className="font-black text-[#0f172a] mb-2 whitespace-nowrap">Clause 3: Compensation</h3>
                <ul className="list-disc list-inside text-[#334155] leading-relaxed font-medium marker:text-[#10b981]">
                  <li>Basic: SAR {data.basicSalary}</li>
                  <li>Housing: SAR {data.housingAllowance}</li>
                  <li>Transport: SAR {data.transportAllowance}</li>
                </ul>
              </div>

              {/* Clause 4: Dispute Resolution (Dynamic) */}
              <div dir="rtl">
                <h3 className="font-black text-[#0f172a] mb-2 whitespace-nowrap">البند الرابع: تسوية المنازعات</h3>
                <p className="text-[#334155] leading-relaxed font-medium bg-[#f8fafc] p-2 rounded border border-[#f1f5f9]">{disputeText.ar}</p>
              </div>
              <div dir="ltr">
                <h3 className="font-black text-[#0f172a] mb-2 whitespace-nowrap">Clause 4: Dispute Resolution</h3>
                <p className="text-[#334155] leading-relaxed font-medium bg-[#f8fafc] p-2 rounded border border-[#f1f5f9]">{disputeText.en}</p>
              </div>

              {/* Signatures */}
              <div className="col-span-2 mt-20 pt-12 border-t-2 border-[#f1f5f9] grid grid-cols-2 gap-12 relative">
                
                <div id="nafez-qr-container" className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center justify-center opacity-40 mix-blend-multiply">
                   {isSigned && qrCodeData && <QRCodeSVG value={qrCodeData} size={100} />}
                </div>

                <div className="text-center flex flex-col items-center">
                  <p className="font-black text-[#0f172a] mb-12">الطرف الأول / First Party</p>
                  {(!isExporting || !isSigned) && (
                    <div className="print:hidden">
                       <NafathAuth onVerified={handleSignatureSuccess} />
                    </div>
                  )}
                  {(isExporting || isSigned) && (
                    <p className="text-xs text-[#94a3b8] font-mono uppercase tracking-widest border-b border-dashed border-[#cbd5e1] pb-2 px-12">Digital Signature Confirmed</p>
                  )}
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="font-black text-[#0f172a] mb-12">الطرف الثاني / Second Party</p>
                  <p className="text-xs text-[#94a3b8] font-mono uppercase tracking-widest border-b border-dashed border-[#cbd5e1] pb-2 inline-block px-12">Digital Signature Pending</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
