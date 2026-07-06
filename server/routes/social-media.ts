import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit, generateContentWithRetry } from "../services/utils.js";
import { db } from "../services/firebase.js";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// Helper to get Gemini Client
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is required. Configure it in Settings.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ==========================================
// CONNECTED ACCOUNTS
// ==========================================

// List Social Accounts
router.get("/accounts", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("social_accounts").where("userId", "==", req.user.uid).get();
    let accounts = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Pre-populate realistic social accounts if none exist
    if (accounts.length === 0) {
      const defaults = [
        {
          platform: "linkedin",
          handle: "Madarij OS",
          name: "Madarij OS Corporate",
          avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
          followers: 12500,
          status: "Connected",
          userId: req.user.uid,
          createdAt: new Date().toISOString(),
        },
        {
          platform: "instagram",
          handle: "madarij_os",
          name: "Madarij OS Lifestyle",
          avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150",
          followers: 28400,
          status: "Connected",
          userId: req.user.uid,
          createdAt: new Date().toISOString(),
        },
        {
          platform: "twitter",
          handle: "Madarij_OS",
          name: "Madarij OS Tech",
          avatar: "https://images.unsplash.com/photo-1611605698335-8b15d27e03f3?w=150",
          followers: 8500,
          status: "Connected",
          userId: req.user.uid,
          createdAt: new Date().toISOString(),
        },
        {
          platform: "facebook",
          handle: "MadarijOS",
          name: "Madarij OS Business",
          avatar: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=150",
          followers: 4500,
          status: "Connected",
          userId: req.user.uid,
          createdAt: new Date().toISOString(),
        },
        {
          platform: "tiktok",
          handle: "madarijos",
          name: "Madarij Shorts",
          avatar: "https://images.unsplash.com/photo-1596495578065-6e076baf188f?w=150",
          followers: 42100,
          status: "Connected",
          userId: req.user.uid,
          createdAt: new Date().toISOString(),
        },
        {
          platform: "youtube",
          handle: "MadarijOS_Tube",
          name: "Madarij Academy",
          avatar: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=150",
          followers: 15400,
          status: "Connected",
          userId: req.user.uid,
          createdAt: new Date().toISOString(),
        },
        {
          platform: "threads",
          handle: "@madarij_os",
          name: "Madarij Threads",
          avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150",
          followers: 3100,
          status: "Connected",
          userId: req.user.uid,
          createdAt: new Date().toISOString(),
        },
        {
          platform: "pinterest",
          handle: "madarij_pins",
          name: "Madarij Visuals",
          avatar: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=150",
          followers: 1200,
          status: "Connected",
          userId: req.user.uid,
          createdAt: new Date().toISOString(),
        },
      ];

      const savedList = [];
      for (const acc of defaults) {
        const docRef = await db.collection("social_accounts").add(acc);
        savedList.push({ id: docRef.id, ...acc });
      }
      return res.json(savedList);
    }
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Connect Social Account
router.post("/accounts", authenticate, async (req: any, res) => {
  try {
    const accountData = {
      ...req.body,
      userId: req.user.uid,
      status: "Connected",
      followers: req.body.followers || Math.round(Math.random() * 5000 + 100),
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("social_accounts").add(accountData);
    res.status(201).json({ id: docRef.id, ...accountData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete/Disconnect Social Account
router.delete("/accounts/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const accountRef = db.collection("social_accounts").doc(id);
    const snap = await accountRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Account not found" });
    if (snap.data()?.userId !== req.user.uid)
      return res.status(403).json({ error: "Unauthorized" });

    await accountRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SCHEDULER & CALENDAR POSTS
// ==========================================

// List Posts
router.get("/posts", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("social_posts").where("userId", "==", req.user.uid).get();
    const posts = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Pre-populate high-quality, relevant scheduled and published posts if empty
    if (posts.length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      dayAfter.setHours(14, 30, 0, 0);

      const defaults = [
        {
          content:
            "🚀 يسعدنا الإعلان عن إطلاق ميزة الفوترة الإلكترونية الذكية المتوافقة تماماً مع متطلبات هيئة الزكاة والضريبة والجمارك (المرحلة الثانية)! تحوّل رقمياً اليوم بلمسة زر واحده. #الفوترة_الإلكترونية #زد_سلة #مشاريع_سعودية",
          platforms: ["linkedin", "twitter", "facebook"],
          status: "Scheduled",
          scheduledAt: tomorrow.toISOString(),
          imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
          userId: req.user.uid,
          authorName: "أحمد العتيبي",
          approvalStatus: "Approved",
          createdAt: new Date().toISOString(),
        },
        {
          content:
            "كيف تدير رواتب موظفيك بكفاءة دون أخطاء محاسبية؟ إليك 5 نصائح ذهبية لتبسيط حسابات النطاقات والبدلات عبر نظام الرواتب المؤتمت في Madarij OS. 💼💡 #إدارة_الموارد_البشرية #محاسبة",
          platforms: ["instagram", "linkedin"],
          status: "Pending Approval",
          scheduledAt: dayAfter.toISOString(),
          imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
          userId: req.user.uid,
          authorName: "سارة القحطاني",
          approvalStatus: "Pending",
          createdAt: new Date().toISOString(),
        },
        {
          content:
            "We are thrilled to be featured on TechCloud as one of the most promising enterprise operating systems in the MENA region! A big thank you to our incredible team and partners. 🌟📈 #SaaS #MENAtech #MadarijOS",
          platforms: ["twitter", "linkedin"],
          status: "Published",
          scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
          userId: req.user.uid,
          authorName: "أحمد العتيبي",
          approvalStatus: "Approved",
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          metrics: { reach: 8450, engagement: 912, clicks: 430, shares: 85 },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const savedList = [];
      for (const pst of defaults) {
        const docRef = await db.collection("social_posts").add(pst);
        savedList.push({ id: docRef.id, ...pst });
      }
      return res.json(savedList);
    }
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Post
router.post("/posts", authenticate, async (req: any, res) => {
  try {
    const postData = {
      ...req.body,
      userId: req.user.uid,
      status: req.body.status || "Scheduled",
      approvalStatus: req.body.approvalStatus || "Pending",
      authorName: req.user.name || "عضو الفريق",
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("social_posts").add(postData);
    logAudit("SocialMedia", { action: "Create Scheduled Post", id: docRef.id }, postData, req);
    res.status(201).json({ id: docRef.id, ...postData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Post (Edit draft/scheduled post)
router.put("/posts/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const postRef = db.collection("social_posts").doc(id);
    const snap = await postRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Post not found" });
    if (snap.data()?.userId !== req.user.uid)
      return res.status(403).json({ error: "Unauthorized" });

    await postRef.update(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve Scheduled Post
router.post("/posts/:id/approve", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const postRef = db.collection("social_posts").doc(id);
    const snap = await postRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Post not found" });
    if (snap.data()?.userId !== req.user.uid)
      return res.status(403).json({ error: "Unauthorized" });

    const updateData = {
      approvalStatus: "Approved",
      status: "Scheduled",
    };
    await postRef.update(updateData);
    logAudit("SocialMedia", { action: "Approve Post", id }, updateData, req);
    res.json({ id, ...updateData, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Post
router.delete("/posts/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const postRef = db.collection("social_posts").doc(id);
    const snap = await postRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Post not found" });
    if (snap.data()?.userId !== req.user.uid)
      return res.status(403).json({ error: "Unauthorized" });

    await postRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// UNIFIED INBOX & COMMENTS
// ==========================================

// Get Unified Inbox / Comments feed
router.get("/inbox", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("social_inbox").where("userId", "==", req.user.uid).get();
    let items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (items.length === 0) {
      const defaults = [
        {
          platform: "instagram",
          authorName: "خالد الحربي",
          authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          message: "هل ميزة الربط مع ZATCA تدعم الفواتير المبسطة وفواتير الأعمال B2B معاً؟",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
          status: "Unread",
          type: "Comment",
          postTitle: "إطلاق ميزة الفوترة الإلكترونية الذكية",
          replies: [],
          userId: req.user.uid,
        },
        {
          platform: "twitter",
          authorName: "أمل الشهري",
          authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
          message: "Excellent customer service and highly intuitive UI, keep it up!",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "Read",
          type: "Mention",
          postTitle: "TechCloud Feature",
          replies: [
            {
              author: "Madarij OS Support",
              text: "Thank you Amal! We are delighted to assist your enterprise journey.",
              timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
            },
          ],
          userId: req.user.uid,
        },
        {
          platform: "linkedin",
          authorName: "Eng. Sultan Al-Sudairi",
          authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
          message: "هل من الممكن جدولة عرض توضيحي (Demo) مخصص لقطاع التجزئة وربط الفروع؟",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: "Unread",
          type: "Direct Message",
          replies: [],
          userId: req.user.uid,
        },
      ];

      const savedList = [];
      for (const item of defaults) {
        const docRef = await db.collection("social_inbox").add(item);
        savedList.push({ id: docRef.id, ...item });
      }
      return res.json(savedList);
    }
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to comment/DM
router.post("/inbox/:id/reply", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    const inboxRef = db.collection("social_inbox").doc(id);
    const snap = await inboxRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Inbox item not found" });
    if (snap.data()?.userId !== req.user.uid)
      return res.status(403).json({ error: "Unauthorized" });

    const currentReplies = snap.data()?.replies || [];
    const updatedReplies = [
      ...currentReplies,
      {
        author: "Madarij OS Team",
        text: replyText,
        timestamp: new Date().toISOString(),
      },
    ];

    await inboxRef.update({
      replies: updatedReplies,
      status: "Replied",
    });

    res.json({ success: true, replies: updatedReplies });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// BRAND MONITORING & SENTIMENT ANALYSIS
// ==========================================

// Get Brand Mentions
router.get("/monitoring", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("social_monitoring").where("userId", "==", req.user.uid).get();
    let mentions = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (mentions.length === 0) {
      const defaults = [
        {
          source: "Twitter",
          author: "@saudi_tech_fan",
          text: "نظام مداريج OS للأعمال يقدّم تجربة استثنائية في ربط العمليات وتسيير الرواتب تلقائياً. تطور رائع!",
          sentiment: "Positive",
          keyword: "مداريج OS",
          reach: 4500,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          userId: req.user.uid,
        },
        {
          source: "Web Forum",
          author: "محاسب سعودي محترف",
          text: "هل واجه أحدكم مشكلة في موازنة القيود الافتتاحية على نظام مداريج الجديد؟ الدعم الفني متجاوب لكن يحتاج لسرعة أكبر.",
          sentiment: "Neutral",
          keyword: "مداريج",
          reach: 1200,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          userId: req.user.uid,
        },
        {
          source: "LinkedIn",
          author: "Yaser Al-Ghamdi",
          text: "Empowering Saudi SaaS ecosystems with tools like Madarij OS will speed up digital transformation tremendously.",
          sentiment: "Positive",
          keyword: "Madarij OS",
          reach: 15000,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          userId: req.user.uid,
        },
      ];

      const savedList = [];
      for (const m of defaults) {
        const docRef = await db.collection("social_monitoring").add(m);
        savedList.push({ id: docRef.id, ...m });
      }
      return res.json(savedList);
    }
    res.json(mentions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// AI-POWERED COPILOT GENERATION ENDPOINTS
// ==========================================

// AI Content Generation (Posts, Reels script, Captions, Hashtags, SEO translations)
router.post("/ai/generate", authenticate, async (req: any, res) => {
  try {
    const { type, platform, promptText, tone, length, language } = req.body;
    const ai = getGeminiClient();

    let systemContext = `You are a world-class enterprise social media marketing strategist, copywriter, and growth engineer. You are extremely proficient in driving high conversion and click-through rates across platforms like LinkedIn, Instagram, TikTok, Threads, and Twitter.`;

    let userPrompt = "";
    if (type === "post") {
      userPrompt = `Generate a high-performing post for ${platform || "LinkedIn"}.
Context / Core Idea: ${promptText}
Tone: ${tone || "professional"}
Preferred Length: ${length || "medium"}
Language: ${language || "ar"}

The response must be in strict JSON format. Do not use markdown blocks or backticks. Translate fully to the requested language.
JSON Structure:
{
  "postContent": "Complete written post body with appropriate line-breaks and platform formatting.",
  "hashtags": ["tag1", "tag2", "tag3"],
  "alternatives": [
    "Compelling alternative short hook headline 1",
    "Compelling alternative short hook headline 2"
  ],
  "imagePrompt": "Detailed visual generation prompt for an AI designer to illustrate this post.",
  "optimalSendTime": "Best day and time to publish this specifically on ${platform} for max CTR."
}`;
    } else if (type === "reels_script") {
      userPrompt = `Draft an engaging, high-retention video/reel script for ${platform || "TikTok/Instagram"}.
Core Topic: ${promptText}
Tone: ${tone || "energetic & engaging"}
Language: ${language || "ar"}

The response must be in strict JSON format. Do not use markdown blocks. Translate fully.
JSON Structure:
{
  "hook": "0-3 seconds high-retention opening line.",
  "sceneOutline": [
    { "time": "0:00 - 0:10", "visual": "What to show on screen", "audio": "Voiceover words or sound cues" },
    { "time": "0:10 - 0:30", "visual": "What to show on screen", "audio": "Deepening value point" },
    { "time": "0:30 - 0:45", "visual": "Call to action focus", "audio": "Closing hook / Call to action statement" }
  ],
  "caption": "Optimized caption to post with this video/reel.",
  "hashtags": ["reels", "trending", "business"]
}`;
    } else {
      // General translation / Caption generation
      userPrompt = `Generate optimized caption alternatives or translate this copy into ${language || "ar"}:
Original Text: ${promptText}
Tone: ${tone || "engaging"}

The response must be in strict JSON format. Do not use markdown blocks.
JSON Structure:
{
  "optimizedText": "Main translated or optimized high-impact caption text",
  "hashtags": ["tag1", "tag2", "tag3"]
}`;
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: `${systemContext}\n\n${userPrompt}` }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI copilot.");
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error("AI Social Media copilot generation failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Posting Schedule and Engagement Recommendations
router.get("/ai/recommendations", authenticate, async (req: any, res) => {
  try {
    const ai = getGeminiClient();
    const prompt = `You are an AI growth strategist. Recommend an optimal posting schedule and 4 key social growth recommendations for Madarij OS, a modern enterprise business suite.
    Provide the response in Arabic and English, depending on standard GCC timezone context.
    
    The response must be in strict JSON format. Do not use markdown blocks.
    JSON Structure:
    {
      "recommendations": [
        { "title": "B2B Focus days", "text": "Reasoning about posting on LinkedIn/Twitter during Sun-Thu mornings" },
        { "title": "Visual Storytelling", "text": "Tips on Reels/Instagram for showing office/startup life" },
        { "title": "Interactive Content", "text": "Polls, Threads, and short checklists to drive clicks" }
      ],
      "bestTimes": [
        { "platform": "LinkedIn", "day": "Tuesday", "time": "10:00 AM AST" },
        { "platform": "Twitter / X", "day": "Sunday", "time": "1:00 PM AST" },
        { "platform": "Instagram", "day": "Thursday", "time": "8:00 PM AST" }
      ]
    }`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI recommendation planner.");
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
