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
}
