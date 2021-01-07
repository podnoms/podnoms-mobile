import { Profile } from '../../model/Profile';
import Logger from '../logger';
import ApiService from './apiService';

class ProfileService extends ApiService {
    public getProfile = async (): Promise<Profile | null> => {
        const client = await this.requestClient();

        try {
            const response = await client.get('/profile');
            if (response && response.status === 200) {
                return Profile.fromJson(response.data);
            }
        } catch (err) {
            Logger.error('Exception fetching profile', err);
        }
        return null;
    };
}
export default ProfileService;
