import express from 'express';

import ExceptionHandler from './modules/exceptionHandler';

const config = require('../config/config.json');

const app = express();

// Custom Module Instances
const exceptionHandler = new ExceptionHandler();

// Config
app.use(express.json(), express.urlencoded({ extended: true }));

// Header
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.setHeader('Server', config.express.header.Server);
	res.setHeader('x-powered-by', config.express.header['x-powered-by']);
	next();
});

// Exception Handling
app.use(exceptionHandler.NotFoundExceptionHandler, exceptionHandler.UnhandledExceptionHandler);

const httpServer = app.listen(config.serverPort, config.ServerHost, () => {
	console.log(`hwahyang.space v2 API is listening on ${config.ServerHost}:${config.serverPort}`);
});
