import util from 'util';
import { v4 } from 'uuid';
import crypto, { pbkdf2Sync } from 'crypto';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import TokenManager from './tokenManager';
import MySQLConnector from './mysqlConnector';

import StatusCode from '../templates/StatusCode';
import IUsers from '../templates/databases/users';
import IUserResponse from '../templates/responses/IUserResponse';
import IApprovalCodes from '../templates/databases/approvalcodes';
import ITokenResponse from '../templates/responses/ITokenResponse';

const config = require('../../config/config.json');

const tokenManager = new TokenManager();

class UserManager {
	private nameRule = /^[A-Za-z0-9ㄱ-ㅎ가-힣]{2,12}$/;
	private emailRule = /^[a-z0-9\.\-_]+@([a-z0-9\-]+\.)+[a-z]+$/;
	private passwordRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
	private approvalCodeRule = /^[A-Z0-9]{8}$/;

	constructor() {
		dayjs.extend(customParseFormat);
		dayjs.extend(utc);
		dayjs.extend(timezone);
		dayjs.tz.setDefault('Asia/Seoul');
	}

	private readonly randomBytesPromise = util.promisify(crypto.randomBytes);
	private createSalt = async () => {
		const buf = await this.randomBytesPromise(64);
		return buf.toString('base64');
	};

	public signIn = async (
		userEmail: string,
		userPassword: string
	): Promise<StatusCode | ITokenResponse> => {
		const now = dayjs();

		// 이메일 기반으로 유저 정보 획득
		const userData = (await MySQLConnector.Instance().QueryDataPacket(
			'SELECT * FROM users WHERE email = ?',
			[userEmail]
		)) as IUsers[];
		if (Object.keys(userData).length === 0) {
			return new StatusCode(
				401,
				'Authentication Failed',
				'Email or password does not match.'
			);
		}

		// 비밀번호 검증
		const key = await pbkdf2Sync(
			userPassword,
			userData[0].salt,
			config.security.passwordIteration,
			64,
			'sha512'
		);
		const hashedPassword = key.toString('base64');

		if (hashedPassword !== userData[0].password) {
			return new StatusCode(
				401,
				'Authentication Failed',
				'Email or password does not match.'
			);
		} else {
			// 최근 접속일 갱신
			MySQLConnector.Instance().Query('UPDATE users SET lastLoggedInAt = ? WHERE uuid = ?', [
				now.unix(),
				userData[0].uuid,
			]);

			// 토큰 발급
			return tokenManager.createSessionToken(userData[0].uuid);
		}
	};

	public signUp = async (
		userName: string,
		userEmail: string,
		userPassword: string,
		approvalCode: string,
		agreeTerms: boolean
	): Promise<StatusCode | ITokenResponse> => {
		// 정규식 검증
		if (!userName.match(this.nameRule)) {
			return new StatusCode(
				400,
				'Not Conforming Rules',
				'The name must be between 2 and 12 characters, and only English, numeric and Korean characters are allowed.'
			);
		}

		if (!userEmail.match(this.emailRule)) {
			return new StatusCode(400, 'Not Conforming Rules', 'Invalid e-mail format.');
		}

		if (!userPassword.match(this.passwordRule)) {
			return new StatusCode(
				400,
				'Not Conforming Rules',
				'The password must contain at least one English uppercase and lowercase letter, one number, and one special character each, and must be at least 8 characters long.'
			);
		}

		if (!approvalCode.match(this.approvalCodeRule)) {
			return new StatusCode(400, 'Not Conforming Rules', 'Invalid Approval Code format.');
		}

		if (!agreeTerms) {
			return new StatusCode(
				400,
				'Not Conforming Rules',
				'Please agree to the terms and conditions.'
			);
		}

		// Approval Code 유효성 검증
		const approvalCodeData = (await MySQLConnector.Instance().QueryDataPacket(
			'SELECT * FROM approvalcodes WHERE approvalCode = ?',
			[approvalCode]
		)) as IApprovalCodes[];
		if (Object.keys(approvalCodeData).length === 0 || approvalCodeData[0].isUsed) {
			return new StatusCode(400, 'Not Conforming Rules', 'Invalid Approval Code.');
		}

		// email, username 충돌여부 검증
		const userData = (await MySQLConnector.Instance().QueryDataPacket(
			'SELECT * FROM users WHERE userName = ? OR email = ?',
			[userName, userEmail]
		)) as IUsers[];
		if (Object.keys(userData).length !== 0) {
			return new StatusCode(
				400,
				'Not Conforming Rules',
				'Email (or nickname) already exists.'
			);
		}

		// Approval Code 사용 처리
		await MySQLConnector.Instance().Query(
			'UPDATE approvalCodes SET isUsed = 1 WHERE approvalCode = ?',
			[approvalCode]
		);

		// UUID 생성
		const uuid = v4();

		// 비밀번호 처리
		const salt = await this.createSalt();
		const key = await crypto.pbkdf2Sync(
			userPassword,
			salt,
			config.security.passwordIteration,
			64,
			'sha512'
		);
		const hashedPassword = key.toString('base64');

		// 현재 시간 획득
		const now = dayjs();

		// 회원 등록
		await MySQLConnector.Instance().Query(
			'INSERT INTO users(uuid, userName, email, password, salt, approvalcode, agreeTerms, createdAt, lastLoggedInAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[uuid, userName, userEmail, hashedPassword, salt, approvalCode, agreeTerms, now.unix(), now.unix()]
		);

		// 토큰 발급
		return tokenManager.createSessionToken(uuid);
	};

	public getUserData = async (uuid: string): Promise<StatusCode | IUserResponse> => {
		const userData = (await MySQLConnector.Instance().QueryDataPacket(
			'SELECT * FROM users WHERE uuid = ?',
			[uuid]
		)) as IUsers[];

		if (Object.keys(userData).length === 0) {
			return new StatusCode(404, 'User Not Found', 'Invalid uuid.');
		}

		const returnData: IUserResponse = {
			uuid: userData[0].uuid,
			userName: userData[0].userName,
			email: userData[0].email,
			agreeTerms: userData[0].agreeTerms,
			createdAt: userData[0].createdAt,
			lastLoggedInAt: userData[0].lastLoggedInAt,
			type: 'IUserResponse',
		};
		return returnData;
	};
}

export default UserManager;
