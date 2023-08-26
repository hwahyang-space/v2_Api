import express from 'express';

import UserManager from '../userManager';
import TokenManager from '../tokenManager';

import StatusCode from '../../templates/StatusCode';
import ITokenPayload from '../../templates/ITokenPayload';
import ITokenRequest from '../../templates/requests/ITokenRequest';
import IUserResponse from '../../templates/responses/IUserResponse';
import ISignInRequest from '../../templates/requests/ISignInRequest';
import ISignUpRequest from '../../templates/requests/ISignUpRequest';
import ITokenResponse from '../../templates/responses/ITokenResponse';

const userManager = new UserManager();
const tokenManager = new TokenManager();

class Authorize {
	public signIn = (req: ISignInRequest, res: express.Response) => {
		if (!req.body.email || !req.body.password || !req.body.captcha) {
			res.status(400).json(
				new StatusCode(
					400,
					'Missing Parameters',
					'Please double check that you have filled out all items.'
				)
			);
			return;
		}

		const rawResponse = userManager.signIn(req.body.email, req.body.password);
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as unknown as ITokenResponse;
			res.json(response);
		}
	};

	public signUp = async (req: ISignUpRequest, res: express.Response) => {
		if (
			!req.body.name ||
			!req.body.email ||
			!req.body.password ||
			!req.body.approvalCode ||
			req.body.agreeTerms == null
		) {
			res.status(400).json(
				new StatusCode(
					400,
					'Missing Parameters',
					'Please double check that you have filled out all items.'
				)
			);
			return;
		}

		const rawResponse = await userManager.signUp(
			req.body.name,
			req.body.email,
			req.body.password,
			req.body.approvalCode,
			req.body.agreeTerms
		);

		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as ITokenResponse;
			res.json(response);
		}
	};

	public validateToken = (
		req: ITokenRequest,
		res: express.Response,
		next: express.NextFunction
	) => {
		if (!req.body.token) {
			res.status(401).json(new StatusCode(401, 'Wrong Token', '유효하지 않은 세션입니다.'));
			return;
		}
		const rawResponse = tokenManager.validateSessionToken(req.body.token);
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as ITokenPayload;
			req.uuid = response.uuid;
			next();
		}
	};

	public refreshToken = (req: ITokenRequest, res: express.Response) => {
		if (!req.body.token) {
			res.status(401).json(new StatusCode(401, 'Wrong Token', '유효하지 않은 세션입니다.'));
			return;
		}
		const rawResponse = tokenManager.refreshSessionToken(req.body.token);
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as ITokenResponse;
			res.status(200).json(response);
		}
	};

	public getCurrentUser = async (req: ITokenRequest, res: express.Response) => {
		if (!req.uuid) {
			res.status(401).json(new StatusCode(401, 'Wrong Token', '유효하지 않은 세션입니다.'));
			return;
		}

		const rawResponse = await userManager.getUserData(req.uuid);
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as IUserResponse;
			res.status(200).json(response);
		}
	};
}

export default Authorize;
