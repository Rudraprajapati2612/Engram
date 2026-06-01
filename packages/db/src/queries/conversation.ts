import { sql } from "..";

interface Conversation{
    id : string,
    user_id : string,
    title : string | null,
    created_at : string
}

export async function createConversation(userId:string,title? : string) :Promise<Conversation>{
    const [conv] = await sql<Conversation[]>`
    INSERT INTO conversations(user_id,title)
    VALUES (${userId},${title ?? null})
    RETURNING *  
    `;
    if(!conv){
        throw new Error("Conversation is not Inserted")
    }
    return conv
}

export async function getUserConversation(userId : string) : Promise<Conversation[]>{
    return await sql<Conversation[]>`
    SELECT id, title, created_at
    FROM conversations
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    `;
}

export async function getRecentMessages(conversationId: string, limit = 20) {
  const rows = await sql<{ type: string; content: string }[]>`
    SELECT type, content FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.reverse().map(row => ({
    role: (row.type === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: row.content }]
  }));
}

export async function getConversationMessage(conversationId : string){
    return sql`
    SELECT id, type, content, created_at
    from messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
    `;
}