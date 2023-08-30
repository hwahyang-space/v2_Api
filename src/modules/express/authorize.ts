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
	public signIn = async (req: ISignInRequest, res: express.Response) => {
		//#swagger.summary = '사용자 로그인을 진행합니다.'
		//#swagger.tags = ['Authorize']
		/*#swagger.parameters[''] = {
			in: 'body',
			schema: {
				email: 'username@example.com',
				password: 'password',
			}
  		}*/
		/*#swagger.responses[200] = {
			description: '로그인에 성공 한 경우 반환됩니다.',
			schema: {
				accessToken: 'token',
				accessTokenExpiresAt: 1693118771,
				refreshToken: 'token',
				refreshTokenExpiresAt: 1693118771,
				type: 'ITokenResponse',
			}
  		}*/
		/*#swagger.responses[400] = {
			description: '한 개 이상의 항목이 누락 된 경우 반환됩니다.',
			schema: {
				code: 400,
				description: 'Missing Parameters',
				userDescription: 'Please double check that you have filled out all items.',
			}
  		}*/
		/*#swagger.responses[401] = {
			description: '사용자 이메일이나 비밀번호가 일치하지 않는 경우 반환됩니다.',
			schema: {
				code: 401,
				description: 'Authentication Failed',
				userDescription: 'Email or password does not match.',
			}
  		}*/

		if (!req.body.email || !req.body.password) {
			res.status(400).json(
				new StatusCode(
					400,
					'Missing Parameters',
					'Please double check that you have filled out all items.'
				)
			);
			return;
		}

		const rawResponse = await userManager.signIn(req.body.email, req.body.password);
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as ITokenResponse;
			res.json(response);
		}
	};

	public signUp = async (req: ISignUpRequest, res: express.Response) => {
		//#swagger.summary = '사용자 회원가입을 진행합니다.'
		//#swagger.tags = ['Authorize']
		/*#swagger.parameters[''] = {
			in: 'body',
			schema: {
				name: 'username',
				email: 'username@example.com',
				password: 'password',
				approvalCode: 'ABCD1234',
				agreeTerms: true
			}
  		}*/
		/*#swagger.responses[200] = {
			description: '회원가입에 성공 한 경우 반환됩니다.',
			schema: {
				accessToken: 'token',
				accessTokenExpiresAt: 1693118771,
				refreshToken: 'token',
				refreshTokenExpiresAt: 1693118771,
				type: 'ITokenResponse',
			}
  		}*/
		/*#swagger.responses[400] = {
			description: '한 개 이상의 항목이 누락 된 경우나 입력 한 값이 규칙에 부합하지 않는 경우, 이미 존재하는 계정이 있는 경우 반환됩니다.',
			schema: {
				code: 400,
				description: 'Missing Parameters',
				userDescription: 'Please double check that you have filled out all items.',
			}
  		}*/

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
		if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
			res.status(401).json(new StatusCode(401, 'Wrong Token', 'Invalid session.'));
			return;
		}
		const token = req.headers.authorization?.replace('Bearer ', '');

		const rawResponse = tokenManager.validateSessionToken(token);
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as ITokenPayload;
			req.uuid = response.uuid;
			next();
		}
	};

	public refreshToken = (req: express.Request, res: express.Response) => {
		//#swagger.summary = 'AccessToken의 갱신을 진행합니다.'
		//#swagger.tags = ['Authorize']
		/*#swagger.security = [{
            "bearerAuth": []
    	}]*/
		/*#swagger.responses[200] = {
			description: '갱신에 성공 한 경우 반환됩니다.',
			schema: {
				accessToken: 'token',
				accessTokenExpiresAt: 1693118771,
				refreshToken: 'token',
				refreshTokenExpiresAt: 1693118771,
				type: 'ITokenResponse',
			}
  		}*/
		/*#swagger.responses[401] = {
			description: '제공된 RefreshToken이 유효하지 않은 경우 반환됩니다.',
			schema: {
				code: 401,
				description: 'Wrong Token',
				userDescription: 'Invalid session.',
			}
  		}*/

		if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
			res.status(401).json(new StatusCode(401, 'Wrong Token', 'Invalid session.'));
			return;
		}
		const token = req.headers.authorization?.replace('Bearer ', '');

		const rawResponse = tokenManager.refreshSessionToken(token);
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as ITokenResponse;
			res.status(200).json(response);
		}
	};

	public getCurrentUser = async (req: ITokenRequest, res: express.Response) => {
		//#swagger.summary = '현재 인증된 사용자의 정보를 반환합니다.'
		//#swagger.tags = ['Authorize']
		/*#swagger.security = [{
            "bearerAuth": []
    	}]*/
		/*#swagger.responses[200] = {
			description: '회원가입에 성공 한 경우 반환됩니다.',
			schema: {
			uuid: 'userUUID',
			userName: 'userName',
			email: 'userEmail',
			agreeTerms: true,
			createdAt: 1693118771,
			lastLoggedInAt: 1693118771,
			type: 'IUserResponse',
			}
  		}*/
		/*#swagger.responses[401] = {
			description: '제공된 AccessToken이 유효하지 않은 경우 반환됩니다.',
			schema: {
				code: 401,
				description: 'Wrong Token',
				userDescription: 'Invalid session.',
			}
  		}*/
		/*#swagger.responses[404] = {
			description: '대상 유저가 존재하지 않는 경우 반환됩니다.',
			schema: {
				code: 404,
				description: 'User Not Found',
				userDescription: 'Invalid uuid.',
			}
  		}*/

		if (!req.uuid) {
			res.status(401).json(new StatusCode(401, 'Wrong Token', 'Invalid session.'));
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
