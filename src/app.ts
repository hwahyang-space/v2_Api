import express from 'express';

const config = require('../config/config.json');

const app = express();

// Custom Module Instances

// Config
app.use(express.json(), express.urlencoded({ extended: true }));

// Header
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.setHeader('Server', config.express.header.Server);
	res.setHeader('x-powered-by', config.express.header['x-powered-by']);
	next();
});

const httpServer = app.listen(config.serverPort, config.ServerHost, () => {
	console.log(`hwahyang.space v2 API is listening on ${config.ServerHost}:${config.serverPort}`);
});
