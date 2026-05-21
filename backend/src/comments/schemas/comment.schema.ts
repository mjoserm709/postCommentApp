import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  postId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  content!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ postId: 1, createdAt: -1 });
