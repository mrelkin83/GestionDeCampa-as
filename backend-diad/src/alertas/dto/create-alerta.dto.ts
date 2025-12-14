import { IsUUID, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAlertaDto {
  @IsUUID()
  campaign_id: string;

  @IsString()
  tipo: string;

  @IsString()
  severidad: string;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsUUID()
  @IsOptional()
  mesa_id?: string;

  @IsUUID()
  @IsOptional()
  testigo_id?: string;

  @IsUUID()
  @IsOptional()
  acta_id?: string;

  @IsObject()
  @IsOptional()
  detalles?: any;
}
