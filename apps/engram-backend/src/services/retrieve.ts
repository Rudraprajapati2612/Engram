import { redis } from "../cache/redis";
import { createHash } from "crypto";
import { embed } from "./embed";
import { RetrieveMemories } from "db/client";
export async function retrieveMemories(userId:string,query:string):Promise<string[]>{
    
    const hash = createHash('sha256').update(userId+query).digest('hex').slice(0,16);
    const key = `mem:${userId}:${hash}`;

    const cached = await redis.get(key);
    // if redis cache is hit then its nice return the data from here only 
    if(cached){
        return JSON.parse(cached)
    }

    //  Convert the input Query(String) into embedding vectors
    const embedding  = await embed(query,'RETRIEVAL_QUERY'); // this will return an array of vecors dimensions
    // fetch the data from the Postgress Database 

    const retrivedMemory = await RetrieveMemories(userId,embedding);

        const memories = retrivedMemory.map(
            (memory) => (memory.content)
        )
    // after fetching store the data in the redis for future 
    
    await redis.set(key,JSON.stringify(memories),"EX",3600);

    return memories
}

