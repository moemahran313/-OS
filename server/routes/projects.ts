import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { logAudit, generateContentWithRetry } from "../services/utils.ts";
import { db } from "../services/firebase.ts";
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

// Lazy initialize Gemini client to avoid crashes if the key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required to run AI features");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Get all projects for user
router.get("/", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("projects").where("userId", "==", req.user.uid).get();
    const projects = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create a new project
router.post("/", authenticate, async (req: any, res) => {
  try {
    const projectData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await db.collection("projects").add(projectData);
    await logAudit(
      "PROJECTS",
      { action: "Create Project", projectId: docRef.id },
      projectData,
      req
    );
    res.status(201).json({ id: docRef.id, ...projectData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update an existing project
router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const projectData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    // Delete id and userId from body if present
    delete projectData.id;
    delete projectData.userId;

    await db.collection("projects").doc(id).update(projectData);
    await logAudit("PROJECTS", { action: "Update Project", projectId: id }, projectData, req);
    res.json({ id, ...projectData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete a project
router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.collection("projects").doc(id).delete();
    await logAudit("PROJECTS", { action: "Delete Project", projectId: id }, { id }, req);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. AI Copilot endpoint: Generate a structured Project Plan using Gemini
router.post("/copilot", authenticate, async (req: any, res) => {
  try {
    const { prompt, language } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAiClient();
    const systemPrompt = `You are a world-class enterprise Project Architect for Madarij OS.
Generate a comprehensive, production-ready, highly tailored project structure based on the user's description.
Return a single, strictly valid JSON object. Do NOT wrap it in markdown block characters (such as \`\`\`json) or any preamble or notes. Just the raw JSON.

The response must adhere to the following strict JSON Schema:
{
  "name": "A professional name for this project (in the user's requested language or same language as the prompt)",
  "description": "A comprehensive overview of the project",
  "budget": 150000,
  "milestones": [
    {
      "id": "m1",
      "name": "Milestone name (e.g. M1: Architecture and DB Setup)",
      "description": "Brief description of expectations",
      "dueDate": "ISO date of completion (e.g., YYYY-MM-DD)",
      "status": "pending"
    }
  ],
  "epics": [
    {
      "id": "e1",
      "name": "Epic name (e.g. Core Database & API Layer)",
      "description": "Detailed description of epic scope"
    }
  ],
  "tasks": [
    {
      "id": "t1",
      "name": "Task name (e.g. Set up Firestore blueprints and triggers)",
      "description": "Specific implementation steps",
      "priority": "High",
      "estimatedHours": 16,
      "assignee": "Lead Architect",
      "milestoneId": "m1",
      "epicId": "e1",
      "status": "Todo"
    }
  ],
  "resources": [
    {
      "name": "Lead Architect",
      "role": "Architect",
      "allocation": 80,
      "costRate": 250
    },
    {
      "name": "Senior Fullstack Engineer",
      "role": "Developer",
      "allocation": 100,
      "costRate": 180
    },
    {
      "name": "Project Manager",
      "role": "Manager",
      "allocation": 50,
      "costRate": 150
    }
  ]
}

Ensure there are at least 3-4 Milestones, 2-3 Epics, and 6-10 Tasks representing a realistic enterprise plan.
If the language requested is "ar" or Arabic, provide all names and descriptions in professional Arabic. Otherwise, English.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nUser Description: ${prompt}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText =
      response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean JSON just in case Gemini wrapped it
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/```$/, "");
    }

    const projectStructure = JSON.parse(cleanJson);
    res.json(projectStructure);
  } catch (err: any) {
    console.error("[Projects Copilot Error]:", err);
    res.status(500).json({ error: err.message || "Failed to process AI Copilot query" });
  }
});

export default router;
