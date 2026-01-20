import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Attempt to load the JSON config. 
// We use require to avoid strict TypeScript path checks if the file is outside rootDir, 
// though resolveJsonModule usually handles it.
let rawConfig: any = {};
try {
    rawConfig = require('../config/config.json');
} catch (error) {
    console.warn("Could not load config.json, continuing with environment variables only.");
}

const config = {
    serverHost: process.env.SERVER_HOST || '127.0.0.1',
    serverPort: parseInt(process.env.SERVER_PORT || '8080', 10),
    trustProxy: process.env.TRUST_PROXY === 'true',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : (rawConfig.corsOrigins || []),

    rateLimiter: {
        unitMinutes: parseInt(process.env.RATE_LIMITER_UNIT_MINUTES || '15', 10),
        maxRate: parseInt(process.env.RATE_LIMITER_MAX_RATE || '10', 10),
        allowlist: process.env.RATE_LIMITER_ALLOWLIST ? process.env.RATE_LIMITER_ALLOWLIST.split(',') : (rawConfig.rateLimiter?.allowlist || [])
    },
    header: {
        Server: process.env.HEADER_SERVER || 'hwahyang.space v2',
        "x-powered-by": process.env.HEADER_X_POWERED_BY || 'hwahyang.space v2'
    },
    database: {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || '',
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
        queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
        keepAliveInitialDelay: parseInt(process.env.DB_KEEP_ALIVE_INITIAL_DELAY || '10000', 10)
    },
    redis: rawConfig.redis || {},
    security: {
        passwordIteration: parseInt(process.env.SECURITY_PASSWORD_ITERATION || '10000', 10),
        accessTokenSecret: process.env.SECURITY_ACCESS_TOKEN_SECRET || '',
        accessTokenExpires: process.env.SECURITY_ACCESS_TOKEN_EXPIRES || '3h',
        refreshTokenSecret: process.env.SECURITY_REFRESH_TOKEN_SECRET || '',
        refreshTokenExpires: process.env.SECURITY_REFRESH_TOKEN_EXPIRES || '3d'
    },
    log: {
        workerInterval: parseInt(process.env.LOG_WORKER_INTERVAL || '5000', 10),
        logFileFormat: rawConfig.log?.logFileFormat || "Log_YYYY_MM_DD"
    },
    swagger: rawConfig.swagger || {}
};

export default config;
