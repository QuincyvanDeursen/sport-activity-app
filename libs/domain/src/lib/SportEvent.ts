import { User } from './User';
export interface SportEvent {
  _id?: string;
  title: string;
  description: string;
  price: number;
  startDateAndTime: Date;
  durationInMinutes: number;
  maximumNumberOfParticipants: number;
  enrolledParticipants?: string[];
  host: User;
}
