import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as argon2 from 'argon2';
import { Repository } from 'typeorm';

import { CreateUserDto } from 'modules/user/dto/create-user.dto';
import { User } from 'src/common/entities/user.entity';
import { UserResponseType } from 'src/common/types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseType> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (existingUser) {
        throw new BadRequestException('This email already exists');
      }

      const user = await this.userRepository.save({
        name: createUserDto.name,
        email: createUserDto.email,
        country: createUserDto.country,
        password: await argon2.hash(createUserDto.password),
      });

      const token = this.jwtService.sign({ email: user.email, id: user.id });
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }
  async findOne(email: string): Promise<User> {
    try {
      return await this.userRepository.findOne({
        where: {
          email,
        },
      });
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }
}
