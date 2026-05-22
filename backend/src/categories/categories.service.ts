import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;
    const query = { isActive: true };
    const [items, totalCount] = await Promise.all([
      this.categoryModel.find(query).sort({ name: 1 }).skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments(query).exec()
    ]);
    const totalPages = Math.ceil(totalCount / limit) || 1;
    return { items, totalPages };
  }

  findOne(slug: string) {
    return this.categoryModel.findOne({ slug, isActive: true }).exec();
  }
}
