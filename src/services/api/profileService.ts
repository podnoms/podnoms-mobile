import {Profile} from '../../model/Profile';
import {Logger} from '../logger';
import ApiService from './apiService';
const logger = Logger.getInstance();
class ProfileService extends ApiService {
    public getProfile = async (): Promise<Profile | null> => {
        const client = await this.requestClient();

        try {
            const response = await client.get('/profile');
            if (response && response.status === 200) {
                return Profile.fromJson(response.data);
            }
        } catch (err) {
            logger.error('Exception fetching profile', err);
        }
        return null;
    };
}
export default ProfileService;
