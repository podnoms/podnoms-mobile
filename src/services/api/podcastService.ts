import {Episode} from '../../model/Episode';
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
    validateUrl = async (url: string): Promise<any> => {
        console.log('podcastService', 'validateUrl', url);
        try {
            const client = await this.requestClient();
            const response = await client.get(
                `/urlprocess/validate?url=${url}`,
            );
            return (
                (response && {
                    type: response.data.type,
                    title: response.data.links[0].title,
                }) ||
                {}
            );
        } catch (err) {
            console.error('podcastService', 'validateUrl', err);
            throw err;
        }
    };
    addPodcastEntry = async (
        podcastId: string,
        url: string,
        title: string,
    ): Promise<Episode> => {
        console.log('podcastService', 'Creating client');
        try {
            const client = await this.requestClient();
            const payload = {
                podcastId: podcastId,
                sourceUrl: url,
                processed: false,
                title: title || 'New from PodNoms Mobile',
                description: '',
                imageUrl: '',
            };
            console.log('podcastService', 'Payload', payload);
            const response = await client.post('/entry', payload);
            console.log('podcastService', 'Response', response);
            return (
                response &&
                response.status === 200 &&
                Episode.fromJson(response.data)
            );
        } catch (err) {
            console.error('podcastService', 'addPodcastEntry', err);
            throw err;
        }
    };
}

export default PodcastService;
