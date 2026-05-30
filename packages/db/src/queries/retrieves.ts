import { sql } from "..";
type MemoryRow = {
  content: string;
};

export async function RetrieveMemories(userId:string,embeddVector:number[]):Promise<MemoryRow[]>{
    const vectorStr  = `[${embeddVector.join(",")}]`;
    return await sql`
    SELECT content FROM memories
    WHERE user_id=${userId} AND active=true
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT 5
    `
}