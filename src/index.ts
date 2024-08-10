import 'dotenv/config'
import * as express from "express";
import * as swaggerUi from "swagger-ui-express";
import * as cors from "cors";
import { AppDataSource } from "./data-source"
import { environment } from './utils/environment';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { adminAuth, privateAuth } from './middleware/auth';

import v1GroupRouter from './routes/v1/groups';
import v1ShareRouter from './routes/v1/share';
import v1SessionRouter from './routes/v1/session';
import v1DataRouter from './routes/v1/data';
import { initWebsocket } from './routes/v1/realtime';
import { logger } from './utils/logger';

const port = environment.backendPort;

const app = express();

enum APIAccess {
    INTERNAL = "internal", // The access control is done by the router
    PUBLIC = "public",
    PRIVATE = "private",
    ADMIN = "admin",
}

interface APIVersion {
    path: string;
    name: string;
    resources: Resource[];
    apiDoc?: any;
}

interface Resource {
    path: string;
    router?: express.Router;
    name: string;
    auth: APIAccess;
}

const versions: APIVersion[] = [
    {
        path: "/v1",
        name: "v1",
        // apiDoc: require("../openapi.json"),
        resources: [
            {
                path: "/group",
                router: v1GroupRouter,
                name: "group",
                auth: APIAccess.INTERNAL
            },
            {
                path: "/share",
                router: v1ShareRouter,
                name: "share",
                auth: APIAccess.ADMIN
            },
            {
                path: "/sessions",
                router: v1SessionRouter,
                name: "sessions",
                auth: APIAccess.INTERNAL
            },
            {
                path: "/data",
                router: v1DataRouter,
                name: "data",
                auth: APIAccess.PRIVATE
            }
        ]
    }
]

async function main() {
    try {
        await AppDataSource.initialize()
        logger.success('Database connected')
    } catch (error) {
        logger.error('Database connection failed')
        throw error
    }

    app.use(cors())
    app.use(express.json())

    // Print all available versions
    app.get("/", (_, res) => {
        res.json(versions.map(version => {
            return {
                version: version.name,
                path: `${version.path}`
            }
        }));
    });

    // Print all available resources for each version
    versions.forEach(version => {
        app.get(`${version.path}`, (_, res) => {
            res.json(version.resources.map(resource => {
                return {
                    path: `${version.path}${resource.path}`,
                    name: resource.name
                }
            }));
        });
    })

    // Register all routes
    versions.forEach(version => {
        version.resources.forEach(resource => {
            if (resource.router) {
                if (resource.auth === APIAccess.ADMIN) {
                    app.use(`${version.path}${resource.path}`, adminAuth, resource.router);
                } else if (resource.auth === APIAccess.PRIVATE) {
                    app.use(`${version.path}${resource.path}`, privateAuth, resource.router);
                } else if (resource.auth === APIAccess.PUBLIC || resource.auth === APIAccess.INTERNAL) {
                    app.use(`${version.path}${resource.path}`, resource.router);
                }
            }
        })
        app.use(`${version.path}/api-docs`, swaggerUi.serve, swaggerUi.setup(version.apiDoc));
    })

    app.use(notFound);
    app.use(errorHandler);

    const server = app.listen(port, () => {
        logger.ready(`API-Server started on port ${port}`);
    })

    initWebsocket(server)
}

main().catch(err => {
    logger.error(err);
})
