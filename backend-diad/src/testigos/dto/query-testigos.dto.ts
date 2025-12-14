import { IsOptional, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryTestigosDto {
  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
