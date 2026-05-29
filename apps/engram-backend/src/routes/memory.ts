import { Elysia } from "elysia";
import { authMiddleware } from "../plugins/authMiddleware";

export const memoryRoute = new Elysia()
    .use(authMiddleware)
    .get("/memory", ({ user }) => ({
        message: "Protected Route",
        userId: user.sub
    }));
