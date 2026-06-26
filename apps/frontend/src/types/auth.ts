export interface AuthRequest {
  username: string;
  password: string;
}

export interface User {
  username: string;
}

export interface AuthStatus {
  configured: boolean;
}
