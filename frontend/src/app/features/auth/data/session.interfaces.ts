export interface SessionUser {
  _id?: string;
  sub?: string;
  userId?: string;
  username: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

export interface SessionState {
  token: string;
  user: SessionUser;
  expiresAt: number | null;
}
