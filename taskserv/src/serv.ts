import {appConfig} from "./config/config";
import {application} from "./plugins/application";
import {initializeDatabase} from "./plugins/database";
import dotenv from "dotenv";

const start = async () => {

    dotenv.config();
    const app = await application();
    const sequelize = await initializeDatabase();

    // shutdown
    const listeners = ['SIGINT', 'SIGTERM']
    listeners.forEach((signal) => {
        process.on(signal, async () => {
            await app.close()
            process.exit(0)
        })
    })

    try {
        await app.listen({port: appConfig.port, host: appConfig.host});
        app.log.info(`Server listening on ${appConfig.host}:${appConfig.port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();