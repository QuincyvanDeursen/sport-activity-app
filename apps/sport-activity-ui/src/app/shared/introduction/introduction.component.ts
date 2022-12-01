import { Component, OnInit } from '@angular/core';
import { Role, User } from '@sport-activity-app/domain';

@Component({
  selector: 'sport-activity-app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
})
export class IntroductionComponent implements OnInit {
  constructor() {}
  user: User = {
    email: 'jimmyvandeursen@avans.nl',
    password: 'secret123',
    firstName: 'Jimmy',
    lastName: 'van Deursen',
    city: 'BREDA',
    roles: [Role.User],
    sportclub: undefined,
  };

  ngOnInit(): void {}
}
