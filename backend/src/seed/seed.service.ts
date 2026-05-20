import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { Permission, PermissionDocument } from '../permissions/schemas/permission.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);
  private readonly permissions = [
    {
      key: 'users.read',
      name: 'Ver usuarios',
      module: 'users',
      description: 'Permite ver la lista y detalle de usuarios.',
    },
    {
      key: 'users.create',
      name: 'Crear usuarios',
      module: 'users',
      description: 'Permite crear usuarios desde el panel admin.',
    },
    {
      key: 'users.update',
      name: 'Editar usuarios',
      module: 'users',
      description: 'Permite editar datos y roles de usuarios.',
    },
    {
      key: 'users.deactivate',
      name: 'Desactivar usuarios',
      module: 'users',
      description: 'Permite desactivar usuarios.',
    },
    {
      key: 'roles.read',
      name: 'Ver roles',
      module: 'roles',
      description: 'Permite ver roles configurados.',
    },
    {
      key: 'roles.create',
      name: 'Crear roles',
      module: 'roles',
      description: 'Permite crear nuevos roles.',
    },
    {
      key: 'roles.update',
      name: 'Editar roles',
      module: 'roles',
      description: 'Permite modificar roles existentes.',
    },
    {
      key: 'roles.assignPermissions',
      name: 'Asignar permisos',
      module: 'roles',
      description: 'Permite asignar permisos a roles.',
    },
    {
      key: 'permissions.read',
      name: 'Ver permisos',
      module: 'permissions',
      description: 'Permite consultar permisos disponibles.',
    },
    {
      key: 'permissions.create',
      name: 'Crear permisos',
      module: 'permissions',
      description: 'Permite crear nuevos permisos.',
    },
    {
      key: 'permissions.update',
      name: 'Editar permisos',
      module: 'permissions',
      description: 'Permite modificar permisos existentes.',
    },
    {
      key: 'categories.manage',
      name: 'Administrar categorías',
      module: 'categories',
      description: 'Permite administrar categorías de posts.',
    },
    {
      key: 'posts.read',
      name: 'Ver posts',
      module: 'posts',
      description: 'Permite leer posts.',
    },
    {
      key: 'posts.create',
      name: 'Crear posts',
      module: 'posts',
      description: 'Permite crear posts.',
    },
    {
      key: 'posts.update',
      name: 'Editar posts',
      module: 'posts',
      description: 'Permite editar posts.',
    },
    {
      key: 'posts.delete',
      name: 'Eliminar posts',
      module: 'posts',
      description: 'Permite eliminar posts.',
    },
    {
      key: 'comments.moderate',
      name: 'Moderar comentarios',
      module: 'comments',
      description: 'Permite moderar comentarios.',
    },
  ];

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedCategories();
    await this.seedSuperAdmin();
  }

  private async seedPermissions() {
    try {
      for (const permission of this.permissions) {
        await this.permissionModel.updateOne(
          { key: permission.key },
          { $set: permission },
          { upsert: true },
        );
      }

      this.logger.log('Default permissions seeded successfully.');
    } catch (error) {
      this.logger.error('Error seeding permissions', error);
    }
  }

  private async seedRoles() {
    const allPermissions = this.permissions.map((permission) => permission.key);
    const roles = [
      {
        key: 'SUPER_ADMIN',
        name: 'Super Admin',
        description: 'Acceso total a la plataforma.',
        permissions: allPermissions,
        isSystem: true,
      },
      {
        key: 'ADMIN',
        name: 'Admin',
        description: 'Administra contenido y puede consultar usuarios.',
        permissions: [
          'users.read',
          'categories.manage',
          'posts.read',
          'posts.create',
          'posts.update',
          'posts.delete',
          'comments.moderate',
        ],
        isSystem: true,
      },
      {
        key: 'USER',
        name: 'Usuario',
        description: 'Usuario estándar de la plataforma.',
        permissions: ['posts.read', 'posts.create'],
        isSystem: true,
      },
    ];

    try {
      for (const role of roles) {
        await this.roleModel.updateOne(
          { key: role.key },
          { $set: role },
          { upsert: true },
        );
      }

      this.logger.log('Default roles seeded successfully.');
    } catch (error) {
      this.logger.error('Error seeding roles', error);
    }
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
