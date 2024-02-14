import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from 'src/common/entities/user.entity';
import { UserType } from 'src/common/types';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(user: User): Promise<UserType> {
    try {
      const userDetails = await this.userService.findOne(user.id);

      return {
        id: userDetails.id,
        email: userDetails.email,
        name: userDetails.name,
        country: userDetails.country,
      };
    } catch (error) {
      if (error) {
        throw error;
      }
      throw new UnauthorizedException(`JWT validation failed`);
    }
  }
}
