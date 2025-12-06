import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    @Post()
    @Roles(Role.COACH)
    create(@CurrentUser() user: any, @Body() createPlanDto: CreatePlanDto) {
        return this.plansService.create(user.userId, createPlanDto);
    }

    @Get()
    @Roles(Role.COACH)
    findAll(@CurrentUser() user: any) {
        return this.plansService.findAll(user.userId);
    }

    @Get(':id')
    @Roles(Role.COACH, Role.STUDENT)
    findOne(@Param('id') id: string) {
        return this.plansService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.COACH)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() updatePlanDto: UpdatePlanDto,
    ) {
        return this.plansService.update(user.userId, id, updatePlanDto);
    }

    @Post(':id/assign')
    @Roles(Role.COACH)
    assign(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() assignPlanDto: AssignPlanDto,
    ) {
        return this.plansService.assign(user.userId, id, assignPlanDto);
    }
}
