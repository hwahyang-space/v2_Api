interface ITokenPayload {
	uuid: string;
	payloadType: 'access' | 'refresh';
	type: 'ITokenPayload';
}

export default ITokenPayload;
