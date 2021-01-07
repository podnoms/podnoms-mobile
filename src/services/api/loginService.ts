import UserToken from '../../model/UserToken';
import Logger from '../logger';
import ApiService from './apiService';


class LoginService extends ApiService {
    loginUser = async (userName: string, password: string) => {
        const client = await this.requestClient();

        const payload = {
            username: userName,
            password: password,
        };
        try {
            const response = await client.post('/auth/login', payload);

            if (response && response.status === 200) {
                return UserToken.fromJson(response.data);
            }
        } catch (err) {
            Logger.error('Exception validating user', err);
        }
        return null;
    };

    refreshToken = async (accessToken: string, refreshToken: string) => {

        const client = await this.requestClient();
        const payload = {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
        try {
            const response = await client.post('/auth/refreshtoken', payload);
            if (response && response.status === 200) {
                return UserToken.fromJson(response.data);
            }
        } catch (err) {
            Logger.error('Exception validating user', err);
        }
        return null;
    };
}

export default LoginService;
