import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role, SportEvent } from '@sport-activity-app/domain';
import { HasRoles } from '../app/auth/AuthTsFiles/roles.decorator';
import { RolesGuard } from '../app/auth/AuthTsFiles/roles.guard';

import { SportEventService } from './sport-event.service';

@Controller('sportevent')
export class SportEventController {
  constructor(private readonly sportEventService: SportEventService) {}

  // create sport event endpoint
  @HasRoles(Role.Employee, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create')
  async register(@Body() sportEvent: SportEvent): Promise<object> {
    const result = await this.sportEventService.create(sportEvent);
    return result;
  }

  @Get('enrolled/:userId')
  async getEnrolledSportEvents(
    @Param('userId') userId: string
  ): Promise<object> {
    const result = await this.sportEventService.getAllUsersSportEvents(userId);
    return result;
  }

  @HasRoles(Role.Employee, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('hosted/:userId')
  async getHostedSportEvents(@Param('userId') userId: string): Promise<object> {
    const result = await this.sportEventService.getHostedSportEvents(userId);
    return result;
  }

  @Get('recommended/:userId')
  async getRecommendedSportEvents(
    @Param('userId') userId: string
  ): Promise<object> {
    const result = await this.sportEventService.getRecommendedSportEvents(
      userId
    );
    return result;
  }

  @Get(':id')
  async getSportEventById(@Request() req): Promise<SportEvent> {
    const result = await this.sportEventService.findSportEventById(
      req.params.id
    );
    return result;
  }
  // get all sport events endpoint
  @Get()
  async getAllSportEvents(): Promise<SportEvent[]> {
    const result = await this.sportEventService.getAllSportEvents();
    return result;
  }

  // delete sport event by id endpoint
  @HasRoles(Role.Employee, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async deleteSportEventById(@Request() req): Promise<object> {
    const result = await this.sportEventService.deleteSportEventById(
      req.params.id
    );
    return result;
  }

  // update sport event by id endpoint
  @HasRoles(Role.Employee, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put()
  async updateSportEventById(@Body() sportEvent: SportEvent): Promise<object> {
    const result = await this.sportEventService.updateSportEvent(sportEvent);
    return result;
  }

  @HasRoles(Role.User, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('enroll')
  async joinSportEvent(
    @Body() enrollRequest: { currentUserId: string; sportEventId: string }
  ): Promise<object> {
    const result = await this.sportEventService.enrollUserToSportEvent(
      enrollRequest.sportEventId,
      enrollRequest.currentUserId
    );
    return result;
  }

  @HasRoles(Role.User, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('unenroll')
  async leaveSportEvent(
    @Body() enrollRequest: { currentUserId: string; sportEventId: string }
  ): Promise<object> {
    const result = await this.sportEventService.unenrollUserFromSportEvent(
      enrollRequest.sportEventId,
      enrollRequest.currentUserId
    );
    return result;
  }
}
