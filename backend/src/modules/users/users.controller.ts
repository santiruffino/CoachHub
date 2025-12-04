import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateCoachDto, UpdateCoachDto, CreateStudentDto } from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@CurrentUser() user: any) {
        this.logger.log(`Getting profile for user: ${user.userId}`);
        return this.usersService.findOne(user.userId);
    }

    // Coach Routes
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.COACH)
    @Post('users/student')
    createStudent(@Body() createStudentDto: CreateStudentDto, @CurrentUser() user: any) {
        this.logger.log(`Coach ${user.userId} creating student: ${createStudentDto.email}`);
        return this.usersService.createStudent(createStudentDto, user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.COACH)
    @Get('users/students')
    getStudents(@CurrentUser() user: any) {
        this.logger.log(`Coach ${user.userId} fetching students`);
        return this.usersService.findAllStudentsForCoach(user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.COACH)
    @Get('coach/stats')
    getDashboardStats(@CurrentUser() user: any) {
        this.logger.log(`Coach ${user.userId} fetching dashboard stats`);
        return this.usersService.getCoachDashboardStats(user.userId);
    }

    // Admin Routes
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post('admin/coaches')
    createCoach(@Body() createCoachDto: CreateCoachDto) {
        this.logger.log(`Admin creating coach: ${createCoachDto.email}`);
        return this.usersService.createCoach(createCoachDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('admin/coaches')
    findAllCoaches() {
        this.logger.log('Admin fetching all coaches');
        return this.usersService.findAllCoaches();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('admin/coaches/:id/stats')
    getCoachStats(@Param('id') id: string) {
        this.logger.log(`Admin fetching stats for coach: ${id}`);
        return this.usersService.getCoachStats(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('admin/coaches/:id')
    updateCoach(@Param('id') id: string, @Body() updateCoachDto: UpdateCoachDto) {
        this.logger.log(`Admin updating coach: ${id}`);
        return this.usersService.updateCoach(id, updateCoachDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete('admin/coaches/:id')
    deleteCoach(@Param('id') id: string) {
        this.logger.log(`Admin deleting coach: ${id}`);
        return this.usersService.deleteCoach(id);
    }
}
