import { Controller, Get, Query } from '@nestjs/common';
import { TripService } from './trip.service';

@Controller('api/trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  async getTrips(@Query() filters: any): Promise<{
    data: any[];
    pagination: { page: number; limit: number };
  }> {
    const trips = await this.tripService.findAll(filters);
    const dataWithIds = trips.data.map((trip, index) => ({
      id: index + 1,
      ...trip,
    }));
    return {
      data: dataWithIds,
      pagination: {
        page: filters.page || 1,
        limit: 10,
      },
    };
  }

  @Get('/monthly-trips')
  async getAverageDistanceAndFare() {
    const result = await this.tripService.getMonthlyTotal();
    return result;
  }
}
