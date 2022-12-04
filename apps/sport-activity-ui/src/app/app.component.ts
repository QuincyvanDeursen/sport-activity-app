import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'sport-activity-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'sport-activity-ui';
  @HostListener('window:beforeunload', ['$event'])
  clearLocalStorage() {
    localStorage.clear();
  }
}
