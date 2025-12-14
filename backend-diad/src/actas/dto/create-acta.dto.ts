import { IsUUID, IsOptional, IsNumber, IsObject, IsString, Min } from 'class-validator';

export class CreateActaDto {
  @IsUUID()
  campaign_id: string;

  @IsUUID()
  mesa_id: string;

  @IsUUID()
  @IsOptional()
  testigo_id?: string;

  @IsObject()
  @IsOptional()
  votos_candidatos?: Record<string, number>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  total_votos?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  votos_nulos?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  votos_blancos?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  total_potencial?: number;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsString()
  @IsOptional()
  ubicacion_gps?: string;
}
