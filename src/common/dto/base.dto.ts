import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BaseDto {
  @ApiPropertyOptional({ description: 'ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: '创建时间' })
  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @ApiPropertyOptional({ description: '更新时间' })
  @IsOptional()
  @IsDateString()
  updatedAt?: Date;
}

export class CreateBaseDto {
  @ApiPropertyOptional({ description: '创建者ID' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateBaseDto {
  @ApiPropertyOptional({ description: '更新者ID' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
