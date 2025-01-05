import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

@Schema()
export class Station {
    @Prop({ required: true, unique: true })
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
    createdDt: Date

    @Prop()
    updateDt?: Date
}

export const StationSchema = SchemaFactory.createForClass(Station)
export type StationDocument = Station & Document