import jwt from "@elysia/jwt";
import { Elysia, status } from "elysia";
export type UserJwtPayload = {
    sub: string;
};
export const authMiddleware = new Elysia()
    .use(
        jwt({
            name: "jwt",
            secret: Bun.env.JWT_SECRET!
        })
    )
    .derive(async ({ headers, jwt }) => {
        const authHeader = headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw status(401, "Unauthorized");
        }

        const token = authHeader.split(" ")[1];
        const decoded = await jwt.verify(token);

        if (!decoded) {
            throw status(401, "Invalid Token");
        }

        return {
            user: decoded as UserJwtPayload
        };
    })
    .as("scoped");
