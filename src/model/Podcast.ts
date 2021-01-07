import {Episode} from './Episode';

export class Podcast {
    id?: string;
    description?: string;
    strippedDescription?: string;
    slug?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    customDomain?: string;
    customRssDomain?: string;
    rssUrl?: string;
    pagesUrl?: string;
    createDate?: Date;
    notifications?: Array<Notification>;

    title?: string;
    publicTitle?: string;
    facebookUrl?: string;
    twitterUrl?: string;

    private?: boolean;
    authUserName?: string;
    authPassword?: string;

    lastEntryDate?: Date;
    entryCount?: number;

    episodes: Episode[];

    constructor() {
        this.episodes = [];
    }

    public static fromJson(json: any) {
        const podcast: Podcast = new Podcast();

        podcast.id = json.id;
        podcast.title = json.title;
        podcast.createDate = json.createDate;
        podcast.description = json.description || '';
        podcast.strippedDescription = json.strippedDescription || '';
        podcast.slug = json.slug;
        podcast.imageUrl = json.imageUrl;
        podcast.thumbnailUrl = json.thumbnailUrl;
        podcast.publicTitle = json.publicTitle;

        podcast.episodes = json.podcastEntries;
        return podcast;
    }
}
