import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

export enum PostStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  excerpt!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  categorySlug!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ enum: Object.values(PostStatus), default: PostStatus.Draft })
  status!: PostStatus;

  @Prop({ default: true })
  commentsEnabled!: boolean;

  @Prop()
  coverImageUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  authorId?: Types.ObjectId;

  @Prop()
  publishedAt?: Date;

  @Prop()
  bulkImportId?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
PostSchema.index({ categorySlug: 1, status: 1, publishedAt: -1 });
