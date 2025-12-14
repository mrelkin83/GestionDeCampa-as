import { IsString, IsOptional } from 'class-validator';

export class UpdateEstadoDto {
  @IsString()
  estado: string;

  @IsString()
  @IsOptional()
  ubicacion_gps?: string;
}
