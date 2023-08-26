import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

import Authorize from './modules/express/authorize';
import MySQLConnector from './modules/mysqlConnector';
import ExceptionHandler from './modules/express/exceptionHandler';

const config = require('../config/config.json');

const app = express();

// Custom Module Instances
const exceptionHandler = new ExceptionHandler();
const authorize = new Authorize();

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

app.use(express.json(), express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(limiter);

// Header
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.setHeader('Server', config.header.Server);
	res.setHeader('x-powered-by', config.header['x-powered-by']);
	next();
});

// Authorize
app.post('/v2/authorize/signIn', authorize.signIn);
app.post('/v2/authorize/signUp', authorize.signUp);
app.post('/v2/authorize/refresh', authorize.refreshToken);

// Exception Handling
app.use(exceptionHandler.NotFoundExceptionHandler, exceptionHandler.UnhandledExceptionHandler);

const httpServer = app.listen(config.serverPort, config.serverHost, () => {
	MySQLConnector.Instance(); // Constructor 호출로 DB 연결
	console.log(`hwahyang.space v2 API is listening on ${config.serverHost}:${config.serverPort}`);
});
