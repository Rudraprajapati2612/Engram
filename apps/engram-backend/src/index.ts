import Elysia from "elysia";
import { ConnectDb,sql } from "db/client";
import swagger from "@elysiajs/swagger";
import { authRoute } from "./routes/auth";
import { memoryRoute } from "./routes/memory";
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
    .listen(PORT)

    console.log(`
    🚀 Engram API Gateway started!
    📍 Server: http://${app.server?.hostname}:${app.server?.port}
    📚 Swagger: http://${app.server?.hostname}:${app.server?.port}/swagger
    ⚡ Framework: Elysia.js
    🔥 Runtime: Bun ${Bun.version}
  `);
