import { Router } from "express";
import { db } from "../services/firebase.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/me", authenticate, async (req: any, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.id).get();
    if (!userDoc.exists)
      return res.status(404).json({ error: "User profile not found in Firestore" });

    res.json({ id: req.user.id, ...userDoc.data() });
  } catch (err) {
    console.error("Fetch me error:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

export default router;
