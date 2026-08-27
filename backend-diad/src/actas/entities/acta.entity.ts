import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'diad', name: 'actas' })
export class Acta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  campaign_id: string;

  @Column({ type: 'uuid' })
  mesa_id: string;

  @Column({ type: 'uuid', nullable: true })
  testigo_id: string;

  @Column({ type: 'varchar', length: 50 })
  estado: string; // pendiente, validada, rechazada, procesando_ocr

  @Column({ type: 'text', nullable: true })
  imagen_url: string;

  @Column({ type: 'jsonb', nullable: true })
  datos_ocr: any;

  @Column({ type: 'jsonb', nullable: true })
  votos_candidatos: any;

  @Column({ type: 'int', nullable: true })
  total_votos: number;

  @Column({ type: 'int', nullable: true })
  votos_nulos: number;

  @Column({ type: 'int', nullable: true })
  votos_blancos: number;

  @Column({ type: 'int', nullable: true })
  total_potencial: number;

  @Column({ type: 'float', nullable: true })
  confianza_ocr: number;

  @Column({ type: 'text', nullable: true })
  rechazo_razon: string;

  @Column({ type: 'timestamp', nullable: true })
  validada_at: Date;

  @Column({ type: 'uuid', nullable: true })
  validada_por_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'point', nullable: true })
  ubicacion_gps: string;

  @Column({ type: 'timestamp', nullable: true })
  capturada_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
