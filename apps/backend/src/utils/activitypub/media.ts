import type { MediaItem } from "../../db/schema.js";

export const parseMediaItems = (attachment: any) => {
  let mediaItems: MediaItem[] = [];
  for (const mediaItem of attachment || []) {
    mediaItems.push({
      url: mediaItem.url,
      mimeType: mediaItem.mediaType,
    });
  }
  return mediaItems;
};

export const parseAttachmentsForActivity = (attachments: MediaItem[]) => {
  return attachments.map((attachment) => {
    return {
      type: "Image",
      mediaType: attachment.mimeType,
      url: attachment.url,
    };
  });
};
