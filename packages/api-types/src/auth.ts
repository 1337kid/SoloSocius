export interface AuthCredentialsRequest {
  username: string;
  password: string;
}

export interface AuthStatusResponse {
  configured: boolean;
}

export interface AuthUserResponse {
  username: string;
}
