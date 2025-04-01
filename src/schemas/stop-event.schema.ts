import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

@Schema()
export class StopEvent {
    @Prop({ required: true, unique: true })
    eventId: string

    @Prop()
    stationManageNo: string

    @Prop()
    routeId: string

    @Prop()
    arrivalDt: Date

    @Prop()
    departureDt: Date

    @Prop()
    createdDt: Date
}

export const StopEventSchema = SchemaFactory.createForClass(StopEvent)
export type StopEventDocument = StopEvent & Document