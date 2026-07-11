import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { logAudit, generateContentWithRetry } from "../services/utils.ts";
import { db } from "../services/firebase.ts";
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
// CONNECTED ACCOUNTS & OAUTH 2.0
// ==========================================

// Initiate OAuth flow
router.get("/connect/:platform", authenticate, (req: any, res) => {
  const { platform } = req.params;
  // This is a placeholder for real OAuth redirection.
  // E.g., for Facebook: `https://www.facebook.com/v16.0/dialog/oauth?client_id=...&redirect_uri=...`
  const redirectUri = encodeURIComponent(
    `https://${req.get("host")}/api/social-media/callback/${platform}`
  );
  const simulatedConsentUrl = `/api/social-media/callback/${platform}?code=simulated_auth_code_12345`;

  res.json({ url: simulatedConsentUrl, message: `Redirect to ${platform} consent screen` });
});

// OAuth Callback
router.get("/callback/:platform", authenticate, async (req: any, res) => {
  const { platform } = req.params;
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    // Simulated token exchange
    const accountData = {
      platform,
      handle: `${platform}_user`,
      name: `Connected ${platform} Account`,
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
      followers: Math.floor(Math.random() * 10000) + 100,
      status: "Connected",
      userId: req.user.uid,
      accessToken: `simulated_access_token_${Date.now()}`,
      refreshToken: `simulated_refresh_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiry
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("social_accounts").add(accountData);
    res.redirect(`/social-media?connected=${platform}`);
  } catch (error: any) {
    console.error(`OAuth Callback Error for ${platform}:`, error);
    res.status(500).json({ error: "Failed to connect account" });
  }
});

// List Social Accounts
router.get("/accounts", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("social_accounts").where("userId", "==", req.user.uid).get();
    let accounts = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (accounts.length === 0) {
      // Return empty instead of mock, wait for real connection
      return res.json([]);
    }
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Connect Social Account (Manual fallback)
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

    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Post (With Platform Overrides)
router.post("/posts", authenticate, async (req: any, res) => {
  try {
    const postData = {
      ...req.body,
      userId: req.user.uid,
      status: req.body.status || "Scheduled",
      approvalStatus: req.body.approvalStatus || "Pending",
      authorName: req.user.name || "Team Member",
      createdAt: new Date().toISOString(),
    };
    // req.body.overrides can contain { twitter: { content: '...', media: '...' }, linkedin: {...} }
    const docRef = await db.collection("social_posts").add(postData);
    logAudit("SocialMedia", { action: "Create Scheduled Post", id: docRef.id }, postData, req);
    res.status(201).json({ id: docRef.id, ...postData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Post (Edit draft/scheduled post, reschedule drag-and-drop)
router.patch("/posts/:id", authenticate, async (req: any, res) => {
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

// Publish Post Now
router.post("/posts/publish/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const postRef = db.collection("social_posts").doc(id);
    const snap = await postRef.get();

    if (!snap.exists) return res.status(404).json({ error: "Post not found" });
    const post = snap.data();
    if (post?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    // Fetch accounts to get tokens
    const accountsSnap = await db
      .collection("social_accounts")
      .where("userId", "==", req.user.uid)
      .get();
    const accounts = accountsSnap.docs.map((doc) => doc.data());

    // Simulated API Call to real platforms
    for (const platform of post?.platforms || []) {
      const account = accounts.find((a) => a.platform === platform);
      if (account) {
        console.log(`Publishing to ${platform} via token ${account.accessToken}`);
        // e.g., axios.post('https://graph.facebook.com/...', { access_token: account.accessToken, message: post.content })
      }
    }

    const updateData = {
      status: "Published",
      publishedAt: new Date().toISOString(),
    };
    await postRef.update(updateData);
    logAudit("SocialMedia", { action: "Publish Post", id }, updateData, req);

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
// DEEP ANALYTICS & ATTRIBUTION TRACKING
// ==========================================

// Lightweight link tracker (would normally be at root level /l/:id, but under api for now)
router.get("/l/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    const linkRef = db.collection("social_links").doc(id);
    const snap = await linkRef.get();

    if (!snap.exists) return res.status(404).send("Link not found");
    const linkData = snap.data();

    // Log click event
    await db.collection("social_clicks").add({
      linkId: id,
      postId: linkData?.postId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.redirect(linkData?.url || "/");
  } catch (error) {
    res.status(500).send("Error tracking link");
  }
});

// ==========================================
// UNIFIED INBOX & WEBHOOK ENGINE
// ==========================================

// Webhook Receiver
router.post("/webhooks/:platform", async (req: any, res) => {
  const { platform } = req.params;
  const payload = req.body;
  // Verify HMAC signature here...

  try {
    // E.g., incoming comment
    const inboxItem = {
      platform,
      authorName: payload.author || "Web User",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      message: payload.message || "Incoming event",
      timestamp: new Date().toISOString(),
      status: "Unresolved",
      type: payload.type || "Comment",
      replies: [],
      // Would match with a userId in a real mapping, assigning a static one for demo
      userId: payload.userId || "demo-user-id",
    };

    await db.collection("social_inbox").add(inboxItem);
    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Error processing webhook");
  }
});

// Get Unified Inbox / Comments feed
router.get("/inbox", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("social_inbox").where("userId", "==", req.user.uid).get();
    let items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
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
        author: req.user.name || "Agent",
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
    res.json(mentions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Run live listening simulation
router.post("/monitoring/listen", authenticate, async (req: any, res) => {
  try {
    const { keyword } = req.body;

    // Simulating streaming parser fetching mentions
    const simulatedMentions = [
      `Just tried out ${keyword} and it completely changed our workflow. Excellent tool!`,
      `Does anyone know how to configure the new update for ${keyword}? Support is a bit slow.`,
      `${keyword} is okay, but compared to AcmeCorp it lacks a few features.`,
    ];

    const ai = getGeminiClient();
    const systemContext = `You are a sentiment analysis and entity extraction engine. Score brand mentions in real-time.`;

    const results = [];

    for (const text of simulatedMentions) {
      const userPrompt = `Analyze this social mention: "${text}"
       Provide the response in strict JSON format:
       {
         "sentiment": "Positive" | "Neutral" | "Negative",
         "urgency": "High" | "Medium" | "Low",
         "entities": ["list", "of", "competitors", "or", "features"]
       }`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: `${systemContext}\n\n${userPrompt}` }] }],
        config: { responseMimeType: "application/json" },
      });

      const parsed = JSON.parse(response.text || "{}");
      const mention = {
        source: ["Twitter", "LinkedIn", "Web Forum"][Math.floor(Math.random() * 3)],
        author: "@user_" + Math.floor(Math.random() * 1000),
        text,
        sentiment: parsed.sentiment || "Neutral",
        urgency: parsed.urgency || "Low",
        entities: parsed.entities || [],
        keyword,
        reach: Math.floor(Math.random() * 10000),
        createdAt: new Date().toISOString(),
        userId: req.user.uid,
      };
      const docRef = await db.collection("social_monitoring").add(mention);
      results.push({ id: docRef.id, ...mention });
    }

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// AI-POWERED COPILOT GENERATION ENDPOINTS
// ==========================================

// Smart Reply Suggestions
router.post("/inbox/:id/smart-reply", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const inboxRef = db.collection("social_inbox").doc(id);
    const snap = await inboxRef.get();

    if (!snap.exists) return res.status(404).json({ error: "Inbox item not found" });
    const item = snap.data();
    if (item?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    const ai = getGeminiClient();
    const systemContext = `You are an expert customer support agent for a modern enterprise business suite. Generate 3 smart, professional, and helpful reply options to the user's message.`;
    const userPrompt = `Message from user: "${item?.message}"
    
    Generate 3 distinct reply options. Provide the response in strict JSON format. Do not use markdown blocks.
    JSON Structure:
    {
      "replies": ["Reply option 1", "Reply option 2", "Reply option 3"]
    }`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: `${systemContext}\n\n${userPrompt}` }] }],
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ replies: parsed.replies || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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
