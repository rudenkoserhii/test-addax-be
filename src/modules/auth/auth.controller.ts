import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { ApiPath } from 'common/enums';
import { UserResponseType, UserType } from 'common/types';
import { UserService } from 'modules/user/user.service';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller(ApiPath.USERS)
@ApiBearerAuth()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    readonly userService: UserService,
  ) {}

  @Post(ApiPath.LOGIN)
  @ApiOperation({ summary: 'Endpoint to sign in user with email and password' })
  @ApiBody({ type: AuthDto })
  @UseGuards(LocalAuthGuard)
  login(@Request() req: UserType): Promise<UserResponseType> {
    return this.authService.login(req);
  }
}
