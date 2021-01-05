import { Podcast } from '../../model/Podcast';
import ApiService from './apiService';

class PodcastService extends ApiService {
    getPodcasts = async (): Promise<Podcast[]> => {
        const client = await this.requestClient();

        try {
            const response = await client.get('/podcast');
            if (response && response.status === 200) {
                return response.data.map((podcast) =>
                    Podcast.fromJson(podcast),
                );
            }
        } catch (err) {
            console.error('Exception fetching podcasts', err);
        }
        return [];
    };
}

export default PodcastService;
