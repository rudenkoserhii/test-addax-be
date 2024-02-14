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
  login(@Request() req: { user: UserType }): Promise<UserResponseType> {
    console.log(req);
    return this.authService.login(req.user);
  }

  @Post(ApiPath.LOGOUT)
  @ApiOperation({ summary: 'Log out the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(): Promise<void> {
    return this.authService.logout();
  }

  @Get(ApiPath.REFRESH)
  @ApiOperation({ summary: 'Refresh the current user token' })
  @ApiResponse({
    status: 200,
    description: 'User token refreshed successfully',
  })
  @UseGuards(JwtAuthGuard)
  async refresh(@Request() req: { user: UserType }): Promise<UserResponseType> {
    console.log(req);
    return this.authService.refresh(req.user);
  }
}
