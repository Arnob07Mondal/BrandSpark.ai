import admin from "firebase-admin";

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

const SELECTED_MODEL = "gemini-3.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${SELECTED_MODEL}:generateContent`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const { businessType, keywords, style } = req.body;
    if (!businessType || !keywords || !style) {
      return res.status(400).json({ error: "Missing businessType, keywords, or style parameters." });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server environment." });
    }

    const prompt = `
Generate a brand identity for a new business with the following details:
- Business Type: ${businessType}
- Keywords: ${keywords}
- Style: ${style}

Generate exactly 10 creative and distinct brand names with taglines and suggested domains, a compelling brand story, and practical branding tips suitable for the chosen style and keywords.
`;

    const schema = {
      type: "OBJECT",
      properties: {
        brandNames: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              tagline: { type: "STRING" },
              domain: { type: "STRING" },
            },
            required: ["name", "tagline", "domain"],
          },
        },
        brandStory: { type: "STRING" },
        brandingTips: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
      },
      required: ["brandNames", "brandStory", "brandingTips"],
    };

    let success = false;
    let parsedContent = null;
    const MAX_RETRIES = 3;
    const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];
    const TIMEOUT_MS = 60000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const reqStartTime = Date.now();

      console.log(`[Gemini Request] Attempt ${attempt}/${MAX_RETRIES} | Model: ${SELECTED_MODEL} | Timeout: ${TIMEOUT_MS}ms | Endpoint: ${GEMINI_API_URL}`);

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
        const reqDuration = Date.now() - reqStartTime;
        console.log(`[Gemini Response] Status: ${response.status} | Duration: ${reqDuration}ms | Retry Occurred: ${attempt > 1}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("========== GEMINI ERROR ==========");
          console.error("HTTP Status:", response.status);
          console.error("Endpoint:", GEMINI_API_URL);
          console.error("Model:", SELECTED_MODEL);
          console.error("Response Body:");
          console.error(errorText);
          console.error("==================================");

          if (RETRY_STATUS_CODES.includes(response.status) && attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            await sleep(delay);
            continue;
          }
          let errorDetail = errorText;
          try {
            const errJson = JSON.parse(errorText);
            errorDetail = errJson.error?.message || errorText;
          } catch {}
          throw new Error(`HTTP error ${response.status}: ${errorDetail}`);
        }

        const resJson = await response.json();
        const textPart = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textPart) {
          throw new Error("Received empty text candidate.");
        }

        parsedContent = parseResponseText(textPart, "Brand Name");
        success = true;
        break;
      } catch (err) {
        clearTimeout(timeoutId);
        const isTimeout = controller.signal.aborted || err.name === "AbortError";
        const errorMessage = isTimeout
          ? "Gemini request exceeded 60 seconds and was cancelled."
          : (err.message || String(err));

        console.error(`Attempt ${attempt} error:`, errorMessage);

        if (attempt === MAX_RETRIES) {
          return res.status(503).json({ error: `AI Generic brand generation failed: ${errorMessage}` });
        }
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
      }
    }

    return res.status(200).json({
      success: true,
      content: parsedContent,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error occurred." });
  }
}
