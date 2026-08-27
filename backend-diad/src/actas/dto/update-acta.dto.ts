import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateActaDto } from './create-acta.dto';

/**
 * campaign_id/mesa_id/testigo_id identifican de forma unívoca a qué mesa y
 * campaña pertenece el acta; no deben poder reasignarse después de creada
 * (Object.assign(acta, dto) en ActasService.update aceptaba estos campos
 * sin restricción, permitiendo "mover" un acta a otra mesa/campaña).
 */
export class UpdateActaDto extends PartialType(
  OmitType(CreateActaDto, ['campaign_id', 'mesa_id', 'testigo_id'] as const),
) {}
