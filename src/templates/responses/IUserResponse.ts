interface IUserResponse {
    uuid:string;
	userName: string;
	email: string;
	agreeTerms: boolean;
	createdAt: number;
	lastLoggedInAt: number;
	type: 'IUserResponse';
}

export default IUserResponse;
