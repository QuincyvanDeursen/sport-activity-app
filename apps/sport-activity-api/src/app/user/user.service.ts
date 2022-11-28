import { Injectable } from '@nestjs/common';
import { Role, User } from '@sport-activity-app/domain';

@Injectable()
export class UserService {
  //mock data
  private readonly users: User[] = [
    {
      userId: 1,
      username: 'anna',
      password: '12345',
      roles: [Role.User],
    },
    {
      userId: 2,
      username: 'andrew',
      password: '54321',
      roles: [Role.Admin],
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
