import { IsNotEmpty, IsPositive, IsNumber } from 'class-validator';

export class CreateBusTrackingRouteDto {
    @IsNumber({}, { message: 'routeId must be a number' })
    @IsPositive({ message: 'routeId must be positive' })
    @IsNotEmpty({ message: 'routeId is required' })
    routeId: number;
}