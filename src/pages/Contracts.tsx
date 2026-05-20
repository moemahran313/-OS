import React, { useState } from "react";
import {
  FileSignature,
  Download,
  Info,
  CheckCircle2,
  ChevronRight,
  Calculator,
} from "lucide-react";

interface ContractData {
  employerName: string;
  employerCR: string;
  employerAddress: string;
  employerRep: string;
  employeeName: string;
  employeeId: string;
  employeeNationality: string;
  employeeAddress: string;
  employeeEmail: string;
  employeeMobile: string;
  jobTitle: string;
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
}

const DEFAULT_DATA: ContractData = {
  employerName: "الشركة العربية المتقدمة",
  employerCR: "1010123456",
  employerAddress: "الرياض, المملكة العربية السعودية",
  employerRep: "أحمد عبدالله",
  employeeName: "محمد سعيد",
  employeeId: "2000123456",
  employeeNationality: "سعودي",
  employeeAddress: "جدة, المملكة العربية السعودية",
  employeeEmail: "mohammad@example.com",
  employeeMobile: "0501234567",
  jobTitle: "مطور برمجيات",
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
};

export default function Contracts() {
  const [data, setData] = useState<ContractData>(DEFAULT_DATA);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto pb-20 print:p-0 print:m-0" dir="rtl">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition-colors bg-white px-4 py-2 border rounded-xl font-bold text-sm"
          >
            <ChevronRight className="w-4 h-4" /> العودة للنموذج
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> حفظ كلف PDF (للقوى)
          </button>
        </div>

        {/* Contract Physical Template */}
        <div
          className="bg-white p-12 min-h-[1056px] shadow-sm border border-zinc-200 rounded-lg print:border-none print:shadow-none print:m-0 print:p-8"
          id="contract-document"
        >
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-2xl font-black text-zinc-900 leading-tight">عقد عمل موحد</h1>
            <p className="text-zinc-500 font-bold">وفقاً لنظام العمل السعودي ولائحته التنفيذية</p>
          </div>

          <div className="space-y-6 text-sm font-medium leading-relaxed text-zinc-800 text-justify">
            <p>إنه في يوم المقابل للتاريخ {data.startDate}، تم الاتفاق بين كل من:</p>

            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <h3 className="font-bold text-base mb-2">الطرف الأول (صاحب العمل):</h3>
              <p>
                الاسم: {data.employerName}، سجل تجاري رقم: {data.employerCR}.<br />
                العنوان: {data.employerAddress}، ويمثلها في هذا العقد: {data.employerRep}.
              </p>
            </div>

            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <h3 className="font-bold text-base mb-2">الطرف الثاني (العامل):</h3>
              <p>
                الاسم: {data.employeeName}، الجنسية: {data.employeeNationality}، رقم الهوية/الإقامة:{" "}
                {data.employeeId}.<br />
                العنوان: {data.employeeAddress}، الجوال: {data.employeeMobile}، البريد الإلكتروني:{" "}
                {data.employeeEmail}.
              </p>
            </div>

            <h3 className="font-bold text-base mt-6">البند الأول: موضوع العقد</h3>
            <p>
              وافق الطرف الثاني على العمل لدى الطرف الأول وتحت إدارته وإشرافه بمهنة ({data.jobTitle}
              ) في مدينة {data.employerAddress.split(",")[0] || ""} أو أي مكان آخر يتم تحديده من قبل
              الطرف الأول.
            </p>

            <h3 className="font-bold text-base mt-4">البند الثاني: مدة العقد وفترة التجربة</h3>
            <p>
              {data.contractType === "fixed"
                ? `مدة هذا العقد (${data.durationMonths}) شهراً تبدأ من تاريخ ${data.startDate} وتتجدد لمدة أو لمدد مماثلة ما لم يشعر أحد الطرفين الآخر كتابة بعدم رغبته في التجديد قبل شهرين على الأقل من تاريخ الانتهاء.`
                : `هذا العقد غير محدد المدة، يبدأ سريانه من تاريخ ${data.startDate}.`}
              <br />
              يخضع الطرف الثاني لفترة تجربة مدتها ({data.probationDays}) يوماً، لا تدخل فيها إجازة
              عيدي الفطر والأضحى والإجازة المرضية، ويحق لأي من الطرفين إنهاء العقد خلال هذه الفترة.
            </p>

            <h3 className="font-bold text-base mt-4">البند الثالث: الأجر والبدلات</h3>
            <p>
              يدفع الطرف الأول للطرف الثاني أجراً شهرياً قدره ({data.basicSalary}) ريال سعودي،
              بالإضافة إلى البدلات التالية:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>بدل سكن: {data.housingAllowance} ريال.</li>
              <li>بدل مواصلات: {data.transportAllowance} ريال.</li>
              {Number(data.otherAllowances) > 0 && (
                <li>بدلات أخرى: {data.otherAllowances} ريال.</li>
              )}
            </ul>

            <h3 className="font-bold text-base mt-4">البند الرابع: أوقات العمل والراحة</h3>
            <p>
              ساعات العمل اليومية هي ({data.workingHours}) ساعات، وأيام العمل في الأسبوع (
              {data.workingDays}) أيام. ويحصل الطرف الثاني على يوم راحة أسبوعية.
            </p>

            <h3 className="font-bold text-base mt-4">البند الخامس: الإجازات</h3>
            <p>
              يستحق الطرف الثاني إجازة سنوية مدفوعة الأجر مدتها ({data.annualLeaveDays}) يوماً عن كل
              عام من سنوات الخدمة. كما يستحق الإجازات الرسمية وفقاً لنظام العمل.
            </p>

            <h3 className="font-bold text-base mt-4">البند السادس: أحكام عامة</h3>
            <p>
              كل ما لم يرد به نص في هذا العقد يرجع فيه لأحكام نظام العمل السعودي ولائحته التنفيذية
              والقرارات الصادرة تنفيذاً له ولوائح تنظيم العمل المعتمدة بالمنشأة.
            </p>

            <div className="grid grid-cols-2 mt-16 pt-8 border-t border-zinc-200">
              <div className="text-center">
                <p className="font-bold mb-8">الطرف الأول (صاحب العمل)</p>
                <p>الاسم: ..........................</p>
                <p className="mt-4">التوقيع: ..........................</p>
              </div>
              <div className="text-center">
                <p className="font-bold mb-8">الطرف الثاني (العامل)</p>
                <p>الاسم: ..........................</p>
                <p className="mt-4">التوقيع: ..........................</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 print:hidden" dir="rtl">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">
            منشئ العقود
          </span>
        </div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">عقود العمل (منصة قوى)</h1>
        <p className="mt-2 text-zinc-500 font-medium text-sm leading-relaxed max-w-2xl">
          أداة لإنشاء وتجهيز عقود العمل الموحدة الخاصة بنظام العمل السعودي. يمكنك صياغة العقد وإضافة
          تفاصيل الراتب والبدلات، وثم تصدير العقد لرفعه إلى منصة قوى بكل سهولة.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm font-medium">
          <p className="font-bold mb-1">متطلبات الرقمنة</p>
          جميع العقود يجب أن تكون موثقة عبر منصة قوى. هذه الأداة تساعدك على إنشاء المسودة النهائية
          المطابقة للصيغة النظامية واعتمادها من الموظف قبل التوثيق في المنصة.
        </div>
      </div>

      <form className="space-y-6">
        {/* Employer Section */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200">
          <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm">
              1
            </span>
            بيانات المنشأة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">اسم المنشأة</label>
              <input
                type="text"
                name="employerName"
                value={data.employerName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">السجل التجاري</label>
              <input
                type="text"
                name="employerCR"
                value={data.employerCR}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">مقر العمل (المدينة)</label>
              <input
                type="text"
                name="employerAddress"
                value={data.employerAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">ممثل المنشأة في العقد</label>
              <input
                type="text"
                name="employerRep"
                value={data.employerRep}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Employee Section */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200">
          <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm">
              2
            </span>
            بيانات العامل
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">الاسم الثلاثي</label>
              <input
                type="text"
                name="employeeName"
                value={data.employeeName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">الجنسية</label>
              <input
                type="text"
                name="employeeNationality"
                value={data.employeeNationality}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">رقم الهوية / الإقامة</label>
              <input
                type="text"
                name="employeeId"
                value={data.employeeId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">الجوال</label>
              <input
                type="text"
                name="employeeMobile"
                value={data.employeeMobile}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none block"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">البريد الإلكتروني</label>
              <input
                type="email"
                name="employeeEmail"
                value={data.employeeEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">العنوان الوطني</label>
              <input
                type="text"
                name="employeeAddress"
                value={data.employeeAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Contract Conditions */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200">
          <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm">
              3
            </span>
            تفاصيل العقد المالي والوظيفي
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-bold text-zinc-700">المسمى الوظيفي</label>
              <input
                type="text"
                name="jobTitle"
                value={data.jobTitle}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">نوع العقد</label>
              <select
                name="contractType"
                value={data.contractType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="fixed">محدد المدة (للسعودي وغير السعودي)</option>
                <option value="indefinite">غير محدد المدة (للسعودي فقط)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">تاريخ المباشرة</label>
              <input
                type="date"
                name="startDate"
                value={data.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none text-right"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">مدة العقد (بالأشهر)</label>
              <input
                type="number"
                name="durationMonths"
                value={data.durationMonths}
                onChange={handleChange}
                disabled={data.contractType === "indefinite"}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">فترة التجربة (بالأيام)</label>
              <input
                type="number"
                name="probationDays"
                value={data.probationDays}
                onChange={handleChange}
                max="180"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 mb-8">
            <h3 className="text-sm font-black text-zinc-900 mb-4">الرواتب والبدلات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">
                  الراتب الأساسي (ر.س)
                </label>
                <input
                  type="number"
                  name="basicSalary"
                  value={data.basicSalary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">
                  بدل السكن (ر.س)
                </label>
                <input
                  type="number"
                  name="housingAllowance"
                  value={data.housingAllowance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">
                  بدل النقل (ر.س)
                </label>
                <input
                  type="number"
                  name="transportAllowance"
                  value={data.transportAllowance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">
                  بدلات أخرى (ر.س)
                </label>
                <input
                  type="number"
                  name="otherAllowances"
                  value={data.otherAllowances}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-200 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-600">إجمالي الراتب:</span>
              <span className="text-xl font-black text-emerald-600">
                {(
                  Number(data.basicSalary) +
                  Number(data.housingAllowance) +
                  Number(data.transportAllowance) +
                  Number(data.otherAllowances)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ر.س
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">
                ساعات العمل الأسبوعية/اليومية
              </label>
              <input
                type="number"
                name="workingHours"
                value={data.workingHours}
                onChange={handleChange}
                max="8"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">أيام العمل الأسبوعية</label>
              <input
                type="number"
                name="workingDays"
                value={data.workingDays}
                onChange={handleChange}
                max="6"
                min="5"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">الإجازة السنوية باليوم</label>
              <select
                name="annualLeaveDays"
                value={data.annualLeaveDays}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="21">21 يوماً (الحد الأدنى)</option>
                <option value="30">30 يوماً</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-8 py-3.5 bg-zinc-900 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <FileSignature className="w-5 h-5" />
            معاينة العقد والإصدار
          </button>
        </div>
      </form>
    </div>
  );
}
