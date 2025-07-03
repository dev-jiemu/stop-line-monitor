// TODO : 1일전, 2일전, 7일전? 아니면 예측 포함?
export interface BusArrivalNotification {
    stationName: string;
    routeNumber: string;
    arrivalTimes: string[];
    historicalData?: {
        yesterday: string[];
        weekAgo: string[];
    };
}