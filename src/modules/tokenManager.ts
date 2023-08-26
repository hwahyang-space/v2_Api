import * as jwt from 'jsonwebtoken';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import MySQLConnector from './mysqlConnector';

import ITokenPayload from '../templates/ITokenPayload';
import ITokenResponse from '../templates/responses/ITokenResponse';
import StatusCode from '../templates/StatusCode';

const config = require('../../config/config.json');

// TODO: refresh 된 token은 폐기되어야 함 (아니면 무한복제 가능)
class TokenManager {
	constructor() {
		dayjs.extend(customParseFormat);
		dayjs.extend(utc);
		dayjs.extend(timezone);
		dayjs.tz.setDefault('Asia/Seoul');
	}

	public createSessionToken = (uuid: string): ITokenResponse => {
		const now = dayjs();

		const accessPayload: ITokenPayload = {
			uuid: uuid,
			payloadType: 'access',
			type: 'ITokenPayload',
		};
		const refreshPayload: ITokenPayload = {
			uuid: uuid,
			payloadType: 'refresh',
			type: 'ITokenPayload',
		};

		const accessToken: string = jwt.sign(accessPayload, config.security.accessTokenSecret, {
			algorithm: 'HS256',
			expiresIn: config.security.accessTokenExpires,
		});

		const refreshToken: string = jwt.sign(refreshPayload, config.security.refreshTokenSecret, {
			algorithm: 'HS256',
			expiresIn: config.security.refreshTokenExpires,
		});

		const accessTokenExpiresAt = now
			.add(
				config.security.accessTokenExpires.slice(
					0,
					config.security.accessTokenExpires.length - 1
				),
				config.security.accessTokenExpires.slice(
					config.security.accessTokenExpires.length - 1
				)
			)
			.unix();
		const refreshTokenExpiresAt = now
			.add(
				config.security.refreshTokenExpires.slice(
					0,
					config.security.refreshTokenExpires.length - 1
				),
				config.security.refreshTokenExpires.slice(
					config.security.refreshTokenExpires.length - 1
				)
			)
			.unix();

		const response: ITokenResponse = {
			accessToken: accessToken,
			accessTokenExpiresAt: accessTokenExpiresAt,
			refreshToken: refreshToken,
			refreshTokenExpiresAt: refreshTokenExpiresAt,
			type: 'ITokenResponse',
		};

		return response;
	};

	public validateSessionToken = (
		token: string,
		isAccessToken: boolean = true /* false -> Refresh Token */
	): StatusCode | ITokenPayload => {
		try {
			const decoded: ITokenPayload = jwt.verify(
				token,
				isAccessToken
					? config.security.accessTokenSecret
					: config.security.refreshTokenSecret
			) as ITokenPayload;
			if (!decoded.uuid || !decoded.payloadType) {
				return new StatusCode(401, 'Wrong Token', '유효하지 않은 세션입니다.');
			} else {
				return decoded;
			}
		} catch (err) {
			const convertedError: jwt.JsonWebTokenError = err as jwt.JsonWebTokenError;
			return new StatusCode(401, 'Wrong Token', '유효하지 않은 세션입니다.');
		}
	};

	public refreshSessionToken = (refreshToken: string): StatusCode | ITokenResponse => {
		const now = dayjs();

		const tokenRawResponse = this.validateSessionToken(refreshToken, false);
		if (tokenRawResponse instanceof StatusCode) {
			return tokenRawResponse as StatusCode;
		} else {
			const tokenResponse = tokenRawResponse as ITokenPayload;

			// 최근 접속일 갱신
			MySQLConnector.Instance().Query('UPDATE users SET lastLoggedInAt = ? WHERE uuid = ?', [
				now.unix(),
				tokenResponse.uuid,
			]);

			return this.createSessionToken(tokenResponse.uuid);
		}
	};
}

export default TokenManager;
