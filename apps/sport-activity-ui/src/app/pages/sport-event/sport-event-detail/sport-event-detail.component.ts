import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SportEvent } from '@sport-activity-app/domain';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { SportEventService } from '../sport-event.service';

@Component({
  selector: 'sport-activity-app-sport-event-detail',
  templateUrl: './sport-event-detail.component.html',
  styleUrls: ['./sport-event-detail.component.css'],
})
export class SportEventDetailComponent implements OnInit, OnDestroy {
  sportEventId: string | null | undefined;
  sportEvent!: SportEvent;

  constructor(
    private sportEventService: SportEventService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.sportEventId = params.get('id');
      if (this.sportEventId) {
        this.getSportEventById(this.sportEventId);
      }
    });
  }

  ngOnDestroy(): void {
    console.log('sport-event-detail.component.ts destroyed');
  }

  ///////////////////////////////////////////////////////////
  //////////       Get sportevent functionality      ////////
  ///////////////////////////////////////////////////////////

  //get sportevent by id
  getSportEventById(id: string) {
    console.log('getting sportevent by id (ui)');
    this.sportEventService.getSportEventById(id).subscribe({
      next: (v) => {
        console.log(v);
        this.sportEvent = v;
      },
      error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
      complete: () => console.log('getting sportevent by id complete (ui)'),
    });
  }
}
