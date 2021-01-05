import UserToken from '../../model/UserToken';
import ApiService from './apiService';
import {logger} from 'react-native-logs';
const log = logger.createLogger();
log.debug('loginService', 'Bootstrapping');

class LoginService extends ApiService {
    loginUser = async (userName: string, password: string) => {
        log.debug('loginService', 'Logging in', userName);
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
            console.error('Exception validating user', err);
        }
        return null;
    };
}

export default LoginService;
