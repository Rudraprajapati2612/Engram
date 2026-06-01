import Elysia from "elysia";
import { ConnectDb } from "db/client";
import swagger from "@elysiajs/swagger";
import { authRoute } from "./routes/auth";
import { memoryRoute } from "./routes/memory";
import { conversationRoute } from "./routes/conversation";
import { wsRoute } from "./ws";
const PORT = parseInt(Bun.env.PORT || '3000');
await ConnectDb();
const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Engram-Api',
        version: '1.0.0',
        description: "Ai Memory"
      },
      tags: [
        { name: 'Authentication', description: 'Auth Endpoint' },
        { name: "Users", description: "User endPoint" }
      ]
    }
  }))
    .use(authRoute)
    .use(memoryRoute)
    .use(conversationRoute)
    .use(wsRoute)
    .listen(PORT)

    console.log(`
    🚀 Engram API Gateway started!
    📍 Server: http://${app.server?.hostname}:${app.server?.port}
    📚 Swagger: http://${app.server?.hostname}:${app.server?.port}/swagger
    ⚡ Framework: Elysia.js
    🔥 Runtime: Bun ${Bun.version}
  `);
