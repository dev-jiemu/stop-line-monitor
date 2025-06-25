import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

@Schema({ _id: false }) // 중첩 스키마에는 보통 _id: false 옵션을 사용한다고? ㅇㅂㅇ
export class Route {
    @Prop()
    routeId: number

    @Prop()
    routeDestId: number

    @Prop()
    routeName: string  // 실제로는 문자열 (예: '88B')
}

export const RouteSchema = SchemaFactory.createForClass(Route)

@Schema()
export class Station {

    @Prop({ type: String, unique: true })
    stationId: string

    @Prop()
    stationManageNo: string // 정류소코드

    @Prop()
    cityCode: string

    @Prop()
    cityName: string

    @Prop()
    stationName: string

    @Prop()
    stationLoc: string // 주소

    @Prop()
    latitude: string // 위도

    @Prop()
    longitude: string // 경도

    //정차 노선 정보
    //@Prop()
    //routes: string[]
    @Prop({ type: [RouteSchema] })
    routes: Route[]

    @Prop({ default: Date.now })
    createdDt: Date

    @Prop({ default: Date.now })
    updatedDt?: Date
}

export const StationSchema = SchemaFactory.createForClass(Station)
export type StationDocument = Station & Document