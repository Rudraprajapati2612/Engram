import { Queue } from "bullmq";

//  what is the work of worker 

// pick the taks from the queue 
//  apply embeding on facts that is extracted and then add that thing in memory 


export const extractorQueue = new Queue('extractor',{
    connection: {
        host : "localhost",
        port : 6379
    }
})

