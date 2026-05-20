import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    try {
      const superAdminExists = await this.userModel.findOne({ roles: 'SUPER_ADMIN' }).exec();

      if (!superAdminExists) {
        this.logger.log('No Super Admin found. Creating default Super Admin...');

        const salt = await bcrypt.genSalt();
        const defaultPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

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
        this.logger.log('Super Admin already exists. Skipping creation.');
      }
    } catch (error) {
      this.logger.error('Error seeding Super Admin', error);
    }
  }
}
