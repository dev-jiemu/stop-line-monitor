import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

@Schema()
export class Bus {
    @Prop({ required: true, unique: true })
    routeId: number

    @Prop({ required: true })
    routeName: string

    @Prop({ required: true })
    routeDestId: number

    @Prop({ default: Date.now })
    createdDt: Date

    @Prop({ default: Date.now })
    updatedDt: Date

    @Prop({ default: false })
    isTracking: boolean
}

export const BusSchema = SchemaFactory.createForClass(Bus)
export type BusDocument = Bus & Document