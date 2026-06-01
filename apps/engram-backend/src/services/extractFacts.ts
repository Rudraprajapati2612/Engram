import { GoogleGenAI } from "@google/genai";

const geminiApi = Bun.env.GEMENI_API;

if (!geminiApi) {
  throw new Error("Gemini Api is missing in env");
}

const ai = new GoogleGenAI({ apiKey: geminiApi });
export interface Facts {
  type: "preference" | "fact" | "event" | "relationship";
  content: string;
  confidence: number;
}

const EXTRACTION_PROMPT = `
You are an invisible memory extraction engine. Read the conversation and extract facts worth remembering long-term about the user.

Rules:
1. Only extract persistent facts: identity, tech stack, preferences, relationships, goals, and events.
2. Skip conversational filler, small talk, questions, and single-session context.
3. You must return ONLY a valid JSON array of objects.
4. If there is nothing worth remembering, return an empty array: []

Object Schema:
[
  {
    "type": "preference" | "fact" | "event" | "relationship",
    "content": "A clean, isolated string of the fact (e.g., 'User's primary coding language is Rust')",
    "confidence": A float between 0.0 and 1.0
  }
]
`;

export async function extractFacts(
  usrMessage: string,
  assistantMessage: string,
): Promise<Facts[]> {
  try {
    const conversation = `Users :${usrMessage}\n Assistant: ${assistantMessage}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: conversation,
      config: {
        systemInstruction: EXTRACTION_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const rawJson = response.text;
    if (!rawJson) {
      return [];
    }

    const parsed = JSON.parse(rawJson);

    if (!Array.isArray(parsed)){
        return []
    }

    const validParse:Facts[] = parsed.filter((item)=>{
        return (
            typeof item === "object" &&
            item != null &&
            ['preference','fact','event','relationship'].includes(item.type)&&
            typeof item.content === "string"
        );
    }).map((item)=>({
        type : item.type,
        content : item.content.trim(),
        confidence : 
        typeof item.confidence === "number" ? Math.min(1,Math.max(0,item.confidence)):0.8
    }))
    
    return validParse;
  } catch (e) {
    console.error("Failed to extract or parse facts:", e);
    // If the LLM hallucinates bad JSON, we just return an empty array to prevent a crash
    return [];
  }
}
