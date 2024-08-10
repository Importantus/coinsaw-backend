import { exit } from "process";
import { logger } from "./logger";

function constructEnv(name: string, defaultOption: string = ""): string {
    const env = process.env[name];
    if (!env && !defaultOption) {
        logger.error(`Environment variable ${name} is not defined`);
        exit(1);
    }
    return env || defaultOption;
}

export const environment = {
    // TO DEFINE THE DEFAULT SECRETS HERE IS BAD PRACTICE!!! 
    jwtSecret: constructEnv("JWT_SECRET"),
    jwtExpiration: constructEnv("JWT_EXPIRATION", "30d"),
    dbHost: constructEnv("DB_HOST", "localhost"),
    dbPort: constructEnv("DB_PORT", "5432"),
    dbUsername: constructEnv("DB_USER", "test"),
    dbPassword: constructEnv("DB_PASSWORD"),
    dbName: constructEnv("DB_NAME", "coinsaw"),
    status: constructEnv("STATUS", "production"),
    backendPort: constructEnv("BACKEND_PORT", "8080"),
    externalUrl: constructEnv("EXTERNAL_URL", "http://localhost:8080"),
    logLevel: constructEnv("LOG_LEVEL", "4"), // https://github.com/unjs/consola?tab=readme-ov-file#log-level
};
