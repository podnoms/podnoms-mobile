export default class User {
    email?: string;
    id: string;
    slug: string;
    thumbnailUrl: string;
    fullName: string;
    token: string;
    refreshToken: string;

    constructor(
        id: string,
        name: string,
        thumbnailUrl: string,
        slug: string,
        token: string,
        refresh: string,
    ) {
        this.id = id;
        this.fullName = name;
        this.thumbnailUrl = thumbnailUrl;
        this.slug = slug;
        this.token = token;
        this.refreshToken = refresh;
    }

    static fromStorage(storage: any): User {
        return new User(
            storage.id,
            storage.fullName,
            storage.thumbnailUrl,
            storage.slug,
            storage.token,
            storage.refreshToken,
        );
    }
    static fromJson(json: any): User {
        return new User(
            json.id,
            json.name,
            json.thumbnailUrl,
            json.slug,
            json.auth.jwt.token,
            json.auth.refresh,
        );
    }
}
