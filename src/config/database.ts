import { ConnectionOptions } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: ConnectionOptions = {
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",  // 默认空密码
    database: process.env.DB_NAME || "examydb",
    synchronize: true,
    logging: true,
    entities: [
        path.join(__dirname, '../entity/**/*.ts')
    ],
    migrations: [
        path.join(__dirname, '../migration/**/*.ts')
    ],
    subscribers: [
        path.join(__dirname, '../subscriber/**/*.ts')
    ],
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber"
    }
}; 