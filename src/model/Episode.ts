export class Episode {
    id?: string;
    title?: string;
    author?: string;
    description?: string;
    sourceUrl?: string;
    audioUrl?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    processed: boolean = true;
    createDate?: Date;
    processingStatus?: string;
    processingPayload?: string;
    podcastSlug?: string;
    podcastTitle?: string;
    podcastId?: string;
    lastEntryDate?: Date;

    public static fromJson(json): Episode {
        const result = new Episode();
        result.id = json.id;
        result.title = json.title;
        result.author = json.author;
        result.description = json.description;
        result.sourceUrl = json.sourceUrl;
        result.audioUrl = json.audioUrl;
        result.imageUrl = json.imageUrl;
        result.thumbnailUrl = json.thumbnailUrl;
        result.processed = json.processed;
        result.createDate = json.createDate;
        result.processingStatus = json.processingStatus;
        result.processingPayload = json.processingPayload;
        result.podcastSlug = json.podcastSlug;
        result.podcastTitle = json.podcastTitle;
        result.podcastId = json.podcastId;
        result.lastEntryDate = json.lastEntryDate;

        return result;
    }
}
