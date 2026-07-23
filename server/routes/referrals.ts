import { Router } from "express";
import { db } from "../services/firebase.ts";
import { authenticate } from "../middleware/auth.ts";

const router = Router();

// 1. Get referral stats and history for the current user
router.get("/my-stats", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const userData = userDoc.data() || {};

    // Auto-generate a referral code if they don't have one
    let referralCode = userData.referralCode;
    if (!referralCode) {
      referralCode = `MUD-${userId.substring(0, 6).toUpperCase()}`;
      await db
        .collection("users")
        .doc(userId)
        .set(
          {
            referralCode,
            rewardPreference: userData.rewardPreference || "discount",
            discountEarnedSar: userData.discountEarnedSar || 0,
            trialExtensionDays: userData.trialExtensionDays || 0,
          },
          { merge: true }
        );
    }

    const rewardPreference = userData.rewardPreference || "discount";
    const discountEarnedSar = userData.discountEarnedSar || 0;
    const trialExtensionDays = userData.trialExtensionDays || 0;

    // Query referrals where this user is the referrer
    const referralsSnap = await db.collection("referrals").where("referrerId", "==", userId).get();

    const history: any[] = [];
    referralsSnap.forEach((doc: any) => {
      history.push({ id: doc.id, ...doc.data() });
    });

    // Sort history by date descending
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      referralCode,
      rewardPreference,
      discountEarnedSar,
      trialExtensionDays,
      history,
    });
  } catch (err: any) {
    console.error("Get referral stats error:", err);
    res.status(500).json({ error: "Failed to load referral program data" });
  }
});

// 2. Generate or customize referral code
router.post("/generate-code", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    let { customCode } = req.body;

    if (!customCode || typeof customCode !== "string") {
      return res.status(400).json({ error: "الرمز البرمجي غير صالح" });
    }

    // Sanitize code: uppercase, trim, alphanumeric
    customCode = customCode
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "");

    if (customCode.length < 3 || customCode.length > 15) {
      return res.status(400).json({ error: "يجب أن يكون الرمز بين 3 إلى 15 حرفاً أو رقماً" });
    }

    // Check if code is already taken by someone else
    const takenSnap = await db.collection("users").where("referralCode", "==", customCode).get();

    let isTaken = false;
    takenSnap.forEach((doc: any) => {
      if (doc.id !== userId) {
        isTaken = true;
      }
    });

    if (isTaken) {
      return res.status(400).json({ error: "هذا الرمز مستخدم بالفعل، يرجى اختيار رمز آخر" });
    }

    // Update user's referral code
    await db.collection("users").doc(userId).set({ referralCode: customCode }, { merge: true });

    res.json({ success: true, referralCode: customCode });
  } catch (err: any) {
    console.error("Generate code error:", err);
    res.status(500).json({ error: "Failed to customize referral code" });
  }
});

// 3. Update reward preference
router.post("/update-preference", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { preference } = req.body;

    if (preference !== "discount" && preference !== "trial") {
      return res.status(400).json({ error: "نوع المكافأة المفضل غير صالح" });
    }

    await db.collection("users").doc(userId).set({ rewardPreference: preference }, { merge: true });

    res.json({ success: true, rewardPreference: preference });
  } catch (err: any) {
    console.error("Update preference error:", err);
    res.status(500).json({ error: "Failed to save preference" });
  }
});

// 4. Verify referral code details for registration page
router.get("/verify-code/:code", async (req: any, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ valid: false, error: "كود الإحالة مطلوب" });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const snap = await db.collection("users").where("referralCode", "==", cleanCode).get();

    if (snap.empty) {
      return res.status(404).json({ valid: false, error: "رمز الإحالة غير صحيح أو غير مفعل" });
    }

    const referrerDoc = snap.docs[0];
    const referrerData = referrerDoc.data() || {};

    res.json({
      valid: true,
      referralCode: cleanCode,
      referrerName: referrerData.name || referrerData.companyName || "مستخدم مدارج",
      rewardPreference: referrerData.rewardPreference || "discount",
      friendBenefit: "فترة تجريبية مجانية ممددة 44 يوماً (بدلاً من 14) + خصم 150 ريال عند الاشتراك",
    });
  } catch (err: any) {
    console.error("Verify code error:", err);
    res.status(500).json({ valid: false, error: "Failed to verify referral code" });
  }
});

// 5. Apply referral when a real user registers
router.post("/apply-referral", authenticate, async (req: any, res) => {
  try {
    const newUserId = req.user.id || req.user.uid;
    const { referrerCode } = req.body;

    if (!referrerCode) {
      return res.status(400).json({ error: "كود الإحالة مطلوب" });
    }

    const cleanCode = String(referrerCode).trim().toUpperCase();
    const referrerSnap = await db.collection("users").where("referralCode", "==", cleanCode).get();

    if (referrerSnap.empty) {
      return res.status(404).json({ error: "كود الإحالة غير صحيح" });
    }

    const referrerDoc = referrerSnap.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data() || {};

    if (referrerId === newUserId) {
      return res.status(400).json({ error: "لا يمكنك استخدام كود الإحالة الخاص بك!" });
    }

    // Check if user already has an applied referral
    const existingRefSnap = await db.collection("referrals").where("referredUserId", "==", newUserId).get();
    if (!existingRefSnap.empty) {
      return res.status(400).json({ error: "تم استخدام كود إحالة لهذا الحساب مسبقاً" });
    }

    // Fetch new user details
    const newUserDoc = await db.collection("users").doc(newUserId).get();
    const newUserData = newUserDoc.data() || {};

    // Calculate extended trial (14 + 30 days = 44 days)
    const extendedTrialEnd = new Date();
    extendedTrialEnd.setDate(extendedTrialEnd.getDate() + 44);

    // Update new user subscription status
    await db.collection("users").doc(newUserId).set(
      {
        referredBy: cleanCode,
        subscriptionStatus: "extended_trial",
        trialEndDate: extendedTrialEnd.toISOString(),
      },
      { merge: true }
    );

    // Reward referrer based on preference
    const referrerPreference = referrerData.rewardPreference || "discount";
    let updatedDiscount = referrerData.discountEarnedSar || 0;
    let updatedTrialDays = referrerData.trialExtensionDays || 0;

    let rewardDesc = "";
    if (referrerPreference === "trial") {
      updatedTrialDays += 30;
      rewardDesc = "تمديد الفترة التجريبية مجاناً لمدة 30 يوماً";
      await db.collection("users").doc(referrerId).set({ trialExtensionDays: updatedTrialDays }, { merge: true });
    } else {
      updatedDiscount += 150;
      rewardDesc = "خصم 150 ريال سعودي على التجديد القادم";
      await db.collection("users").doc(referrerId).set({ discountEarnedSar: updatedDiscount }, { merge: true });
    }

    // Record referral
    const referralRecordId = `${cleanCode}_${newUserId}`;
    const referralRecord = {
      id: referralRecordId,
      referrerId,
      referredUserId: newUserId,
      referredUserName: newUserData.name || "عميل جديد",
      referredUserEmail: newUserData.email || "",
      status: "signed_up",
      rewardType: referrerPreference,
      rewardValueDescription: rewardDesc,
      createdAt: new Date().toISOString(),
    };

    await db.collection("referrals").doc(referralRecordId).set(referralRecord);

    // Send Notification to Referrer
    await db.collection("notifications").add({
      userId: referrerId,
      title: "إحالة ناجحة جديدة! 🎉",
      message: `سجل المستخدم ${newUserData.name || "عميل جديد"} بنجاح باستخدام كود الإحالة الخاص بك. تم تطبيق المكافأة (${rewardDesc}) لحسابك!`,
      type: "referral",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      rewardDescription: rewardDesc,
      trialEndDate: extendedTrialEnd.toISOString(),
    });
  } catch (err: any) {
    console.error("Apply referral error:", err);
    res.status(500).json({ error: "Failed to apply referral code" });
  }
});

// 6. Direct Referral Signup Execution
router.post("/simulate-signup", authenticate, async (req: any, res) => {
  try {
    const referrerId = req.user.id || req.user.uid;
    const { email, name, referrerCode } = req.body;

    if (!email || !name || !referrerCode) {
      return res.status(400).json({ error: "البريد الإلكتروني والاسم والرمز مطلوبون لتسجيل الإحالة" });
    }

    // 1. Get the referrer user data
    let referrerDocSnap = await db.collection("users").doc(referrerId).get();
    if (!referrerDocSnap.exists) {
      return res.status(404).json({ error: "Referrer profile not found" });
    }
    const referrerData = referrerDocSnap.data() || {};

    // 2. Check if a real user account exists with this email or create persistent record
    const userByEmailSnap = await db.collection("users").where("email", "==", email).get();
    let referredUserId = "";
    if (!userByEmailSnap.empty) {
      referredUserId = userByEmailSnap.docs[0].id;
    } else {
      referredUserId = "ref_usr_" + Date.now().toString(36);
    }

    const extendedTrialEnd = new Date();
    extendedTrialEnd.setDate(extendedTrialEnd.getDate() + 44);

    const referredUserPayload = {
      id: referredUserId,
      uid: referredUserId,
      email,
      name,
      companyName: `شركة ${name} للتجارة`,
      role: "Administrator",
      referredBy: referrerCode,
      subscriptionStatus: "extended_trial",
      trialEndDate: extendedTrialEnd.toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(referredUserId).set(referredUserPayload, { merge: true });

    // 3. Apply reward to the referrer depending on preference
    const referrerPreference = referrerData.rewardPreference || "discount";
    let updatedDiscount = referrerData.discountEarnedSar || 0;
    let updatedTrialDays = referrerData.trialExtensionDays || 0;

    let rewardDesc = "";
    if (referrerPreference === "trial") {
      updatedTrialDays += 30;
      rewardDesc = "تمديد الفترة التجريبية مجاناً لمدة 30 يوماً";
      await db.collection("users").doc(referrerId).set({ trialExtensionDays: updatedTrialDays }, { merge: true });
    } else {
      updatedDiscount += 150;
      rewardDesc = "خصم 150 ريال سعودي على التجديد القادم";
      await db.collection("users").doc(referrerId).set({ discountEarnedSar: updatedDiscount }, { merge: true });
    }

    // 4. Create the referral tracking record in Firestore
    const referralRecordId = `${referrerCode}_${referredUserId}`;
    const referralRecord = {
      id: referralRecordId,
      referrerId,
      referredUserId,
      referredUserName: name,
      referredUserEmail: email,
      status: "signed_up",
      rewardType: referrerPreference,
      rewardValueDescription: rewardDesc,
      createdAt: new Date().toISOString(),
    };

    await db.collection("referrals").doc(referralRecordId).set(referralRecord);

    // 5. Send Notification to Referrer
    await db.collection("notifications").add({
      userId: referrerId,
      title: "إحالة ناجحة جديدة! 🎉",
      message: `سجل المستخدم ${name} بنجاح باستخدام رابط الإحالة الخاص بك. تم تطبيق المكافأة (${rewardDesc}) لحسابك ومُنح صديقك فترة تجريبية ممددة لـ 44 يوماً!`,
      type: "referral",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      referredUser: referredUserPayload,
      referralRecord,
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to process referral signup" });
  }
});

// 7. Referral Payment Completion Execution
router.post("/simulate-payment", authenticate, async (req: any, res) => {
  try {
    const referrerId = req.user.id || req.user.uid;
    const { referredUserId } = req.body;

    if (!referredUserId) {
      return res.status(400).json({ error: "معرف المستخدم الموصى به مطلوب" });
    }

    // 1. Get referral record
    const referralsSnap = await db
      .collection("referrals")
      .where("referredUserId", "==", referredUserId)
      .get();

    let referralDoc: any = null;
    referralsSnap.forEach((doc: any) => {
      referralDoc = doc;
    });

    if (!referralDoc) {
      return res.status(404).json({ error: "سجل الإحالة غير موجود" });
    }

    const referralData = referralDoc.data();
    if (referralData.status === "completed") {
      return res.status(400).json({ error: "تم إكمال مكافأة الدفعة الأولى مسبقاً لهذا العميل" });
    }

    // 2. Get Referrer details to apply additional payment completion reward
    const referrerDocSnap = await db.collection("users").doc(referrerId).get();
    if (!referrerDocSnap.exists) {
      return res.status(404).json({ error: "Referrer profile not found" });
    }
    const referrerData = referrerDocSnap.data() || {};

    const rewardPreference = referrerData.rewardPreference || "discount";
    let updatedDiscount = referrerData.discountEarnedSar || 0;
    let updatedTrialDays = referrerData.trialExtensionDays || 0;

    let additionalRewardDesc = "";
    if (rewardPreference === "trial") {
      updatedTrialDays += 30;
      additionalRewardDesc = "تمديد إضافي لـ 30 يوماً مجاناً";
      await db.collection("users").doc(referrerId).set({ trialExtensionDays: updatedTrialDays }, { merge: true });
    } else {
      updatedDiscount += 150;
      additionalRewardDesc = "خصم إضافي بقيمة 150 ريال سعودي";
      await db.collection("users").doc(referrerId).set({ discountEarnedSar: updatedDiscount }, { merge: true });
    }

    // 3. Update referred user subscription status to Paid and give friend credit/reward
    await db.collection("users").doc(referredUserId).set(
      {
        subscriptionStatus: "paid",
        referredUserDiscountEarnedSar: 150,
      },
      { merge: true }
    );

    // 4. Update referral record status
    const currentRewardVal = referralData.rewardValueDescription;
    await db
      .collection("referrals")
      .doc(referralDoc.id)
      .set(
        {
          status: "completed",
          completedAt: new Date().toISOString(),
          rewardValueDescription: `${currentRewardVal} + ${additionalRewardDesc} (دفعة أولى)`,
        },
        { merge: true }
      );

    // 5. Send Notification to Referrer
    await db.collection("notifications").add({
      userId: referrerId,
      title: "دفع الإحالة مكتمل! 💳",
      message: `أكمل ${referralData.referredUserName} دفعته الأولى بنجاح. تم مضاعفة مكافأتك بإضافة (${additionalRewardDesc}) لحسابك!`,
      type: "referral_payment",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      status: "completed",
      additionalReward: additionalRewardDesc,
    });
  } catch (err: any) {
    console.error("Payment error:", err);
    res.status(500).json({ error: "Failed to process payment completion" });
  }
});

export default router;
