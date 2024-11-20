import { FastifyInstance } from "fastify";
import chalk from "chalk";
import {$ref} from "../schemas/schema";
import {createTask, assigned, getTask, updateTask, deleteTask, assignTask} from "../controllers/taskController";

export async function taskRoutes(app: FastifyInstance) {

    app.get(
        '/get',
        {
            preHandler: [app.authenticate],
            schema: {
                response: {
                    202: $ref('taskResponseSchema'),
                },
            },
        },
        getTask,
    )

    app.post(
        '/assigned',
        {
            preHandler: [app.authenticate],
            schema: {
                body: $ref('assignedTaskSchema'),
            },
        },
        assigned,
    )

    app.post(
        '/create',
        {
            preHandler: [app.authenticate],
            schema: {
                body: $ref('createTaskSchema'),
                response: {
                    201: $ref('taskResponseSchema'),
                },
            },
        },
        createTask,
    )

    app.put(
        '/update',
        {
            preHandler: [app.authenticate],
            schema: {
                body: $ref('updateTaskSchema'),
                response: {
                    202: $ref('taskResponseSchema'),
                },
            },
        },
        updateTask,
    )

    app.post(
        '/assign',
        {
            preHandler: [app.authenticate],
            schema: {
                body: $ref('assignTaskSchema'),
                response: {
                    201: $ref('taskResponseSchema'),
                },
            },
        },
        assignTask
    )

    app.delete(
        '/delete',
        {
            preHandler: [app.authenticate],
            schema: {
                response: {
                    202: $ref('taskResponseSchema'),
                },
            },
        },
        deleteTask,
    )

    chalk.green('task routes');
}