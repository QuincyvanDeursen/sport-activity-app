import { Role } from './Role';

export interface User {
  userId: number;
  username: string;
  password: string;
  roles: Role[];
}
