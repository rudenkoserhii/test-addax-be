import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: '3f9694ae-3241-48ef-b16b-32dc7d23e1d9',
    description: 'Task id',
  })
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: '12345678',
    description: 'User message field',
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  content: string;
}
