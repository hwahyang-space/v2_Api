import Client from 'ftp';
import express from 'express';

import StatusCode from '../../templates/StatusCode';
import IMainBaseDataRequest from '../../templates/requests/IMainBaseDataRequest';

class File {
	public postFile = async (req: IMainBaseDataRequest, res: express.Response) => {
		//#swagger.summary = '파일을 업로드합니다.'
		//#swagger.tags = ['File']
		/*#swagger.security = [{
            "bearerAuth": []
    	}]*/
		/*#swagger.consumes = ['multipart/form-data']  
        #swagger.parameters['File'] = {
            in: 'file',
            type: 'file',
            required: 'true',
            description: '업로드 할 파일을 지정합니다.',
        }*/
		/*#swagger.responses[200] = {
			description: '업로드에 성공 한 경우 반환됩니다.',
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
		if (!req.uuid || !req.file) {
			res.status(400).json(
				new StatusCode(
					400,
					'Missing Parameters',
					'Please double check that you have filled out all items.'
				)
			);
			return;
		}

		const ftp = new Client();
		const ftpConfig = {
			host: 'ftp.example.com',
			port: 21,
			user: 'username',
			password: 'password',
		};

		ftp.connect(ftpConfig);

		const fileBuffer = req.file.buffer;
		const remoteFilePath = '/uploads/' + req.file.originalname;
		ftp.put(fileBuffer, remoteFilePath, (err) => {
			if (err) {
				console.error('FTP 업로드 에러:', err);
				res.status(500).send('FTP 업로드 실패');
			} else {
				console.log('FTP 업로드 성공');
				res.status(200).send('FTP 업로드 성공');
			}
			ftp.end();
		});
	};
}

export default File;
