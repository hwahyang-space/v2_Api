import express from 'express';

interface ISignInRequest extends express.Request {
	body: {
		email?: string;
		password?: string;
	};
}

export default ISignInRequest;
