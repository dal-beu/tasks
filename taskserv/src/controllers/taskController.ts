import { FastifyReply, FastifyRequest } from "fastify";
import { getSequelize } from "../plugins/database";
import Task from "../database/models/task";
import {
    AssignedTaskSchema,
    AssignTaskSchema,
    CreateTaskSchema,
    GetTaskSchema,
    TaskResponseSchema,
    UpdateTaskSchema
} from "../schemas/schema";
import TaskTag from "../database/models/taskTag";
import Tag from "../database/models/tag";
import { orderByArray, orderFieldArray, priorityArray, statusArray } from "../database/types/states";
import User from "../database/models/user";

export async function getTask(
    req: FastifyRequest,
    reply: FastifyReply,
) {
    const detail = req.query as GetTaskSchema;
    const user = await findUser(req);

    if (!user) {
        return reply.code(400).send({ message: 'User not found' });
    }

    const sequelize = getSequelize();
    const taskRepository = sequelize.getRepository(Task);
    const existingTask = await taskRepository.findOne({ where: { id: detail.taskId, assignedTo: user.uid } });

    if (!existingTask) {
        return reply.code(400).send({ message: 'Task not found' });
    }

    const tagRepository = sequelize.getRepository(Tag);
    const taskTagRepository = sequelize.getRepository(TaskTag);
    const taskTags = await taskTagRepository.findAll({ where: { taskId: existingTask.id } });
    const tags = await tagRepository.findAll({ where: { id: taskTags.map(x => x.tagId) } });

    try {
        const returnBody = formatTaskResponse(existingTask, tags);
        return reply.code(202).send(returnBody);
    } catch (e) {
        return reply.code(500).send(e);
    }
}

export async function assigned(
    req: FastifyRequest<{ Body: AssignedTaskSchema }>,
    reply: FastifyReply,
) {
    const detail = req.body;

    if (detail.status && !statusArray.includes(detail.status)) {
        return reply.code(400).send({ message: 'Invalid status detected' });
    }

    detail.orderField = detail.orderField ?? "createdAt";
    if (!orderFieldArray.includes(detail.orderField)) {
        return reply.code(400).send({ message: 'Invalid orderField detected' });
    }

    detail.orderBy = detail.orderBy ?? "asc";
    if (!orderByArray.includes(detail.orderBy)) {
        return reply.code(400).send({ message: 'Invalid orderBy detected' });
    }

    const user = await findUser(req);

    if (!user) {
        return reply.code(400).send({ message: 'User not found' });
    }

    const sequelize = getSequelize();
    const taskRepository = sequelize.getRepository(Task);
    const whereClause: any = { assignedTo: user.uid };
    if (detail.status) {
        whereClause.status = detail.status;
    }

    const tasks = await taskRepository.findAll({
        where: whereClause,
        order: [[detail.orderField, detail.orderBy]],
    });

    if (tasks.length === 0) {
        return reply.code(400).send({ message: 'No tasks found' });
    }

    const tagRepository = sequelize.getRepository(Tag);
    const taskTagRepository = sequelize.getRepository(TaskTag);

    try {
        const allTasks = await Promise.all(tasks.map(async (task) => {
            const taskTags = await taskTagRepository.findAll({ where: { taskId: task.id } });
            const tags = await tagRepository.findAll({ where: { id: taskTags.map(x => x.tagId) } });
            return formatTaskResponse(task, tags);
        }));
        return reply.code(202).send(allTasks);
    } catch (e) {
        return reply.code(500).send(e);
    }
}

export async function createTask(
    req: FastifyRequest<{ Body: CreateTaskSchema }>,
    reply: FastifyReply,
) {
    const detail = req.body;
    const user = await findUser(req);

    if (!user) {
        return reply.code(400).send({ message: 'User not found' });
    }

    if (!statusArray.includes(detail.status)) {
        return reply.code(400).send({ message: 'Invalid status detected' });
    }

    if (!priorityArray.includes(detail.priority)) {
        return reply.code(400).send({ message: 'Invalid priority detected' });
    }

    const sequelize = getSequelize();
    const taskRepository = sequelize.getRepository(Task);
    const tagRepository = sequelize.getRepository(Tag);
    const taskTagRepository = sequelize.getRepository(TaskTag);

    const existingTask = await taskRepository.findOne({ where: { title: detail.title, createdBy: user.uid } });
    if (existingTask) {
        return reply.code(401).send({ message: 'User already created a task with this title' });
    }

    try {
        const existingTags = await tagRepository.findAll({ where: { title: detail.tags } });
        const newTagTitles = detail.tags.filter(x => !existingTags.map(tag => tag.title).includes(x));
        const newTags = await tagRepository.bulkCreate(newTagTitles.map(title => ({ title })));
        const newTask = await taskRepository.create({
            title: detail.title,
            description: detail.description,
            createdBy: user.uid,
            assignedTo: user.uid,
            dueDate: detail.dueDate,
            status: detail.status,
            priority: detail.priority,
        });

        const allTags = [...existingTags, ...newTags];
        await taskTagRepository.bulkCreate(
            allTags.map(tag => ({
                tagId: tag.id,
                taskId: newTask.id,
            }))
        );

        const returnBody = formatTaskResponse(newTask, allTags);
        return reply.code(201).send(returnBody);
    } catch (e) {
        return reply.code(500).send(e);
    }
}

export async function updateTask(
    req: FastifyRequest<{ Body: UpdateTaskSchema }>,
    reply: FastifyReply,
) {
    const detail = req.body;
    const user = await findUser(req);

    if (!user) {
        return reply.code(400).send({ message: 'User not found' });
    }

    if (!statusArray.includes(detail.status)) {
        return reply.code(400).send({ message: 'Invalid status detected' });
    }

    if (!priorityArray.includes(detail.priority)) {
        return reply.code(400).send({ message: 'Invalid priority detected' });
    }

    const sequelize = getSequelize();
    const taskRepository = sequelize.getRepository(Task);
    const tagRepository = sequelize.getRepository(Tag);
    const taskTagRepository = sequelize.getRepository(TaskTag);

    const existingTask = await taskRepository.findOne({ where: { title: detail.title, assignedTo: user.uid } });

    if (!existingTask) {
        return reply.code(400).send({ message: 'No task found with this title' });
    }

    try {
        const existingTags = await tagRepository.findAll({ where: { title: detail.tags } });
        const newTagTitles = detail.tags.filter(x => !existingTags.map(tag => tag.title).includes(x));
        const newTags = await tagRepository.bulkCreate(newTagTitles.map(title => ({ title })), { returning: true });

        existingTask.set({
            title: detail.title,
            description: detail.description,
            createdBy: user.uid,
            assignedTo: user.uid,
            dueDate: detail.dueDate,
            status: detail.status,
            priority: detail.priority
        });

        const allTags = [...existingTags, ...newTags];
        await taskTagRepository.destroy({ where: { taskId: existingTask.id } });
        await taskTagRepository.bulkCreate(
            allTags.map(tag => ({
                tagId: tag.id,
                taskId: existingTask.id,
            }))
        );

        await existingTask.save();

        const returnBody = formatTaskResponse(existingTask, allTags);
        return reply.code(202).send(returnBody);
    } catch (e) {
        return reply.code(500).send({ error: 'An error occurred while updating the task.' });
    }
}

export async function assignTask(
    req: FastifyRequest,
    reply: FastifyReply,
) {
    const detail = req.body as AssignTaskSchema;
    const user = await findUser(req);
    if (!user) {
        return reply.code(400).send({ message: 'User not found' });
    }

    const sequelize = getSequelize();
    const userRepository = sequelize.getRepository(User);
    const assignToUser = await userRepository.findOne({ where: { email: detail.email } });
    if (!assignToUser) {
        return reply.code(400).send({ message: 'No user found with email: ' + detail.email });
    }

    const taskRepository = sequelize.getRepository(Task);
    const existingTask = await taskRepository.findOne({ where: { id: detail.taskId, assignedTo: user.uid } });

    if (!existingTask) {
        return reply.code(400).send({ message: 'Task not found or not assigned to the user' });
    }

    try {
        existingTask.set({
            assignedTo: assignToUser.uid,
        });
        await existingTask.save();
        return reply.code(200).send({ message: 'Task assigned successfully' });
    } catch (e) {
        return reply.code(500).send({ error: 'An error occurred while assigning the task.' });
    }
}

export async function deleteTask(
    req: FastifyRequest,
    reply: FastifyReply,
) {
    const detail = req.query as GetTaskSchema;
    const user = await findUser(req);

    if (!user) {
        return reply.code(400).send({ message: 'User not found' });
    }

    const sequelize = getSequelize();
    const taskRepository = sequelize.getRepository(Task);

    const existingTask = await taskRepository.findOne({ where: { id: detail.taskId, assignedTo: user.uid } });

    if (!existingTask) {
        return reply.code(400).send({ message: 'Task not found or not assigned to the user' });
    }

    try {
        await taskRepository.destroy({ where: { id: detail.taskId } });
        return reply.code(200).send({ message: 'Task deleted successfully' });
    } catch (e) {
        return reply.code(500).send({ error: 'An error occurred while deleting the task.' });
    }
}

async function findUser(req: FastifyRequest): Promise<User | null> {
    const sequelize = getSequelize();
    const userRepository = sequelize.getRepository(User);
    return await userRepository.findOne({ where: { email: req.user.email } });
}

function formatTaskResponse(task: Task, tags: Tag[]): TaskResponseSchema {
    return {
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        description: task.description,
        dueDate: task.dueDate,
        id: task.id,
        priority: task.priority,
        status: task.status,
        tags: tags.map(tag => tag.title),
        title: task.title,
        updatedAt: task.updatedAt,
    };
}