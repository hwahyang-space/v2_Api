import * as Redis from 'redis';

const config = require('../../config/config.json');

class RedisManager {
	private static instance: RedisManager;
	public static Instance = () => {
		if (!this.instance) {
			this.instance = new RedisManager();
		}
		return this.instance;
	};

	private readonly client;
	constructor() {
		this.client = Redis.createClient({
			socket: {
				host: config.redis.host,
				port: config.redis.port,
			},
			legacyMode: true,
		});
		this.client.connect();
	}

	public get = async (key: string): Promise<string> => {
		try {
			return await this.client.v4.get(key);
		} catch (e) {
			throw e;
		}
	};

	public set = async (key: string, value: string | null) => {
		try {
			return await this.client.v4.set(key, value);
		} catch (e) {
			throw e;
		}
	};

	public disconnect = async () => {
		await this.client.disconnect();
	};
}

export default RedisManager;
