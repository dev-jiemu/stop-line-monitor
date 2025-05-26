import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

@Schema()
export class StopEvent {
    @Prop({ required: true, unique: true })
    eventId: string // `${routeId}_${vehId}_${stationId}_${timestamp}` 형태

    @Prop({ required: true })
    routeId: number

    @Prop({ required: true })
    vehId: number

    @Prop({ required: true })
    stationId: string

    @Prop({ default: Date.now })
    createdDt: Date

    @Prop()
    remainSeatCnt?: number
}

export const StopEventSchema = SchemaFactory.createForClass(StopEvent)
export type StopEventDocument = StopEvent & Document