import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { PlansModule } from './modules/plans/plans.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ExercisesModule,
    PlansModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
