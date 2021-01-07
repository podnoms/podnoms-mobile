import AsyncStorage from '@react-native-async-storage/async-storage';
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

    static async fromStorage(): Promise<UserToken> {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
            const storage = JSON.parse(stored);
            return new UserToken(
                storage.id,
                storage.name,
                storage.slug,
                storage.token,
                storage.refresh,
            );
        }
        throw 'No user token stored';
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
