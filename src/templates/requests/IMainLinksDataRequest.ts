import ITokenRequest from './ITokenRequest';

interface IMainLinksDataRequest extends ITokenRequest {
	body: [
		{
			faviconId?: string;
			link?: string;
			openInNewTab?: boolean;
		},
	];
	uuid?: string;
}

export default IMainLinksDataRequest;
