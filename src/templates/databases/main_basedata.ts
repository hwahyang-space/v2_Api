import { RowDataPacket } from 'mysql2';

interface IMain_BaseData extends RowDataPacket {
	id: number;
	frontName: string;
	backName: string;
	description: string;
	profileImage: string;
	backgroundImage: string;
}

export default IMain_BaseData;
