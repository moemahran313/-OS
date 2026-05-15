import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit } from "../services/utils.js";

const router = Router();

router.post("/match", authenticate, (req: any, res) => {
  const { occupation } = req.body;
  
  const isicDatabase = [
    { code: "7110", desc: "الأنشطة الهندسية والاستشارات الهندسية", keywords: ["مهندس", "هندسة", "تصميم", "معماري", "مدني", "استشارة"] },
    { code: "6201", desc: "أنشطة البرمجة الحاسوبية", keywords: ["برمج", "تطوير", "سوفتوير", "تطبيق", "موقع", "كود", "حاسب"] },
    { code: "4100", desc: "تشييد المباني", keywords: ["بناء", "تشييد", "مقاولات", "عقار", "مبنى", "عمارة"] },
    { code: "5610", desc: "أنشطة المطاعم والخدمات الغذائية", keywords: ["مطعم", "أكل", "غذاء", "مقهى", "طعام", "طبخ"] },
    { code: "8620", desc: "أنشطة الممارسات الطبية وأطباء الأسنان", keywords: ["طبيب", "صحة", "مستشفى", "عيادة", "أسنان", "علاج"] },
  ];

  const searchTerms = (occupation || "").toLowerCase().split(/\s+/);
  let matchedItems: any[] = [];

  isicDatabase.forEach(item => {
    let score = 0;
    item.keywords.forEach(kw => {
      searchTerms.forEach(term => {
        if (term.includes(kw) || kw.includes(term)) {
          score += 30;
        }
      });
    });
    if (item.desc.includes(occupation)) score += 50;
    if (score > 0) {
      matchedItems.push({
        activityDescription: item.desc,
        isicCode: item.code,
        confidence: Math.min(99, score),
      });
    }
  });

  if (matchedItems.length === 0) {
    matchedItems = [{
      activityDescription: "أنشطة خدمات دعم الأعمال الأخرى ن.ي.م",
      isicCode: "8299",
      confidence: 40,
    }];
  }

  matchedItems.sort((a, b) => b.confidence - a.confidence);
  const payload = { matches: matchedItems.slice(0, 5) };
  logAudit("ISIC4", req.body, payload, req);
  res.json(payload);
});

export default router;
