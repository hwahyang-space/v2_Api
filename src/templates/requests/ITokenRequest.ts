import express from 'express';

interface ITokenRequest extends express.Request {
	body: {
		token?: string;
	};
	uuid?: string;
}

export default ITokenRequest;
