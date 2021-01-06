import {Podcast} from '../../model/Podcast';
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
    validateUrl = async (url: string): boolean => {
        const client = await this.requestClient();
        const response = await client.get(`/urlprocess/validate?url=${url}`);
        return response && response.status === 200;
    };
    addPodcastEntry = async (
        podcastId: string,
        url: string,
        title: string,
    ): Promise<boolean> => {
        const client = await this.requestClient();
        const payload = {
            podcastId: podcastId,
            sourceUrl: url,
            processed: false,
            title: title || 'New from PodNoms Mobile',
            description: '',
            imageUrl: '',
        };
        const response = await client.post('/entry', payload);
        return response && response.status === 200;
    };
}

export default PodcastService;
