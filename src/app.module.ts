import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TripModule } from './trip/trip.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TripModule,
  ],
})
export class AppModule {}
