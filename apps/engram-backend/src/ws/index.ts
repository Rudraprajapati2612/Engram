import {Elysia,t} from "elysia";
import { embed } from "../services/embed";
import { retrieveMemories } from "../services/retrieve";
import { buildSystemPrompt } from "../services/buildPrompt";
import { StreamsToLLMs } from "../services/LlmStreams";
import { extractorQueue } from "../queue/queue";


const app = new Elysia()
            .ws('/ws',{
                body : t.Object({
                    userId : t.String(),
                    userMessage : t.String(),
                    conversationId : t.String(),
                    history : t.Array( 
                    t.Object({
                        role : t.Union([
                            t.Literal('model'),
                            t.Literal('user')
                        ]),
                        parts : t.Array(
                         t.Object({
                            text : t.String()
                        })
                    )
                    })
                    )
                }),
                open(ws){
                    ws.send("Welcome to The Ws channel")
                },
                async message(ws,{userId,userMessage,conversationId,history}){

                    // retrive memory 

                    const retrive = await retrieveMemories(userId,userMessage);
                    
                    //then we need to build the system Prompt 
                    
                    const systemPrompt  =  buildSystemPrompt(retrive);

                    // send the system prompt to the llm 

                    let fullResponse = '';
                    
                    for await(const token of StreamsToLLMs(systemPrompt,userMessage,history)){
                        ws.send(JSON.stringify({type:'token',token}))

                        fullResponse = fullResponse + token;
                    }

                    // after this i need to add send Full llm response to the worker queue 
                    await extractorQueue.add('extractor',{userId,fullResponse,userMessage})
                }
            })