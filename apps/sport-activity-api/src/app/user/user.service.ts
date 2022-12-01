import { Injectable } from '@nestjs/common';
import { Role, User } from '@sport-activity-app/domain';

@Injectable()
export class UserService {
  //mock data
  private readonly users: User[] = [
    {
      email: 'quincyvandeursen@avans.nl',
      password: 'secret123',
      firstName: 'Quincy',
      lastName: 'van Deursen',
      city: 'BREDA',
      roles: [Role.Admin],
      sportclub: {
        clubName: 'AlphaGym',
        websiteURL: 'https://maxgymfysio.nl/',
        email: 'maxfysio@gmail.com',
        phoneNumber: '0612345678',
        sports: ['Powerliften', 'Weightlifting'],
        address: {
          city: 'BREDA',
          zipCode: '1234MB',
          street: 'Lisdodde',
          houseNumber: '103',
        },
      },
    },
    {
      email: 'jimmyvandeursen@avans.nl',
      password: 'secret123',
      firstName: 'Jimmy',
      lastName: 'van Deursen',
      city: 'BREDA',
      roles: [Role.User],
      sportclub: undefined,
    },
  ];

  async findOne(email: string): Promise<User | undefined> {
    const foundUser = this.users.find((user) => user.email === email);
    console.log('User Service method FindOne called.');
    if (foundUser) {
      console.log('User Service Found User:');
      console.log(foundUser);
      return foundUser;
    }
    console.log('User Service found no user.');
  }
}
