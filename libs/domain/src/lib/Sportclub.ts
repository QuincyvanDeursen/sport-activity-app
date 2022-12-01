import { Address } from './Address';

export interface Sportclub {
  clubName: string;
  websiteURL: string;
  email: string;
  phoneNumber: string;
  sports: string[];
  address: Address;
}
