import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { CreateUserDto } from 'modules/user/dto/create-user.dto';
import { UserService } from 'modules/user/user.service';
import { ApiPath } from 'src/common/enums';
import { UserResponseType } from 'src/common/types';

@Controller(ApiPath.SIGNUP)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Endpoint to register a new user',
    description:
      'New user registration by providing name, email, country and password in the request body.',
  })
  @ApiResponse({ status: 200, description: 'Successful registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateUserDto })
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseType> {
    return this.userService.create(createUserDto);
  }
}
