import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, unique: true, trim: true })
  key!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  module!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
