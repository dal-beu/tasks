import {userRoutes} from "../routes/userRoutes";
import fastifySwagger from "@fastify/swagger";
import {taskRoutes} from "../routes/taskRoutes";
import {healthRoutes} from "../routes/healthRoutes";
import {fastify, FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fjwt, {FastifyJWT} from "@fastify/jwt";
import fCookie from "@fastify/cookie";
import {schemas} from "../schemas/schema";
import {databaseConfig} from "../config/config";

export async function application(): Promise<FastifyInstance> {
    const app = fastify({
        logger: false,
    });

    // consider adding cors

    for (let schema of schemas) {
        app.addSchema(schema);
    }

    const swaggerOptions = {
        swagger: {
            info: {
                title: "taskServ",
                description: "",
                version: "1.0.0",
            },
            host: "localhost",
            schemes: ["http", "https"],
            consumes: ["application/json"],
            produces: ["application/json"],
            tags: [{ name: "Endpoints", description: "" }],
        },
    };

    const swaggerUiOptions = {
        routePrefix: "/swagger",
        exposeRoute: true,
    };

    // jwt
    await app.register(fjwt, { secret: databaseConfig.secret })

    app.addHook('preHandler', (req, res, next) => {
        req.jwt = app.jwt
        return next()
    })

    // authenticate
    app.decorate(
        'authenticate',
        async (req: FastifyRequest, reply: FastifyReply) => {
            const token = req.cookies.access_token

            if (!token) {
                return reply.status(401).send({ message: 'User not authenticated' })
            }
            req.user = req.jwt.verify<FastifyJWT['user']>(token)
        },
    )

    // cookie
    await app.register(fCookie, {
        secret: 'some-secret-key',
        hook: 'preHandler',
    })

    // swagger
    await app.register(fastifySwagger, swaggerOptions);
    await app.register(fastifySwaggerUi, swaggerUiOptions);

    // routes
    await app.register(healthRoutes);
    await app.register(userRoutes, { prefix: 'api/users' });
    await app.register(taskRoutes, { prefix: 'api/tasks' });

    return app;
}