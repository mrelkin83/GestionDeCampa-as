import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'diad', name: 'conteo_tiempo_real' })
export class ConteoResultado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  campaign_id: string;

  @Column({ type: 'uuid', nullable: true })
  circunscripcion_id: string;

  @Column({ type: 'uuid', nullable: true })
  zona_id: string;

  @Column({ type: 'uuid', nullable: true })
  candidato_id: string;

  @Column({ type: 'int', default: 0 })
  total_votos: number;

  @Column({ type: 'int', default: 0 })
  total_mesas: number;

  @Column({ type: 'int', default: 0 })
  mesas_reportadas: number;

  @Column({ type: 'float', nullable: true })
  porcentaje: number;

  @Column({ type: 'jsonb', nullable: true })
  detalles: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
