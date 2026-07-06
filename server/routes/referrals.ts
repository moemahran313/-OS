import { Router } from "express";
import { db } from "../services/firebase.js";
import { authenticate } from "../middleware/auth.js";

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

// 4. Simulate a referred user signup (FOR PROTOTYPING / PLAYGROUND)
router.post("/simulate-signup", authenticate, async (req: any, res) => {
  try {
    const referrerId = req.user.id;
    const { email, name, referrerCode } = req.body;

    if (!email || !name || !referrerCode) {
      return res
        .status(400)
        .json({ error: "البريد الإلكتروني والاسم والرمز مطلوبون لتجربة المحاكاة" });
    }

    // 1. Get the referrer user data
    let referrerDocSnap = await db.collection("users").doc(referrerId).get();
    if (!referrerDocSnap.exists) {
      return res.status(404).json({ error: "Referrer profile not found" });
    }
    const referrerData = referrerDocSnap.data() || {};

    // 2. Create the mock referred user in local_fallback / firestore
    const mockReferredUserId = "mock_ref_" + Math.random().toString(36).substring(2, 9);

    // Referred friend gets 30 days extended trial for registering through link
    const originalTrialEnd = new Date();
    originalTrialEnd.setDate(originalTrialEnd.getDate() + 14); // standard 14 days trial
    const extendedTrialEnd = new Date();
    extendedTrialEnd.setDate(extendedTrialEnd.getDate() + 14 + 30); // standard 14 + 30 days reward

    const referredUserPayload = {
      id: mockReferredUserId,
      uid: mockReferredUserId,
      email,
      name,
      companyName: `شركة ${name} للتجارة`,
      role: "Administrator",
      referredBy: referrerCode,
      subscriptionStatus: "extended_trial",
      trialEndDate: extendedTrialEnd.toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(mockReferredUserId).set(referredUserPayload);

    // 3. Apply reward to the referrer depending on preference
    const referrerPreference = referrerData.rewardPreference || "discount";
    let updatedDiscount = referrerData.discountEarnedSar || 0;
    let updatedTrialDays = referrerData.trialExtensionDays || 0;

    let rewardDesc = "";
    if (referrerPreference === "trial") {
      updatedTrialDays += 30; // 30 days trial reward
      rewardDesc = "تمديد الفترة التجريبية مجاناً لمدة 30 يوماً";
      await db
        .collection("users")
        .doc(referrerId)
        .set({ trialExtensionDays: updatedTrialDays }, { merge: true });
    } else {
      updatedDiscount += 150; // 150 SAR discount reward
      rewardDesc = "خصم 150 ريال سعودي على التجديد القادم";
      await db
        .collection("users")
        .doc(referrerId)
        .set({ discountEarnedSar: updatedDiscount }, { merge: true });
    }

    // 4. Create the referral tracking record
    const referralRecordId = `${referrerCode}_${mockReferredUserId}`;
    const referralRecord = {
      id: referralRecordId,
      referrerId,
      referredUserId: mockReferredUserId,
      referredUserName: name,
      referredUserEmail: email,
      status: "signed_up", // initial status
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
    console.error("Simulate signup error:", err);
    res.status(500).json({ error: "Failed to simulate signup" });
  }
});

// 5. Simulate first payment of a referred user (FOR PROTOTYPING / PLAYGROUND)
router.post("/simulate-payment", authenticate, async (req: any, res) => {
  try {
    const referrerId = req.user.id;
    const { referredUserId } = req.body;

    if (!referredUserId) {
      return res.status(400).json({ error: "معرف المستخدم الموصى به مطلوب للمحاكاة" });
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
      updatedTrialDays += 30; // extra 30 days
      additionalRewardDesc = "تمديد إضافي لـ 30 يوماً مجاناً";
      await db
        .collection("users")
        .doc(referrerId)
        .set({ trialExtensionDays: updatedTrialDays }, { merge: true });
    } else {
      updatedDiscount += 150; // extra 150 SAR discount
      additionalRewardDesc = "خصم إضافي بقيمة 150 ريال سعودي";
      await db
        .collection("users")
        .doc(referrerId)
        .set({ discountEarnedSar: updatedDiscount }, { merge: true });
    }

    // 3. Update referred user subscription status to Paid and give friend credit/reward
    await db.collection("users").doc(referredUserId).set(
      {
        subscriptionStatus: "paid",
        referredUserDiscountEarnedSar: 150, // friend gets discount reward too!
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
    console.error("Simulate payment error:", err);
    res.status(500).json({ error: "Failed to simulate payment" });
  }
});

export default router;
