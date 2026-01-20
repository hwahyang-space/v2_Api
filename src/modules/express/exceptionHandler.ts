import express from 'express';

import { LogLevel, LogManager } from '../logManager';

import StatusCode from '../../templates/StatusCode';

class ExceptionHandler {
	private readonly logManager = new LogManager('ExceptionHandler');

	public UnhandledExceptionHandler = (
		err: Error,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		this.logManager.log(LogLevel.ERROR, `An Error ocurred in ${req.url}: ${err.message}`);
		res.status(520).json(
			new StatusCode(520, 'Unhandled Exception', 'Undefined internal error.')
		);
	};

	public NotFoundExceptionHandler = (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		res.status(404).json(new StatusCode(404, 'Not Found', 'Wrong access'));
	};

	public RateLimitedExceptionHandler = (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		this.logManager.log(LogLevel.ERROR, `An RateLimit ocurred in ${req.url}: ${req.ip}`);
		res.status(429).json(new StatusCode(429, 'Too Many Requests', 'Try again later.'));
	};
}

export default ExceptionHandler;
