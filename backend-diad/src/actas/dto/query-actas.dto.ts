import { IsOptional, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryActasDto {
  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @IsUUID()
  @IsOptional()
  mesaId?: string;

  @IsUUID()
  @IsOptional()
  testigoId?: string;

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
