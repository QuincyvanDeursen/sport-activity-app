import { Role } from './Role';
import { Sportclub } from './Sportclub';

export interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city: string;
  roles: Role[];
  sportclub?: Sportclub;
}
