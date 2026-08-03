const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const { FieldValue } = require("firebase-admin/firestore");

const SELECTED_MODEL = "gemini-3.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${SELECTED_MODEL}:generateContent`;

/**
 * Helper to sleep for a given number of milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Builds the AI generation prompt based on project parameters.
 */
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

/**
 * Returns response schema mappings matching prompt definitions.
 */
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

/**
 * Formats markdown or code blocks out of candidate response text.
 */
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

/**
 * HTTPS Callable Cloud Function for secure server-side Gemini queries.
 */
exports.generateAIContent = onCall({ secrets: ["GEMINI_API_KEY"] }, async (request) => {
  console.log("=== [1] Cloud Function invoked ===");
  try {
    // 1. Authenticate Request
    if (!request.auth) {
      console.error("Authentication check failed");
      throw new HttpsError("unauthenticated", "User session is invalid or has expired.");
    }
    console.log(`=== [2] Authenticated user UID: ${request.auth.uid} ===`);
    console.log("=== [3] Complete request.data ===", JSON.stringify(request.data, null, 2));

    const { projectId, generationType, userInputs } = request.data;
    console.log(`=== [4] projectId: ${projectId} ===`);
    console.log(`=== [5] generationType: ${generationType} ===`);
    console.log(`=== [6] typeof userInputs: ${typeof userInputs} ===`);

    if (!projectId || !generationType) {
      throw new HttpsError("invalid-argument", "Missing projectId or generationType parameters.");
    }

    // 2. Fetch Project details from Firestore & verify ownership
    console.log("=== [7] Firestore project lookup started ===");
    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      console.error(`Project document with ID ${projectId} does not exist.`);
      throw new HttpsError("not-found", "The specified brand project does not exist.");
    }

    const projectData = projectDoc.data();
    console.log("=== [8] Firestore project data ===", JSON.stringify(projectData, null, 2));

    console.log("=== [9] Ownership validation ===");
    if (projectData.ownerUid !== request.auth.uid) {
      console.error(`Owner UID mismatch: project owner = ${projectData.ownerUid}, request auth uid = ${request.auth.uid}`);
      throw new HttpsError("permission-denied", "Unauthorized project ownership mismatch.");
    }

    // 3. Resolve API credentials
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "Gemini API key is not configured on the server environment.");
    }

    console.log(`=== [10] Selected Gemini model: ${SELECTED_MODEL} ===`);
    console.log(`=== [11] GEMINI_API_URL: ${GEMINI_API_URL} ===`);

    // 4. Formulate prompts and schemas
    console.log("=== [12] Prompt generation started ===");
    let prompt = "";
    try {
      prompt = buildPrompt(projectData, generationType, userInputs);
    } catch (promptErr) {
      console.error("buildPrompt threw an exception:", promptErr.stack || promptErr);
      throw promptErr;
    }
    console.log("=== [13] Prompt generation completed ===");
    console.log("=== [14] Generated prompt ===", prompt);

    console.log("=== [15] Response schema generation started ===");
    let schema = null;
    try {
      schema = getResponseSchema(generationType);
    } catch (schemaErr) {
      console.error("getResponseSchema threw an exception:", schemaErr.stack || schemaErr);
      throw schemaErr;
    }
    console.log("=== [16] Response schema generated ===", JSON.stringify(schema, null, 2));

    let success = false;
    let parsedContent = null;
    let responseText = "";
    const startTime = Date.now();

    // Retry settings
    const MAX_RETRIES = 3;
    const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];
    const TIMEOUT_MS = 60000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const reqBody = JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        console.log("=== [17] HTTP request body sent to Gemini ===", reqBody);

        let response;
        try {
          response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: reqBody,
          });
        } catch (fetchErr) {
          console.error("fetch request threw an exception:", fetchErr.stack || fetchErr);
          throw fetchErr;
        }

        clearTimeout(timeoutId);

        console.log(`=== [18] HTTP status code: ${response.status} ===`);
        console.log(`=== [19] HTTP status text: ${response.statusText} ===`);

        let resText = "";
        try {
          resText = await response.text();
        } catch (textErr) {
          console.error("Reading response text threw an exception:", textErr.stack || textErr);
          throw textErr;
        }
        console.log("=== [20] Complete Gemini response body ===", resText);

        // Handle retriable HTTP failures
        if (!response.ok) {
          if (RETRY_STATUS_CODES.includes(response.status) && attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            console.warn(`Attempt ${attempt} failed with status ${response.status}. Retrying in ${Math.round(delay)}ms...`);
            await sleep(delay);
            continue;
          }
          
          let errorDetail = resText;
          try {
            const errJson = JSON.parse(resText);
            errorDetail = errJson.error?.message || JSON.stringify(errJson);
          } catch {}
          throw new Error(errorDetail);
        }

        const resJson = JSON.parse(resText);
        const textPart = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textPart) {
          throw new Error("Received empty content candidate from AI model.");
        }

        console.log("=== [21] Raw response text ===", textPart);
        responseText = textPart;

        console.log("=== [22] JSON parsing started ===");
        try {
          parsedContent = parseResponseText(responseText, generationType);
        } catch (parseErr) {
          console.error("parseResponseText threw an exception:", parseErr.stack || parseErr);
          throw parseErr;
        }
        console.log("=== [22] JSON parsing completed ===", JSON.stringify(parsedContent, null, 2));

        success = true;
        break; // Exit retry loop on success
      } catch (err) {
        clearTimeout(timeoutId);
        console.error(`Attempt ${attempt} error:`, err.stack || err);
        
        if (attempt === MAX_RETRIES) {
          // Last attempt failed. Write failure log and throw HttpsError.
          const duration = Date.now() - startTime;
          console.log("=== [23] Firestore generation log write (failed status) ===");
          try {
            await db.collection("generations").add({
              projectId,
              ownerUid: request.auth.uid,
              generationType: generationType === "Brand Name" ? "brand-name" : generationType,
              prompt,
              response: { error: err.message || "Model timeout or fetch failure" },
              model: SELECTED_MODEL,
              createdAt: FieldValue.serverTimestamp(),
              status: "failed",
              generationTime: duration,
            });
          } catch (dbErr) {
            console.error("Firestore error logging write failed:", dbErr.stack || dbErr);
            throw dbErr;
          }

          throw new HttpsError("unavailable", `AI Generation service failed: ${err.message || "Request timed out."}`);
        }

        // Retry other errors (like connection resets / aborts)
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
      }
    }

    // 5. Save successful transaction log
    const generationTime = Date.now() - startTime;
    console.log("=== [23] Firestore generation log write (success status) ===");
    try {
      await db.collection("generations").add({
        projectId,
        ownerUid: request.auth.uid,
        generationType: generationType === "Brand Name" ? "brand-name" : generationType,
        prompt,
        response: parsedContent,
        model: SELECTED_MODEL,
        createdAt: FieldValue.serverTimestamp(),
        status: "success",
        generationTime,
      });
    } catch (dbErr) {
      console.error("Firestore success logging write failed:", dbErr.stack || dbErr);
      throw dbErr;
    }

    const retVal = {
      success: true,
      content: parsedContent,
      metadata: {
        prompt,
        model: SELECTED_MODEL,
        generationTime,
      },
    };
    console.log("=== [24] Cloud Function return ===", JSON.stringify(retVal, null, 2));
    return retVal;
  } catch (outerErr) {
    console.error("Fatal outer exception caught in generateAIContent:", outerErr.stack || outerErr);
    if (outerErr instanceof HttpsError) {
      throw outerErr;
    }
    throw new HttpsError("internal", outerErr.message || "Internal server error occurred.");
  }
});

/**
 * HTTPS Callable Cloud Function for secure server-side generic onboarding generations.
 */
exports.generateGenericBrandContent = onCall({ secrets: ["GEMINI_API_KEY"] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User session is invalid or has expired.");
  }

  const { businessType, keywords, style } = request.data;
  if (!businessType || !keywords || !style) {
    throw new HttpsError("invalid-argument", "Missing businessType, keywords, or style parameters.");
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "Gemini API key is not configured on the server environment.");
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

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

      if (!response.ok) {
        if (RETRY_STATUS_CODES.includes(response.status) && attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await sleep(delay);
          continue;
        }
        throw new Error(`HTTP error ${response.status}`);
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
      if (attempt === MAX_RETRIES) {
        throw new HttpsError("unavailable", `AI Generic brand generation failed: ${err.message}`);
      }
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      await sleep(delay);
    }
  }

  return {
    success: true,
    content: parsedContent,
  };
});
