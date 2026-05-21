import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByPost(postId: string) {
    const normalizedPostId = new Types.ObjectId(postId);
    const comments = await this.commentModel
      .find({ postId: normalizedPostId, isActive: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const authorIds = comments.map((comment) => comment.authorId);
    const authors = await this.userModel
      .find({ _id: { $in: authorIds } })
      .select('username firstName lastName')
      .lean()
      .exec();
    const authorMap = new Map(authors.map((author) => [author._id.toString(), author]));

    return comments.map((comment) => this.serializeComment(comment, authorMap.get(comment.authorId.toString())));
  }

  async create(postId: string, createCommentDto: CreateCommentDto, authorId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post || !post.isActive) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.commentModel.create({
      postId: new Types.ObjectId(postId),
      authorId: new Types.ObjectId(authorId),
      content: createCommentDto.content,
    });

    const author = await this.userModel
      .findById(authorId)
      .select('username firstName lastName')
      .lean()
      .exec();

    return this.serializeComment(comment.toObject(), author);
  }

  async remove(id: string, currentUserId: string) {
    const comment = await this.commentModel.findById(id).exec();

    if (!comment || !comment.isActive) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId.toString() !== currentUserId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    comment.isActive = false;
    await comment.save();

    return {
      _id: comment._id.toString(),
      deleted: true,
    };
  }

  private serializeComment(comment: any, author?: any) {
    return {
      ...comment,
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
      authorId: comment.authorId.toString(),
      author: author
        ? {
            ...author,
            _id: author._id?.toString(),
          }
        : undefined,
    };
  }
}
