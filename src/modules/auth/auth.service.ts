import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as argon2 from 'argon2';
import axios from 'axios';

import { UserService } from 'modules/user/user.service';
import { User } from 'src/common/entities';
import { UserResponseType, UserType } from 'src/common/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.userService.findOne(email);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const passwordIsMatch = await argon2.verify(user.password, password);

      if (user && passwordIsMatch) {
        return user;
      }

      throw new BadRequestException('Email or password are incorrect');
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }

  async login(user: UserType): Promise<UserResponseType> {
    try {
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          country: user.country,
        },

        token: this.jwtService.sign({ id: user.id, email: user.email }),
      };
    } catch (error) {
      throw new BadRequestException('Login failed');
    }
  }

  async logout(): Promise<void> {
    axios.defaults.headers.common.Authorization = '';
  }

  async refresh(req: UserType): Promise<UserResponseType> {
    try {
      const refreshedUser: UserType = {
        id: req.id,
        email: req.email,
        name: req.name,
        country: req.country,
      };

      const refreshedToken = this.jwtService.sign({
        id: req.id,
        email: req.email,
      });

      return {
        user: refreshedUser,
        token: refreshedToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Token refresh failed');
    }
  }
}
