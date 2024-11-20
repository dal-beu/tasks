import {ModelCtor, Sequelize} from 'sequelize-typescript';
import {databaseConfig} from "../config/config";
import path from "node:path";
import {glob} from "glob";
import mysql from "mysql2/promise";

let sequelize: Sequelize;

export async function initializeDatabase(): Promise<Sequelize> {
    await loadDatabase();

    const models = await loadModels();
    sequelize = await loadSequelize(models);

    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // consider migrations instead (sequelize-cli) alter enabled for now

    return sequelize;
}

async function loadModels(): Promise<Array<ModelCtor>> {
    const modelPath = path.join(__dirname, '..', 'database', 'models');
    const modelFiles = glob.sync('**/*.ts', { cwd: modelPath });

    return modelFiles.map(file => (require(path.join(modelPath, file)).default as ModelCtor));
}

async function loadDatabase(): Promise<true> {
    const connection = await mysql.createConnection({
        host: databaseConfig.host,
        port: databaseConfig.port,
        user: databaseConfig.username,
        password: databaseConfig.password
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseConfig.database}\`;`);
    return true;
}

async function loadSequelize(models: Array<ModelCtor>): Promise<Sequelize> {

    const sequelizeOptions = {
        database: databaseConfig.database,
        dialect: databaseConfig.dialect,
        username: databaseConfig.username,
        password: databaseConfig.password,
        storage: databaseConfig.storage,
        models: models,
    };

    return new Sequelize(sequelizeOptions);
}

export function getSequelize(): Sequelize {
    return sequelize;
}