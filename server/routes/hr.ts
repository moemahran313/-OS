import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit } from "../services/utils.js";

const router = Router();

router.post("/nitaqat/calculate", authenticate, async (req: any, res) => {
  const { totalEmployees, saudiEmployees, companySize } = req.body;
  const percentage =
    totalEmployees > 0 ? (saudiEmployees / totalEmployees) * 100 : 0;
  let category = "Red";
  let targetPlatinum = 0;
  let targetGreen = 0;

  let platinumThreshold = 40;
  let greenThreshold = 20;
  
  if (percentage >= platinumThreshold) category = "Platinum";
  else if (percentage >= greenThreshold) category = "Green";
  else if (percentage >= 10) category = "Yellow";

  targetPlatinum = Math.ceil((platinumThreshold / 100) * totalEmployees) - saudiEmployees;
  targetGreen = Math.ceil((greenThreshold / 100) * totalEmployees) - saudiEmployees;

  const recommendations = [];
  if (category !== "Platinum") {
    recommendations.push(`Hire ${Math.max(1, targetPlatinum)} more Saudi national(s) to reach Platinum category.`);
  }
  if (category === "Red" || category === "Yellow") {
     recommendations.push(`Hire ${Math.max(1, targetGreen)} more Saudi national(s) to reach Green category.`);
  }
  recommendations.push(
    "Update contract details for all employees",
    "Ensure all employees are registered in GOSI"
  );

  if (companySize === "Small") {
    recommendations.push(
      "Small companies are exempt from some quotas, check the official portal.",
    );
  } else if (companySize === "Large") {
    recommendations.push(
      "Large companies must strictly adhere to the 40% Platinum threshold.",
    );
  }

  const payload = {
    score: percentage.toFixed(1),
    category,
    recommendations,
  };
  logAudit("NITAQAT", req.body, payload, req);
  res.json(payload);
});

router.post("/workpermit/calculate", authenticate, (req: any, res) => {
  const { totalEmployees, expats, industry, durationYears = 1 } = req.body;
  const exemptCount = expats <= 4 && totalEmployees <= 9 ? expats : 0;
  const payingExpats = expats - exemptCount;

  let baseFee = 9600;
  if (industry === "industrial") baseFee = 7200;
  if (industry === "agricultural") baseFee = 4800;

  const totalFees = payingExpats * baseFee * durationYears;
  
  const payload = {
    totalFees, 
    exemptCount, 
    payingExpats, 
    baseFee,
    durationYears 
  };
  logAudit("WORK_PERMIT", req.body, payload, req);
  res.json(payload);
});

export default router;
