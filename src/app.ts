import path from 'path';
import cors from 'cors';
import multer from 'multer';
import express from 'express';
import favicon from 'serve-favicon';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';

import Authorize from './modules/express/authorize';
import Main from './modules/express/main';
import File from './modules/express/file';
import ExceptionHandler from './modules/express/exceptionHandler';

import MySQLConnector from './modules/mysqlConnector';
import { LogLevel, LogManager, LogWorker } from './modules/logManager';

import config from './config';
const swaggerConfig = require('./swagger/swagger-output.json');

const app = express();

// Custom Module Instances
const authorize = new Authorize();
const main = new Main();
const file = new File();
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
	app.use('/api/v2/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
}

// Authorize
app.post('/api/v2/authorize/signIn', authorize.signIn);
app.post('/api/v2/authorize/signUp', authorize.signUp);
app.post('/api/v2/authorize/refresh', authorize.refreshToken);
app.post('/api/v2/authorize/me', authorize.validateToken, authorize.getCurrentUser);
app.post('/api/v2/authorize/validate', authorize.validate);

// Main
app.get('/api/v2/Main/baseData', main.baseData);
app.post('/api/v2/Main/baseData', authorize.validateToken, main.postBaseData);
app.get('/api/v2/Main/links', main.links);
app.post('/api/v2/Main/links', authorize.validateToken, main.postLinks);

// Files
app.post('/api/v2/file/', authorize.validateToken, upload.single('file'), file.postFile);

// Static
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/', express.static('src/public'));

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
