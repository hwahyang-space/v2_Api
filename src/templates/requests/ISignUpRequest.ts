import express from 'express';

interface ISignUpRequest extends express.Request {
	body: {
		name?: string;
		email?: string;
		password?: string;
		approvalCode?: string;
		agreeTerms?: boolean;
	};
}

export default ISignUpRequest;
