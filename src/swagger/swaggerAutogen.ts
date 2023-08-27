import swaggerAutogen from 'swagger-autogen';

import packageData from '../../package.json';

const config = require('../../config/config.json');

const options = {
	info: {
		version: packageData.version,
		title: config.swagger.title,
		description: config.swagger.description,
	},
	servers: config.swagger.servers,
	tags: [
		{
			name: 'Authorize',
			description: '사용자의 인증과 관련된 사항을 정의합니다.',
		},
	],
	components: {
        securitySchemes:{
            bearerAuth: {
                type: 'http',
                scheme: 'bearer'
            }
        }
    }
};

swaggerAutogen({ openapi: '3.0.0' })('./swagger-output.json', ['../app.ts'], options);
