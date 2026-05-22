import { IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

class EnvironmentVariables {
  @Transform(({ value }) => Number(value ?? 3000))
  @IsNumber()
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  MONGO_URI!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.map((error) => Object.values(error.constraints ?? {}).join(', ')).join('; '));
  }

  return validatedConfig;
}
