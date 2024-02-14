import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from 'common/configs/config.module';
import { ConfigService } from 'common/configs/config.service';
import { User, Task } from 'common/entities';
import { UserController } from 'modules/user/user.controller';
import { UserService } from 'modules/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Task]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
