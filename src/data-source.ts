import "reflect-metadata"
import { DataSource } from "typeorm"
import { environment } from "./utils/environment"
import { Entry } from "./entity/Entry"
import { ShareToken } from "./entity/ShareToken"
import { Session } from "./entity/Session"
import { Group } from "./entity/Group"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: environment.dbHost,
    port: parseInt(environment.dbPort),
    username: environment.dbUsername,
    password: environment.dbPassword,
    database: environment.dbName,
    synchronize: true,
    logging: false,
    entities: [Entry, Group, Session, ShareToken],
    migrations: [],
    subscribers: [],
})
