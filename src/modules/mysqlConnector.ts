import mysql from 'mysql2/promise';

const config = require('../../config/config.json');

class MySQLConnector {
	private static instance: MySQLConnector;
	public static Instance = () => {
		if (!this.instance) {
			this.instance = new MySQLConnector();
		}
		return this.instance;
	};

	private connection: mysql.Pool;

	constructor() {
		this.connection = mysql.createPool({
			host: config.database.host,
			user: config.database.user,
			password: config.database.password,
			database: config.database.database,

			connectionLimit: config.database.connectionLimit,
			queueLimit: config.database.queueLimit,

			waitForConnections: true,
			keepAliveInitialDelay: config.database.keepAliveInitialDelay,
			enableKeepAlive: true,
		});
	}

	public QueryDataPacket = async (
		query: string,
		parameters: Array<any>
	): Promise<mysql.RowDataPacket[]> => {
		const [rows, fields]: [mysql.RowDataPacket[], mysql.FieldPacket[]] =
			await this.connection.execute(query, parameters);
		return rows;
	};

	public Query = async (query: string, parameters: Array<any>): Promise<null> => {
		await this.connection.execute(query, parameters);
		return null;
	};
}

export default MySQLConnector;
