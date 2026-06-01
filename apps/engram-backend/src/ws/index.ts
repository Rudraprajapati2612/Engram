import { Elysia, t } from "elysia";
import jwt from "@elysia/jwt";
import { retrieveMemories } from "../services/retrieve";
import { buildSystemPrompt } from "../services/buildPrompt";
import { StreamsToLLMs } from "../services/LlmStreams";
import { extractorQueue } from "../queue/queue";
import { getRecentMessages, insertMessageTable } from "db/client";

export const wsRoute = new Elysia()
    .use(jwt({ name: 'jwt', secret: Bun.env.JWT_SECRET! }))
    .derive({ as: 'scoped' }, async ({ headers, jwt }) => {
        const auth = headers.authorization;
        if (!auth?.startsWith('Bearer ')) return { userId: null as string | null };
        const payload = await jwt.verify(auth.split(' ')[1]);
        return { userId: payload ? (payload.sub as string) : null as string | null };
    })
    .ws('/ws', {
        body: t.Object({
            userMessage: t.String(),
            conversationId: t.String(),
        }),
        open(ws) {
            if (!ws.data.userId) {
                ws.close(4001, 'Unauthorized');
                return;
            }
            ws.send("Welcome to The Ws channel");
        },
        async message(ws, { userMessage, conversationId }) {
            console.log("1. WS message received", {
            userMessage,
            conversationId,
        });
            const userId = ws.data.userId;
            if (!userId) {
                console.log("2. No userId");
                ws.close(4001, 'Unauthorized');
                return;
            }
            console.log("3. Saving user message");
            await insertMessageTable(userId, conversationId, 'user', userMessage);
             console.log("4. User message saved");

              console.log("5. Loading history");
            const history = await getRecentMessages(conversationId);
              console.log("6. History loaded", history.length);


                console.log("7. Retrieving memories");
            const retrive = await retrieveMemories(userId, userMessage);
             console.log("8. Memories retrieved", retrive);

             console.log("9. Building system prompt");
            const systemPrompt = buildSystemPrompt(retrive);
            console.log("10. System prompt built",systemPrompt);


            console.log("11. Starting LLM stream");
            let fullResponse = '';
            for await (const token of StreamsToLLMs(systemPrompt, userMessage, history)) {
                ws.send(JSON.stringify({ type: 'token', token }));
                fullResponse += token;
            }
             console.log("12. LLM stream finished");
            ws.send(JSON.stringify({ type: 'done' }));

            console.log("13. Saving assistant message");
            await insertMessageTable(userId, conversationId, 'assistant', fullResponse);


            console.log("14. Assistant message saved");

            console.log("15. Queueing extractor job");

            await extractorQueue.add('extractor', { userId, fullResponse, userMessage });

             console.log("16. Extractor job queued");
        }
    })
