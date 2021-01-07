import AsyncStorage from '@react-native-async-storage/async-storage';
import getEnvVars from '../../environment';
import UserToken from '../../model/UserToken';

const {apiUrl} = getEnvVars();

class ApiService {
    protected requestClient = async () => {
        const axios = require('axios');
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const instance = axios.create({
            baseURL: apiUrl,
            maxRedirects: 0,
            headers: {'Content-Type': 'application/json'},
        });
        try {
            const user = await UserToken.fromStorage();
            if (user) {
                instance.interceptors.request.use((config) => {
                    config.headers = {
                        Authorization: `Bearer ${user.token}`,
                    };
                    return config;
                });
            }
        } catch (err) {}
        return instance;
    };
}
export default ApiService;
