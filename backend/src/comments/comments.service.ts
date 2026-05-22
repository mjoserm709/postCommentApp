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

  async findByPost(postId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const normalizedPostId = new Types.ObjectId(postId);
    const query = { postId: normalizedPostId, isActive: true };

    const [comments, totalCount] = await Promise.all([
      this.commentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.commentModel.countDocuments(query).exec()
    ]);

    const authorIds = comments.map((comment) => comment.authorId);
    const authors = await this.userModel
      .find({ _id: { $in: authorIds } })
      .select('username firstName lastName')
      .lean()
      .exec();
    const authorMap = new Map(authors.map((author) => [author._id.toString(), author]));

    const items = comments.map((comment) => this.serializeComment(comment, authorMap.get(comment.authorId.toString())));
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    return { items, totalPages };
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
