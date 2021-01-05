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

  publicTitle?: string;
  facebookUrl?: string;
  twitterUrl?: string;

  private?: boolean;
  authUserName?: string;
  authPassword?: string;

  lastEntryDate?: Date;
  entryCount?: number;

  public static fromJson(json: any) {
    const podcast: Podcast = new Podcast();

    podcast.id = json.id;
    podcast.description = json.description;
    podcast.strippedDescription = json.strippedDescription;
    podcast.slug = json.slug;
    podcast.imageUrl = json.imageUrl;
    // podcast.thumbnailUrl = json.thumbnailUrl;
    podcast.thumbnailUrl = 'http://placebeard.it/640/480';
    podcast.publicTitle = json.publicTitle;
    return podcast;
  }
}
