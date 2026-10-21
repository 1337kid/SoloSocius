export interface ApiErrorResponse {
  error: string;
}

export interface MessageResponse {
  message: string;
}

export interface ActionResponse {
  message: string;
  status?: string;
}

export interface MediaItem {
  url: string;
  mimeType: string;
}

export interface DeleteSuccessResponse {
  success: true;
}
