import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsInt,
  IsString,
} from 'class-validator';

import { Label } from 'src/common/entities';

export class TaskDto {
  @ApiProperty({
    example: '3f9694ae-3241-48ef-b16b-32dc7d23e1d9',
    description: 'Task id',
  })
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: 'Task title',
    description: 'Task title field',
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({
    example: 'Task content',
    description: 'Task content field',
  })
  @IsOptional()
  @MinLength(1)
  @MaxLength(500)
  content?: string;

  @ApiProperty({
    example: '2012.12.12',
    description: 'Task date field',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  date?: string;

  @ApiProperty({
    example: [
      {
        id: '11111111-25bb-4bb3-8c11-149021f669b0',
        color: '#000000',
        text: 'label1',
        order: 0,
        createdAt: new Date(),
      },
      {
        id: '22222222-25bb-4bb3-8c11-149021f669b0',
        color: '#ffffff',
        text: 'label2',
        order: 1,
        createdAt: new Date(),
      },
    ],
    description: 'Array of labels',
    required: false,
  })
  @IsOptional()
  @IsArray()
  label?: Label[];

  @ApiProperty({
    example: 1,
    description: 'Task order number',
  })
  @IsNotEmpty()
  @IsInt()
  order: number;
}
