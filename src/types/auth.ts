export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password1: string;
  password2: string;

  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthApiUser {
  id: number | string;
  email: string;
  username?: string;
  profile_pic?: string | null;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

export interface AuthApiResponse {
  access: string;
  refresh?: string;
  user?: AuthApiUser;
  [key: string]: unknown;
}

