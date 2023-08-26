import express from 'express';

import StatusCode from '../../templates/StatusCode';

class ExceptionHandler {
	public UnhandledExceptionHandler = (
		err: Error,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.log(err);
		res.status(520).json(
			new StatusCode(520, 'Unhandled Exception', '정의되지 않은 내부 오류입니다.')
		);
	};

	public NotFoundExceptionHandler = (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		res.status(404).json(new StatusCode(404, 'Not Found', '올바르지 않은 접근입니다.'));
	};

	public RateLimitedExceptionHandler = (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		res.status(429).json(new StatusCode(429, 'Too Many Requests', '잠시 후 다시 시도 해 주세요.'));
	};
}

export default ExceptionHandler;
