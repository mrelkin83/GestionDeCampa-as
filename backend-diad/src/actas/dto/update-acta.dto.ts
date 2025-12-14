import { PartialType } from '@nestjs/mapped-types';
import { CreateActaDto } from './create-acta.dto';

export class UpdateActaDto extends PartialType(CreateActaDto) {}
