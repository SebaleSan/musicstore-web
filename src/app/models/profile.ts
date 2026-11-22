export type Role = 'ADMIN' | 'USER';

export interface Profile {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ProfileUpdateRequest {
  email: string;
  password?: string;
}
