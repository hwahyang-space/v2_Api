import { RowDataPacket } from 'mysql2';

interface IApprovalCodes extends RowDataPacket {
	approvalCode: string;
	createdBy: string;
	createdAt: number;
	isUsed: boolean;
}

export default IApprovalCodes;
