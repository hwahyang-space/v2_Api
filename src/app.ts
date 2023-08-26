import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

import ExceptionHandler from './modules/express/exceptionHandler';
import MySQLConnector from './modules/mysqlConnector';

const config = require('../config/config.json');

const app = express();

// Custom Module Instances
const exceptionHandler = new ExceptionHandler();

// Config
const corsOptions = {
	origin: config.corsOrigins,
	//credential: true,
};
const limiter = rateLimit({
	windowMs: config.rateLimiter.unitMinutes * 60 * 1000,
	max: config.rateLimiter.maxRate,
	standardHeaders: true,
	legacyHeaders: false,
	skip: (request, response) => config.rateLimiter.allowlist.includes(request.ip),
	handler: exceptionHandler.RateLimitedExceptionHandler,
});

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json(), express.urlencoded({ extended: true }));

// Header
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.setHeader('Server', config.header.Server);
	res.setHeader('x-powered-by', config.header['x-powered-by']);
	next();
});

// Exception Handling
app.use(exceptionHandler.NotFoundExceptionHandler, exceptionHandler.UnhandledExceptionHandler);

const httpServer = app.listen(config.serverPort, config.serverHost, () => {
	MySQLConnector.Instance(); // Constructor 호출로 DB 연결
	console.log(`hwahyang.space v2 API is listening on ${config.serverHost}:${config.serverPort}`);
});
