import express from 'express';

interface ISignInRequest extends express.Request {
	body: {
		email?: string;
		password?: string;
        captcha?: string;
	};
}

export default ISignInRequest;
