import {FastifyInstance} from "fastify";
import chalk from "chalk";

export async function healthRoutes(app: FastifyInstance) {
    app.get('/healthcheck', (req, res) => {
        res.send({ message: 'Success' })
    })

    chalk.green('health routes');
}