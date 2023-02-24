import { Role } from './Role';
import { Sportclub } from './Sportclub';

export interface User {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city: string;
  roles: Role[];
  sportclub?: Sportclub;
  followingUsers?: string[];
  enrolledSportEvents?: string[];
}
