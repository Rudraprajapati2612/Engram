import { Worker } from "bullmq";
import { extractFacts } from "../services/extractFacts";
import { embed } from "../services/embed";
import { insertMessageTable, upsertMemory } from "db/client";
import { redis } from "../cache/redis";
import { createHash } from "crypto";
// import { extractorQueue } from "../queue/queue";

const worker = new Worker('extractor',
    async(job)=>{

        const {userId,fullResponse,userMessage} = job.data;
        // extract Fact from the llm response 
        const extractFact = await extractFacts(userMessage,fullResponse);
        
        for(const facts of extractFact ){
            const vector = await embed(facts.content);
            await upsertMemory(userId,facts,vector);
        }

        
        // remove the cache from the redis 
        const key = `mem:${userId}:*`;
        await redis.del(key);

        
    },
    {
        connection:{
            host : "localhost",
            port : 6379
        }
    }
)
