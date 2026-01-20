interface ITokenResponse {
	accessToken: string;
	accessTokenExpiresAt: number;
	refreshToken: string;
	refreshTokenExpiresAt: number;
	type: 'ITokenResponse';
}

export default ITokenResponse;
