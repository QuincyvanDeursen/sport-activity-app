import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sport-activity-app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  public isMenuCollapsed = true;
  constructor() {}

  ngOnInit(): void {}
}
