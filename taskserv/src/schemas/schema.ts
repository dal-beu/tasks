import {z} from "zod";
import {buildJsonSchemas} from "fastify-zod";

// needs to be split and reworked

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
})
export type CreateUserSchema = z.infer<typeof createUserSchema>

const loginSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email(),
    password: z.string().min(6),
})
export type LoginUserSchema = z.infer<typeof loginSchema>

const createUserResponseSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
})

const loginResponseSchema = z.object({
    accessToken: z.string(),
})

const getSchema = z.object({
    taskId: z.number(),
});
export type GetTaskSchema = z.infer<typeof getSchema>

const assignedTaskSchema = z.object({
    status: z.string(),
    orderField: z.string(),
    orderBy: z.string(),
});
export type AssignedTaskSchema = z.infer<typeof assignedTaskSchema>

const taskResponseSchema = z.object({
    id: z.number(),
    title: z.string(),
    status:  z.string(),
    priority:  z.string(),
    tags: z.array(z.string()),
    createdBy: z.string(),
    assignedTo: z.string(),
    description: z.string(),
    dueDate: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type TaskResponseSchema = z.infer<typeof taskResponseSchema>

const createTaskSchema = z.object({
    title: z.string().min(1).max(100),
    status: z.enum([
        'open',
        'in progress',
        'done',
    ]),
    priority: z.enum([
        'low',
        'medium',
        'high'
    ]),
    tags: z.array(z.string()).max(100),
    description: z.string().min(10).max(10000),
    dueDate: z.date(),
});
export type CreateTaskSchema = z.infer<typeof createTaskSchema>

const updateTaskSchema = z.object({
    id: z.number(),
    title: z.string().min(1).max(100),
    status: z.enum([
        'open',
        'in progress',
        'done',
    ]),
    priority: z.enum([
        'low',
        'medium',
        'high'
    ]),
    dueDate: z.date(),
    tags: z.array(z.string().min(1).max(10)).max(100),
    description: z.string().min(10).max(10000),
});
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>

const assignTaskSchema = z.object({
    taskId: z.number(),
    email: z.string().email(),
});
export type AssignTaskSchema = z.infer<typeof assignTaskSchema>

export const { schemas: schemas, $ref } = buildJsonSchemas({
    createUserSchema,
    createUserResponseSchema,
    loginSchema,
    loginResponseSchema,
    taskResponseSchema,
    createTaskSchema,
    updateTaskSchema,
    assignTaskSchema,
    assignedTaskSchema
})