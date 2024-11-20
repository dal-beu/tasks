import { Dialect } from "sequelize";

interface IConfig {
    host: string;
    port: number;
}

interface IDatabaseConfig {
    secret: string;
    host: string;
    port: number;
    database: string;
    dialect: Dialect;
    username: string;
    password: string;
    storage: string;
    repositoryMode: boolean;
}

// APP
export const appConfig: IConfig = {
    host: process.env.TSRV_HOST ?? 'localhost',
    port: process.env.TSRV_PORT ? parseInt(process.env.TSRV_PORT, 10) : 3000,
};

// DB
export const databaseConfig: IDatabaseConfig = {
    secret: process.env.TSRV_SECRET ?? 'super_secret',
    host: process.env.TSRV_DBHOST ?? 'localhost',
    port: process.env.TSRV_DBPORT ? parseInt(process.env.TSRV_DBPORT, 10) : 3306,
    database: process.env.TSRV_DB ?? 'taskServ',
    dialect: process.env.TSRV_DIALECT ? process.env.TSRV_DIALECT as Dialect : 'mysql',
    username: process.env.TSRV_USER ?? 'user',
    password: process.env.TSRV_PASS ?? 'pass',
    storage: process.env.TSRV_STOR ?? ':memory:',
    repositoryMode: process.env.TSRV_REPO === "true"
}
