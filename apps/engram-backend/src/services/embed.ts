import { GoogleGenAI } from "@google/genai";
const geminiApi = Bun.env.GEMENI_API;
if (!geminiApi){
    throw new Error("Gemini API Key is missing");
}

const ai = new GoogleGenAI({apiKey : geminiApi});
export async function embed(content:string,taskType: 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT' = 'RETRIEVAL_DOCUMENT'){
    const responseContent = await ai.models.embedContent({
        model : 'gemini-embedding-2',
        contents : content,
        config : {
            taskType,
            outputDimensionality : 768
        }
    })
    // console.log(responseContent.embeddings);
   if(!responseContent.embeddings||responseContent.embeddings.length == 0){
    throw new Error("No Response Embedding is returning From Gemini")
   }

   const firstEmbedding = responseContent.embeddings[0];
   
   if (!firstEmbedding?.values){
        throw new Error("Embeeding Value is Undefined")
   }
    return firstEmbedding.values;
}