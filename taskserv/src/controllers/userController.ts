import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import { getSequelize } from "../plugins/database";
import User from "../database/models/user";
import { CreateUserSchema, LoginUserSchema } from "../schemas/schema";

const SALT_ROUNDS = 10;

async function getUserRepository() {
    const sequelize = getSequelize();
    return sequelize.getRepository(User);
}

async function findUserByEmail(email: string) {
    const userRepository = await getUserRepository();
    return userRepository.findOne({ where: { email: email.toLowerCase() } });
}

function sendErrorReply(reply: FastifyReply, statusCode: number, message: string) {
    return reply.code(statusCode).send({ message });
}

export async function createUser(
    request: FastifyRequest<{ Body: CreateUserSchema }>,
    reply: FastifyReply,
) {
    const { password, email, name } = request.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return sendErrorReply(reply, 401, 'User already exists with this email');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const userRepository = await getUserRepository();
        const newUser = await userRepository.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        return reply.code(201).send(newUser);
    } catch (error) {
        return reply.code(500).send(error);
    }
}

export async function login(
    request: FastifyRequest<{ Body: LoginUserSchema }>,
    reply: FastifyReply,
) {
    const { email, password } = request.body;

    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return sendErrorReply(reply, 401, 'Invalid email or password');
    }

    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
    };
    const token = request.jwt.sign(payload);

    reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true,
        secure: true,
    });

    return { accessToken: token };
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('access_token');
    return reply.send({ message: 'Logout successful' });
}