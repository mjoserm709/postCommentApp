import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
    await this.seedCategories();
  }

  private async seedSuperAdmin() {
    try {
      const defaultPassword = 'admin123';
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      // Use raw model to bypass soft-delete middleware
      const superAdmin = await this.userModel.findOne({ username: 'admin' }).exec();

      if (!superAdmin) {
        this.logger.log('No Super Admin found. Creating default Super Admin...');

        await this.userModel.create({
          username: 'admin',
          email: 'admin@library.com',
          firstName: 'Super',
          lastName: 'Admin',
          password: hashedPassword,
          passwordHistory: [hashedPassword],
          roles: ['SUPER_ADMIN'],
        });

        this.logger.log('Default Super Admin created successfully. (username: admin, password: admin123)');
      } else {
        // Verify that the current password matches; if not, reset it
        const passwordValid = await bcrypt.compare(defaultPassword, superAdmin.password);
        if (!passwordValid) {
          this.logger.warn('Super Admin password hash mismatch detected. Resetting to default...');
          superAdmin.password = hashedPassword;
          superAdmin.passwordHistory = [hashedPassword];
          await superAdmin.save();
          this.logger.log('Super Admin password reset successfully. (username: admin, password: admin123)');
        } else {
          this.logger.log('Super Admin already exists with valid credentials. Skipping.');
        }
      }
    } catch (error) {
      this.logger.error('Error seeding Super Admin', error);
    }
  }

  private async seedCategories() {
    const categories = [
      {
        name: 'Terror',
        slug: 'terror',
        description: 'Historias oscuras, suspenso, criaturas y miedo psicológico.',
        color: '#7f1d1d',
        icon: 'moon',
      },
      {
        name: 'Comedia',
        slug: 'comedia',
        description: 'Posts ligeros, situaciones absurdas, humor y anécdotas divertidas.',
        color: '#f59e0b',
        icon: 'smile',
      },
      {
        name: 'Romance',
        slug: 'romance',
        description: 'Relaciones, sentimientos, encuentros y dramas del corazón.',
        color: '#db2777',
        icon: 'heart',
      },
      {
        name: 'Ciencia ficción',
        slug: 'ciencia-ficcion',
        description: 'Futuros posibles, tecnología, espacio, inteligencia artificial y mundos alternos.',
        color: '#2563eb',
        icon: 'rocket',
      },
      {
        name: 'Fantasía',
        slug: 'fantasia',
        description: 'Magia, aventuras, reinos imaginarios y leyendas.',
        color: '#7c3aed',
        icon: 'sparkles',
      },
      {
        name: 'Drama',
        slug: 'drama',
        description: 'Conflictos humanos, decisiones difíciles y relatos emocionales.',
        color: '#4b5563',
        icon: 'theater',
      },
      {
        name: 'Misterio',
        slug: 'misterio',
        description: 'Casos, pistas, secretos, investigaciones y giros inesperados.',
        color: '#0f766e',
        icon: 'search',
      },
      {
        name: 'Aventura',
        slug: 'aventura',
        description: 'Viajes, retos, exploración y momentos llenos de acción.',
        color: '#16a34a',
        icon: 'compass',
      },
    ];

    try {
      for (const category of categories) {
        await this.categoryModel.updateOne(
          { slug: category.slug },
          { $setOnInsert: category },
          { upsert: true },
        );
      }

      this.logger.log('Default post categories seeded successfully.');
    } catch (error) {
      this.logger.error('Error seeding categories', error);
    }
  }
}
