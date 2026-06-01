import {Elysia,status,t} from "elysia";
import { authMiddleware } from "../plugins/authMiddleware";
import { createConversation, getConversationMessage, getUserConversation } from "db/client";

export const conversationRoute = new Elysia({prefix : "/conversation"})
                        .use(authMiddleware)
                        
                        .post("/",async ({user})=>{
                            const conv = await createConversation(user.sub)
                            return status(200,conv)
                        },{
                            body : t.Optional(t.Object({
                                titel : t.Optional(t.String())
                            }))
                        })

                        .get("/",async({user})=>{
                            return await getUserConversation(user.sub);
                        })

                        .get("/:id/messages",async({params})=>{
                            return await getConversationMessage(params.id)
                        })
