import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

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

    @Prop()
    routes: string[] // 정차 노선 정보

    @Prop()
    createdDt: Date

    @Prop()
    updatedDt?: Date
}

export const StationSchema = SchemaFactory.createForClass(Station)
export type StationDocument = Station & Document