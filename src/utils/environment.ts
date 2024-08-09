function constructEnv(name: string, defaultOption: string = ""): string {
    const env = process.env[name];
    if (!env && !defaultOption) {
        throw new Error(`Environment variable ${name} not found`);
    }
    return env || defaultOption;
}

export const environment = {
    // TO DEFINE THE DEFAULT SECRETS HERE IS BAD PRACTICE!!! 
    jwtSecret: constructEnv("JWT_SECRET"),
    jwtExpiration: constructEnv("JWT_EXPIRATION", "30d"),
    dbHost: constructEnv("DB_HOST", "localhost"),
    dbPort: constructEnv("DB_PORT", "5432"),
    dbUsername: constructEnv("DB_USERNAME", "test"),
    dbPassword: constructEnv("DB_PASSWORD"),
    dbName: constructEnv("DB_NAME", "coinsaw"),
    status: constructEnv("STATUS", "production"),
    backendPort: constructEnv("BACKEND_PORT", "8080"),
    externalUrl: constructEnv("EXTERNAL_URL", "http://localhost:8080"),
};
