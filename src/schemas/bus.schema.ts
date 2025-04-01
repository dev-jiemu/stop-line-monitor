import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

@Schema()
export class Bus {
    @Prop({ required: true, unique: true })
    routeId: string

    @Prop()
    licensePlate: string
}

export const BusSchema = SchemaFactory.createForClass(Bus)
export type BusDocument = Bus & Document