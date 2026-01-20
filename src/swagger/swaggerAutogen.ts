import swaggerAutogen from 'swagger-autogen';

import config from '../config';

const options = {
	info: {
		version: '1.0.0',
		title: config.swagger.title,
		description: config.swagger.description,
	},
	servers: config.swagger.servers,
	tags: [
		{
			name: 'Authorize',
			description: '사용자의 인증과 관련된 사항을 정의합니다.',
		},
		{
			name: 'Main',
			description: '메인 페이지와 관련된 사항을 정의합니다.',
		},
		{
			name: 'File',
			description: '파일과 관련된 사항을 정의합니다.',
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
			},
		},
	},
};

swaggerAutogen({ openapi: '3.0.0' })('./swagger-output.json', ['../app.ts'], options)
	.then(() => {
		console.log('Swagger-autogen: Success');
	})
	.catch((err: unknown) => {
		console.error('Swagger-autogen: Error', err);
	});
