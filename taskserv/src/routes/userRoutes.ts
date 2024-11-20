import { FastifyInstance } from "fastify";
import chalk from "chalk";
import {createUser, login, logout} from "../controllers/userController";
import {$ref} from "../schemas/schema";

export async function userRoutes(app: FastifyInstance) {

    app.post(
        '/register',
        {
            schema: {
                body: $ref('createUserSchema'),
                response: {
                    201: $ref('createUserResponseSchema'),
                },
            },
        },
        createUser,
    )

    app.post(
        '/login',
        {
            schema: {
                body: $ref('loginSchema'),
                response: {
                    201: $ref('loginResponseSchema'),
                },
            },
        },
        login
    )

    app.delete('/logout', { preHandler: [app.authenticate] }, logout)

    chalk.green('user routes');
}