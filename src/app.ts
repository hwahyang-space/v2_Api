import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';

import Authorize from './modules/express/authorize';
import MySQLConnector from './modules/mysqlConnector';
import ExceptionHandler from './modules/express/exceptionHandler';
import { LogLevel, LogManager, LogWorker } from './modules/logManager';

const config = require('../config/config.json');
const swaggerConfig = require('./swagger/swagger-output.json');

const app = express();

// Custom Module Instances
const authorize = new Authorize();
const logManager = new LogManager('App.ts');
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
	skip: (req, res) => config.rateLimiter.allowlist.includes(req.ip),
	handler: exceptionHandler.RateLimitedExceptionHandler,
});

app.set('trust proxy', config.trustProxy);
app.use(express.json(), express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(limiter);

// Log
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	logManager.log(LogLevel.DEBUG, `${req.ip} -> ${req.url}`);
	next();
});

// Header
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.setHeader('Server', config.header.Server);
	res.setHeader('x-powered-by', config.header['x-powered-by']);
	next();
});

// Swagger UI
if (config.swagger.enabled) {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
}

// Authorize
app.post('/v2/authorize/signIn', authorize.signIn);
app.post('/v2/authorize/signUp', authorize.signUp);
app.post('/v2/authorize/refresh', authorize.refreshToken);
app.post('/v2/authorize/me', authorize.validateToken, authorize.getCurrentUser);
app.post('/v2/authorize/validate', authorize.validate);

// Exception Handling
app.use(exceptionHandler.NotFoundExceptionHandler, exceptionHandler.UnhandledExceptionHandler);

const httpServer = app.listen(config.serverPort, config.serverHost, () => {
	LogWorker.Instance(); // Constructor 호출로 worker 실행
	MySQLConnector.Instance(); // Constructor 호출로 DB 연결
	logManager.log(
		LogLevel.LOG,
		`hwahyang.space v2 API is listening on ${config.serverHost}:${config.serverPort}`
	);
});
