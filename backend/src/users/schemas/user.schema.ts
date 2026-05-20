import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: [String], default: [] })
  passwordHistory!: string[];

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ type: [String], default: ['USER'] })
  roles!: string[];

  @Prop({ default: true })
  isActive!: boolean;

  // Auditoría y Borrado Suave
  @Prop({ default: null })
  deletedAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy!: Types.ObjectId;

  // timestamps: true maneja createdAt y updatedAt automáticamente
}

export const UserSchema = SchemaFactory.createForClass(User);

// Middleware de Mongoose para excluir documentos con borrado suave por defecto
UserSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

UserSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});
