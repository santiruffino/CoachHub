import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncPushDto } from './dto/sync.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
    private readonly logger = new Logger(SyncController.name);

    constructor(private readonly syncService: SyncService) { }

    @Get('bootstrap')
    @Roles(Role.STUDENT)
    async bootstrap(@CurrentUser() user: any) {
        this.logger.log(`Student ${user.userId} requesting bootstrap data`);
        return this.syncService.bootstrap(user.userId);
    }

    @Post('push')
    @Roles(Role.STUDENT)
    async push(@CurrentUser() user: any, @Body() syncPushDto: SyncPushDto) {
        this.logger.log(`Student ${user.userId} pushing offline mutations`);
        return this.syncService.push(user.userId, syncPushDto);
    }
}
