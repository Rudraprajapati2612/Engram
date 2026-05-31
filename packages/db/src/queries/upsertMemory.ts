import { sql } from "..";

interface Facts {
  type: "preference" | "fact" | "event" | "relationship";
  content: string;
  confidence: number;
}

const SUPERSEDE_DISTANCE = 0.15;
export async function upsertMemory(userId:string,fact:Facts,embeding:number[]){
    const vectorStr = `[${embeding.join(",")}]`

      const [nearest] = await sql<{ id: string; distance: number }[]>`
    SELECT id, embedding <=> ${vectorStr}::vector AS distance
    FROM memories
    WHERE user_id = ${userId} AND active = TRUE
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT 1
  `;

   const supersedesId =
    nearest && nearest.distance <= SUPERSEDE_DISTANCE ? nearest.id : null;


  // 2. Do both writes atomically so we never end up with the old row
  //    retired but the new row missing (or vice versa).
 await sql.begin(async (tx) => {
    if (supersedesId) {
      await tx`
        UPDATE memories
        SET active = FALSE, updated_at = now()
        WHERE id = ${supersedesId}
      `;
    }

    await tx`
      INSERT INTO memories (user_id, content, type, embedding, confidence, supersedes)
      VALUES (
        ${userId},
        ${fact.content},
        ${fact.type},
        ${vectorStr}::vector,
        ${fact.confidence},
        ${supersedesId}
      )
    `;
  });
}