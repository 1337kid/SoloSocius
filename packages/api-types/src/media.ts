export interface UploadedMediaResponse {
  key: string;
  url: string;
  width: number;
  height: number;
  mimeType: string;
}

export interface DeleteAttachmentRequest {
  key: string;
}
