import { SetMetadata } from '@nestjs/common';
import { Role } from '@sport-activity-app/domain';

export const HasRoles = (...roles: Role[]) => SetMetadata('roles', roles);
