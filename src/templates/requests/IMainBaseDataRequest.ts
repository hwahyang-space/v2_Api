import ITokenRequest from "./ITokenRequest"

interface IMainBaseDataRequest extends ITokenRequest {
	body: {
        frontName?: string;
        backName?: string;
        description?: string;
        profileImage?: string;
        backgroundImage?: string;
	};
    uuid?: string;
}

export default IMainBaseDataRequest;