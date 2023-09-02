import express from 'express';

interface ITokenRequest extends express.Request {
	uuid?: string;
}

export default ITokenRequest;
