import express from 'express';

import MainPageManager from '../MainPageManager';

import StatusCode from '../../templates/StatusCode';
import IMainBaseDataRequest from '../../templates/requests/IMainBaseDataRequest';
import IMainLinksDataRequest from '../../templates/requests/IMainLinksDataRequest';

import IMain_Links from '../../templates/databases/main_links';
import IMain_BaseData from '../../templates/databases/main_basedata';

const mainPageManager = new MainPageManager();

class Main {
	public baseData = async (req: express.Request, res: express.Response) => {
		//#swagger.summary = '기반 데이터를 반환합니다.'
		//#swagger.tags = ['Main']
		/*#swagger.responses[200] = {
			description: '조회에 성공 한 경우 반환됩니다.',
			schema: {
				id: 1,
				frontName: 'frontName',
				backName: 'backName',
				description: 'myDescription',
				profileImage: 'https://example.com/example.png',
			}
  		}*/
		/*#swagger.responses[500] = {
			description: '서버에 기록된 데이터가 올바르지 않은 경우 반환됩니다.',
			schema: {
				code: 500,
				description: 'Internal Server Error',
				userDescription: 'Internal Server Error',
			}
  		}*/
		const rawResponse = await mainPageManager.getBaseData();
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as IMain_BaseData;
			res.json(response);
		}
	};

	public postBaseData = async (req: IMainBaseDataRequest, res: express.Response) => {
		//#swagger.summary = '기반 데이터를 갱신합니다.'
		//#swagger.tags = ['Main']
		/*#swagger.security = [{
            "bearerAuth": []
    	}]*/
		/*#swagger.responses[200] = {
			description: '갱신에 성공 한 경우 반환됩니다.',
			schema: {
				code: 200,
				description: '',
				userDescription: '',
			}
  		}*/
		/*#swagger.responses[400] = {
			description: '한 개 이상의 항목이 누락 된 경우나 입력 한 값이 규칙에 부합하지 않는 경우 반환됩니다.',
			schema: {
				code: 400,
				description: 'Missing Parameters',
				userDescription: 'Please double check that you have filled out all items.',
			}
  		}*/
		/*#swagger.responses[401] = {
			description: '제공된 AccessToken이 유효하지 않은 경우 반환됩니다.',
			schema: {
				code: 401,
				description: 'Wrong Token',
				userDescription: 'Invalid session.',
			}
  		}*/
		if (
			!req.uuid ||
			!req.body ||
			!req.body.frontName ||
			!req.body.backName ||
			!req.body.description ||
			!req.body.profileImage ||
			!req.body.backgroundImage
		) {
			res.status(400).json(
				new StatusCode(
					400,
					'Missing Parameters',
					'Please double check that you have filled out all items.'
				)
			);
			return;
		}

		const response = await mainPageManager.setBaseData(
			req.body.frontName,
			req.body.backName,
			req.body.description,
			req.body.profileImage,
			req.body.backgroundImage
		);
		res.status(response.code).json(response);
	};

	public links = async (req: express.Request, res: express.Response) => {
		//#swagger.summary = '링크 목록을 반환합니다.'
		//#swagger.tags = ['Main']
		/*#swagger.responses[200] = {
			description: '조회에 성공 한 경우 반환됩니다.',
			schema: [
				{
					id: 1,
					faviconId: 'fa-solid fa-house',
					link: 'https://example.com',
					openInNewTab: false,
				}
			]
  		}*/
		/*#swagger.responses[500] = {
			description: '서버에 기록된 데이터가 올바르지 않은 경우 반환됩니다.',
			schema: {
				code: 500,
				description: 'Internal Server Error',
				userDescription: 'Internal Server Error',
			}
  		}*/
		const rawResponse = await mainPageManager.getLinksData();
		if (rawResponse instanceof StatusCode) {
			const response = rawResponse as StatusCode;
			res.status(response.code).json(response);
		} else {
			const response = rawResponse as IMain_Links[];
			res.json(response);
		}
	};

	public postLinks = async (req: IMainLinksDataRequest, res: express.Response) => {
		//#swagger.summary = '링크 목록을 갱신합니다.'
		//#swagger.tags = ['Main']
		/*#swagger.security = [{
            "bearerAuth": []
    	}]*/
		/*#swagger.responses[200] = {
			description: '갱신에 성공 한 경우 반환됩니다.',
			schema: {
				code: 200,
				description: '',
				userDescription: '',
			}
  		}*/
		/*#swagger.responses[400] = {
			description: '한 개 이상의 항목이 누락 된 경우나 입력 한 값이 규칙에 부합하지 않는 경우 반환됩니다.',
			schema: {
				code: 400,
				description: 'Missing Parameters',
				userDescription: 'Please double check that you have filled out all items.',
			}
  		}*/
		/*#swagger.responses[401] = {
			description: '제공된 AccessToken이 유효하지 않은 경우 반환됩니다.',
			schema: {
				code: 401,
				description: 'Wrong Token',
				userDescription: 'Invalid session.',
			}
  		}*/
		if (!req.uuid || !req.body) {
			res.status(400).json(
				new StatusCode(
					400,
					'Missing Parameters',
					'Please double check that you have filled out all items.'
				)
			);
			return;
		}

		let isErr = false;
		req.body.forEach((target) => {
			if (!target.faviconId || !target.link || target.openInNewTab == undefined) {
				isErr = true;
				res.status(400).json(
					new StatusCode(
						400,
						'Missing Parameters',
						'Please double check that you have filled out all items.'
					)
				);
				return;
			}
		});
		if (isErr) return;

		const response = await mainPageManager.setLinksData(req);
		res.status(response.code).json(response);
	};
}

export default Main;
