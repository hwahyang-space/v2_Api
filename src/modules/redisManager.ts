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

	private readonly client: ReturnType<typeof Redis.createClient>;
	constructor() {
		this.client = Redis.createClient({
			socket: {
				host: config.redis.host,
				port: config.redis.port,
			},
		});
		void this.client.connect();
	}

	public get = async (key: string): Promise<string | null> => {
		return await this.client.get(key);
	};

	public set = async (key: string, value: string | null) => {
		return await this.client.set(key, value!);
	};

	public disconnect = async () => {
		await this.client.disconnect();
	};
}

export default RedisManager;
