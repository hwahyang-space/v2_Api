import { RowDataPacket } from 'mysql2';

interface IUsers extends RowDataPacket {
	uuid: string;
	userName: string;
	email: string;
	password: string;
	salt: string;
	agreeTerms: boolean;
	createdAt: number;
	lastLoggedInAt: number;
}

export default IUsers;
