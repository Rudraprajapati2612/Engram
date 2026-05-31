import { GoogleGenAI } from "@google/genai";

const geminiApi = Bun.env.GEMINI_API;
if(!geminiApi){
    throw new Error("Gemini Api Key is missing");
}
const ai = new GoogleGenAI({apiKey : geminiApi});


export async function *StreamsToLLMs(systemPrompt:string,userText:string,history: {role:'user'|'model' , parts:{text:string}[]}[]):AsyncGenerator<string>{
    try{
        const chat = ai.chats.create({
            model : 'gemini-3.5-flash',
            history : history,
            config: {
                systemInstruction : systemPrompt
            }
        })

        const responseStream = await chat.sendMessageStream({
            message : userText
        })

        for await (const chunks of responseStream ){
            if (chunks.text){
                yield chunks.text;
            }
        }
    }catch(e){
        console.error("Error encountered during LLM streaming execution:", e);
        throw e;
    }
}