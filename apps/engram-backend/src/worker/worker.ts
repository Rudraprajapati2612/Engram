import { Worker } from "bullmq";
import { extractFacts } from "../services/extractFacts";
import { embed } from "../services/embed";
import { upsertMemory } from "db/client";
// import { extractorQueue } from "../queue/queue";

const worker = new Worker('extractor',
    async(job)=>{

        const {userId,fullResponse,userMessage} = job.data;
        // extract Fact from the llm response 
        const extractFact = await extractFacts(userMessage,fullResponse);
        // embed the extract face 
        
        for(const facts of extractFact ){
            const vector = await embed(facts.content);
            await upsertMemory(userId,facts,vector);
        }

        //  push that embeded fact to the Database 

        
    }
)