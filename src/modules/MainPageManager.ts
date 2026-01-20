import MySQLConnector from './mysqlConnector';
import { LogLevel, LogManager } from './logManager';

import StatusCode from '../templates/StatusCode';
import IMainLinksDataRequest from '../templates/requests/IMainLinksDataRequest';

import IMain_Links from '../templates/databases/main_links';
import IMain_BaseData from '../templates/databases/main_basedata';
import RedisManager from './redisManager';

class MainPageManager {
	private readonly logManager = new LogManager('MainPageManager');

	private readonly BASEDATA_KEY = 'hspace_v2_api_MainPageManager_BaseData';
	private readonly LINKSDATA_KEY = 'hspace_v2_api_MainPageManager_Links';

	public getBaseData = async (): Promise<IMain_BaseData | StatusCode> => {
		const cacheData = await RedisManager.Instance().get(this.BASEDATA_KEY);

		if (cacheData) {
			return JSON.parse(cacheData) as IMain_BaseData;
		} else {
			const data = (await MySQLConnector.Instance().QueryDataPacket(
				'SELECT * FROM main_basedata',
				[]
			)) as IMain_BaseData[];
			if (data.length === 0) {
				return new StatusCode(500, 'Internal Server Error', 'Internal Server Error');
			} else {
				await RedisManager.Instance().set(this.BASEDATA_KEY, JSON.stringify(data[0]));
				return data[0];
			}
		}
	};

	public setBaseData = async (
		frontName: string,
		backName: string,
		description: string,
		profileImage: string,
		backgroundImage: string
	): Promise<StatusCode> => {
		await MySQLConnector.Instance().Query('TRUNCATE TABLE main_basedata', []);
		await MySQLConnector.Instance().Query(
			'INSERT main_basedata INTO(frontName, backName, description, profileImage, backgroundImage) VALUES(?, ?, ?, ?, ?)',
			[frontName, backName, description, profileImage, backgroundImage]
		);

		await RedisManager.Instance().set(this.BASEDATA_KEY, null);

		return new StatusCode(200, '', '');
	};

	public getLinksData = async (): Promise<IMain_Links[] | StatusCode> => {
		const cacheData = await RedisManager.Instance().get(this.LINKSDATA_KEY);

		if (cacheData) {
			return JSON.parse(cacheData) as IMain_Links[];
		} else {
			const data = (await MySQLConnector.Instance().QueryDataPacket(
				'SELECT * FROM main_links',
				[]
			)) as IMain_Links[];
			if (data.length === 0) {
				return new StatusCode(500, 'Internal Server Error', 'Internal Server Error');
			} else {
				await RedisManager.Instance().set(this.LINKSDATA_KEY, JSON.stringify(data));
				return data;
			}
		}
	};

	public setLinksData = async (datas: IMainLinksDataRequest): Promise<StatusCode> => {
		await MySQLConnector.Instance().Query('TRUNCATE TABLE main_links', []);

		for (const data of datas.body) {
			await MySQLConnector.Instance().Query(
				'INSERT main_links INTO(faviconId, link, openInNewTab) VALUES(?, ?, ?)',
				[data.faviconId, data.link, data.openInNewTab]
			);
		}

		await RedisManager.Instance().set(this.LINKSDATA_KEY, null);

		return new StatusCode(200, '', '');
	};
}

export default MainPageManager;
