export default class UserToken {
    id: string;
    slug: string;
    name: string;
    token: string;
    refreshToken: string;

    constructor(
        id: string,
        name: string,
        slug: string,
        token: string,
        refresh: string,
    ) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.token = token;
        this.refreshToken = refresh;
    }

    static fromStorage(storage: any): UserToken {
        return new UserToken(
            storage.id,
            storage.name,
            storage.slug,
            storage.token,
            storage.refresh,
        );
    }
    static fromJson(json: any): UserToken {
        return new UserToken(
            json.id,
            json.name,
            json.slug,
            json.auth.jwt.token,
            json.auth.refresh,
        );
    }
}
