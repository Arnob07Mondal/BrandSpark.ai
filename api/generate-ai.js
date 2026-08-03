import admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

if (!admin.apps.length) {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || "brandsparkai-261cd"
    });
  } else {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
    }
  }
}

const db = admin.firestore();

const SELECTED_MODEL = "gemini-3.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${SELECTED_MODEL}:generateContent`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildPrompt(project, type, userInputs) {
  const context = `
Brand Profile Context:
- Company Name: ${project.companyName}
- Industry: ${project.industry}
- Description: ${project.description || ""}
- Target Audience: ${project.targetAudience || ""}
- Target Country/Market: ${project.country || ""}
- Demographic Age: ${project.ageGroup || ""}
- Brand Personality: ${(project.brandPersonality || []).join(", ")}
- Colors Preferred: ${project.primaryColors || ""}
- Logo Style Preferred: ${project.logoStyle || ""}
- Typography Style: ${project.typography || ""}
${project.website ? `- Website: ${project.website}` : ""}
${userInputs?.customDirective ? `- Custom Directive: ${userInputs.customDirective}` : ""}
`;

  switch (type) {
    case "Brand Name":
      return `${context}\nTask: Generate exactly 10 unique, distinct, and premium brand name options for the company profile above. For each brand name, you must provide: the name itself, a meaningful explanation of the name, why it fits this specific business and context, and a memorability score from 1 to 10 (where 10 is extremely memorable and catchy).`;
    case "Logo Prompt":
      return `${context}\nTask: Formulate a detailed, highly descriptive text prompt to be used in AI image generators (like Midjourney, DALL-E, or Stable Diffusion) to create a logo that fits the brand preferences above. Provide visual style notes on elements, color applications, and graphic structure.`;
    case "Logo Concept":
      return `${context}\nTask: Elaborate on a core visual concept for a logo design for this brand. Provide 3 symbolic metaphors that can be incorporated into the visual brand identity.`;
    case "Slogan":
      return `${context}\nTask: Generate a memorable slogan for this business. Provide a brief explanation of the branding strategy and message behind it.`;
    case "Mission Statement":
      return `${context}\nTask: Formulate a powerful, concise Mission Statement that articulates the core purpose, audience, and value proposition of the brand.`;
    case "Vision Statement":
      return `${context}\nTask: Formulate an inspiring, forward-looking Vision Statement depicting the long-term impact and future aspiration of this company.`;
    case "Brand Story":
      return `${context}\nTask: Draft a compelling brand origin story narrative that outlines the problem this company solves, its values, and its promise to customers.`;
    case "Brand Voice":
      return `${context}\nTask: Design the brand voice guidelines. Detail the tone of voice (voiceTone) and list 4 practical guidelines (dos/don'ts) for content writers.`;
    case "Color Palette":
      return `${context}\nTask: Generate a structured color palette. Suggest 4 specific colors with their hex codes, descriptive names, and design roles (e.g. primary, secondary, accent, background) that align with the color preferences of the brand.`;
    case "Typography":
      return `${context}\nTask: Recommend a premium font pairing: a primary header font and a secondary body font. Provide clear guidelines on when and how to use them.`;
    case "Social Media Bio":
    case "Instagram Bio":
    case "LinkedIn About":
    case "Twitter Bio":
      return `${context}\nTask: Write a professional, high-converting bio profile description for a ${type} account that fits the character count guidelines of that platform.`;
    case "Tagline":
      return `${context}\nTask: Generate a short, punchy, customer-facing tagline (maximum 5 words) for this company.`;
    case "Marketing Hook":
      return `${context}\nTask: Compose a persuasive marketing hook to grab user attention in ads or landing pages. Identify the target emotion this hook leverages.`;
    case "Value Proposition":
      return `${context}\nTask: Formulate a compelling, clear Value Proposition statement. List 3 key benefits that distinguish this brand from competitors.`;
    default:
      throw new Error(`Unsupported generation type: ${type}`);
  }
}

function getResponseSchema(type) {
  switch (type) {
    case "Brand Name":
      return {
        type: "OBJECT",
        properties: {
          brandNames: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                meaning: { type: "STRING" },
                whyItFits: { type: "STRING" },
                score: { type: "INTEGER" },
              },
              required: ["name", "meaning", "whyItFits", "score"],
            },
          },
        },
        required: ["brandNames"],
      };
    case "Logo Prompt":
      return {
        type: "OBJECT",
        properties: {
          logoPrompt: { type: "STRING" },
          styleNotes: { type: "STRING" },
        },
        required: ["logoPrompt", "styleNotes"],
      };
    case "Logo Concept":
      return {
        type: "OBJECT",
        properties: {
          coreConcept: { type: "STRING" },
          visualMetaphors: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["coreConcept", "visualMetaphors"],
      };
    case "Slogan":
      return {
        type: "OBJECT",
        properties: {
          slogan: { type: "STRING" },
          explanation: { type: "STRING" },
        },
        required: ["slogan", "explanation"],
      };
    case "Mission Statement":
      return {
        type: "OBJECT",
        properties: {
          mission: { type: "STRING" },
        },
        required: ["mission"],
      };
    case "Vision Statement":
      return {
        type: "OBJECT",
        properties: {
          vision: { type: "STRING" },
        },
        required: ["vision"],
      };
    case "Brand Story":
      return {
        type: "OBJECT",
        properties: {
          story: { type: "STRING" },
        },
        required: ["story"],
      };
    case "Brand Voice":
      return {
        type: "OBJECT",
        properties: {
          voiceTone: { type: "STRING" },
          guidelines: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["voiceTone", "guidelines"],
      };
    case "Color Palette":
      return {
        type: "OBJECT",
        properties: {
          colors: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                hex: { type: "STRING" },
                name: { type: "STRING" },
                role: { type: "STRING" },
              },
              required: ["hex", "name", "role"],
            },
          },
        },
        required: ["colors"],
      };
    case "Typography":
      return {
        type: "OBJECT",
        properties: {
          primaryFont: { type: "STRING" },
          secondaryFont: { type: "STRING" },
          usageGuidelines: { type: "STRING" },
        },
        required: ["primaryFont", "secondaryFont", "usageGuidelines"],
      };
    case "Social Media Bio":
    case "Instagram Bio":
    case "LinkedIn About":
    case "Twitter Bio":
      return {
        type: "OBJECT",
        properties: {
          bio: { type: "STRING" },
        },
        required: ["bio"],
      };
    case "Tagline":
      return {
        type: "OBJECT",
        properties: {
          tagline: { type: "STRING" },
        },
        required: ["tagline"],
      };
    case "Marketing Hook":
      return {
        type: "OBJECT",
        properties: {
          hook: { type: "STRING" },
          targetEmotion: { type: "STRING" },
        },
        required: ["hook", "targetEmotion"],
      };
    case "Value Proposition":
      return {
        type: "OBJECT",
        properties: {
          valueProp: { type: "STRING" },
          keyBenefits: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["valueProp", "keyBenefits"],
      };
    default:
      throw new Error(`Unsupported schema request type: ${type}`);
  }
}

function parseResponseText(text, type) {
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    const lines = cleanText.split("\n");
    if (lines.length > 2) {
      cleanText = lines.slice(1, -1).join("\n").trim();
    }
  }
  return JSON.parse(cleanText);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(455).json({ error: "Method not allowed" });
  }

  try {
    // 1. Authenticate Request
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthenticated: Missing token." });
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (authErr) {
      console.error("Token verification failed:", authErr);
      return res.status(401).json({ error: "Unauthenticated: Invalid token." });
    }

    const { projectId, generationType, userInputs } = req.body;
    if (!projectId || !generationType) {
      return res.status(400).json({ error: "Missing projectId or generationType." });
    }

    // 2. Fetch Project details from Firestore & verify ownership
    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "The specified brand project does not exist." });
    }

    const projectData = projectDoc.data();
    if (projectData.ownerUid !== decodedToken.uid) {
      return res.status(403).json({ error: "Unauthorized project ownership mismatch." });
    }

    // 3. Resolve API credentials
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server environment." });
    }

    // 4. Formulate prompts and schemas
    const prompt = buildPrompt(projectData, generationType, userInputs);
    const schema = getResponseSchema(generationType);

    let success = false;
    let parsedContent = null;
    let responseText = "";
    const startTime = Date.now();

    // Retry settings
    const MAX_RETRIES = 3;
    const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
          }),
        });

        clearTimeout(timeoutId);

        // Handle retriable HTTP failures
        if (!response.ok) {
          if (RETRY_STATUS_CODES.includes(response.status) && attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            console.warn(`Attempt ${attempt} failed with status ${response.status}. Retrying in ${Math.round(delay)}ms...`);
            await sleep(delay);
            continue;
          }
          
          let errorDetail = "";
          try {
            const errJson = await response.json();
            errorDetail = errJson.error?.message || JSON.stringify(errJson);
          } catch {
            errorDetail = `HTTP error ${response.status}`;
          }
          throw new Error(errorDetail);
        }

        const resJson = await response.json();
        const textPart = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textPart) {
          throw new Error("Received empty content candidate from AI model.");
        }

        responseText = textPart;
        parsedContent = parseResponseText(responseText, generationType);
        success = true;
        break; // Exit retry loop on success
      } catch (err) {
        clearTimeout(timeoutId);
        console.error(`Attempt ${attempt} error:`, err.message || err);
        
        if (attempt === MAX_RETRIES) {
          const duration = Date.now() - startTime;
          await db.collection("generations").add({
            projectId,
            ownerUid: decodedToken.uid,
            generationType: generationType === "Brand Name" ? "brand-name" : generationType,
            prompt,
            response: { error: err.message || "Model timeout or fetch failure" },
            model: SELECTED_MODEL,
            createdAt: FieldValue.serverTimestamp(),
            status: "failed",
            generationTime: duration,
          });

          return res.status(503).json({ error: `AI Generation service failed: ${err.message || "Request timed out."}` });
        }

        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
      }
    }

    // 5. Save successful transaction log
    const generationTime = Date.now() - startTime;
    await db.collection("generations").add({
      projectId,
      ownerUid: decodedToken.uid,
      generationType: generationType === "Brand Name" ? "brand-name" : generationType,
      prompt,
      response: parsedContent,
      model: SELECTED_MODEL,
      createdAt: FieldValue.serverTimestamp(),
      status: "success",
      generationTime,
    });

    return res.status(200).json({
      success: true,
      content: parsedContent,
      metadata: {
        prompt,
        model: SELECTED_MODEL,
        generationTime,
      },
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error occurred." });
  }
}
