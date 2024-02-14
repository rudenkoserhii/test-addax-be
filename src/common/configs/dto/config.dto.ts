import { IsNumberString, IsString, IsNotEmpty } from 'class-validator';

export class ConfigDto {
  @IsNotEmpty()
  @IsNumberString()
  APP_PORT: number;

  @IsNotEmpty()
  @IsNumberString()
  DATABASE_PORT: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_HOST: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_USER: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_NAME: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASS: string;

  @IsString()
  QOBRIX_BASE_URL: string;

  @IsString()
  QOBRIX_API_KEY: string;

  @IsString()
  QOBRIX_API_USER: string;

  @IsString()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_API_SECRET: string;

  @IsString()
  QOBRIX_PROXY_URL: string;
}
