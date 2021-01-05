export class Profile {
    id: string;
    slug: string;
    email: string;
    name: string;
    description: string;
    twitterHandle: string;
    profileImageUrl: string;
    thumbnailImageUrl: string;
    apiKey: string;
    firstName: string;
    lastName: string;
    podcastCount: number;
    episodeCount: number;
    constructor() {
        this.id = '';
        this.slug = '';
        this.email = '';
        this.name = '';
        this.description = '';
        this.twitterHandle = '';
        this.profileImageUrl = '';
        this.thumbnailImageUrl = '';
        this.apiKey = '';
        this.firstName = '';
        this.lastName = '';
        this.podcastCount = 0;
        this.episodeCount = 0;
    }
    static fromJson(json: any): Profile {
        const profile: Profile = {
            id: json.id,
            slug: json.slug,
            email: json.email,
            name: json.name,
            description: json.description,
            twitterHandle: json.twitterHandle,
            profileImageUrl: json.profileImageUrl,
            thumbnailImageUrl: json.thumbnailImageUrl,
            apiKey: json.apiKey,
            firstName: json.firstName,
            lastName: json.lastName,
            podcastCount: json.podcastCount,
            episodeCount: json.episodeCount,
        };
        return profile;
    }
}
