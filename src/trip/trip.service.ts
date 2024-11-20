import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class TripService {
  constructor(private readonly httpService: HttpService) {}

  async findAll(filters: {
    fareAmount?: number;
    paymentType?: string;
    page?: number;
    pickupDatetime?: string;
    dropoffDatetime?: string;
    minDistance?: number;
    maxDistance?: number;
  }): Promise<{
    data: any[];
    pagination: { page: number; limit: number };
  }> {
    const url = process.env.URL_DATA_TRIP;
    const params: any = {
      $limit: 10,
      $offset: (filters.page ? filters.page - 1 : 0) * 10,
    };
    const whereClauses = [];
    if (filters.fareAmount !== undefined && filters.fareAmount !== null) {
      whereClauses.push(`fare_amount = ${filters.fareAmount}`);
    }
    if (filters.paymentType) {
      whereClauses.push(`payment_type = '${filters.paymentType}'`);
    }
    if (filters.pickupDatetime) {
      whereClauses.push(`pickup_datetime >= '${filters.pickupDatetime}'`);
    }
    if (filters.dropoffDatetime) {
      whereClauses.push(`dropoff_datetime <= '${filters.dropoffDatetime}'`);
    }
    if (filters.minDistance) {
      whereClauses.push(`trip_distance >= ${filters.minDistance}`);
    }
    if (filters.maxDistance) {
      whereClauses.push(`trip_distance <= ${filters.maxDistance}`);
    }
    if (whereClauses.length > 0) {
      params.$where = whereClauses.join(' AND ');
    }

    const response = await firstValueFrom(
      this.httpService.get(url, { params }),
    );

    // Generate unique IDs
    const dataWithIdsAndColors = response.data.map((trip: any) => ({
      ...trip,
      id: randomUUID().toString(),
    }));

    return {
      data: dataWithIdsAndColors,
      pagination: {
        page: filters.page || 1,
        limit: 10,
      },
    };
  }

  async getMonthlyTotal(): Promise<{
    monthlyTotals: {
      month: string;
      totalTrips: number;
      totalPaymentTypeCSH: number;
      totalPaymentTypeCRD: number;
    }[];
  }> {
    const url = process.env.URL_DATA_TRIP;
    const params: any = {
      $select:
        "date_trunc_ym(pickup_datetime) as month, count(*) as totalTrips, sum(case when payment_type = 'CSH' then 1 else 0 end) as totalPaymentTypeCSH, sum(case when payment_type = 'CRD' then 1 else 0 end) as totalPaymentTypeCRD",
      $group: 'month',
    };

    const response = await firstValueFrom(
      this.httpService.get(url, { params }),
    );

    const monthlyTotals = response.data.map((entry: any) => ({
      month: new Date(entry.month).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
      totalTrips: entry.totalTrips,
      totalPaymentTypeCSH: entry.totalPaymentTypeCSH,
      totalPaymentTypeCRD: entry.totalPaymentTypeCRD,
    }));

    return {
      monthlyTotals,
    };
  }
  monthlyTotals: {
    month: string;
    totalTrips: number;
    totalFareAmount: number;
  }[];
}
