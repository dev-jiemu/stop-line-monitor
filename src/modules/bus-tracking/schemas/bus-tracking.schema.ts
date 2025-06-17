import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

@Schema()
export class BusTracking {
    @Prop({ unique: true })
    trackingKey: string // `${routeName}-${targetStationId}`

    @Prop({ required: true })
    routeId: number

    @Prop({ required: true })
    routeName: string

    @Prop({ required: true })
    routeDestId: number

    @Prop({ required: true })
    targetStationId: string

    @Prop()
    targetStationName: string

    @Prop({ default: Date.now })
    createdDt: Date

    @Prop({ default: Date.now })
    updatedDt: Date

    @Prop({ default: true })
    isActive: boolean

    // 멀티유저면 등록할 필요 있을듯
    @Prop()
    userId? :string

    @Prop()
    notificationTime?: string[] // "10", "12", "13" 형태

    // 메모
    @Prop()
    description?: string
}

export const BusTrackingSchema = SchemaFactory.createForClass(BusTracking)
export type BusDocument = BusTracking & Document