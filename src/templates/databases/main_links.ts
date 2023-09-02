import { RowDataPacket } from 'mysql2';

interface IMain_Links extends RowDataPacket {
	id: number;
	faviconId: string;
	link: string;
	openInNewTab: boolean;
}

export default IMain_Links;
