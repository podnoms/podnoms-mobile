export class Episode {
    uid?: string;
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
}
