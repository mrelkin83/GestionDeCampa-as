import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'diad', name: 'alertas' })
export class Alerta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  campaign_id: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; // inconsistencia, fraude_sospecha, testigo_inactivo, etc

  @Column({ type: 'varchar', length: 50 })
  severidad: string; // baja, media, alta, critica

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 50 })
  estado: string; // pendiente, resuelta, descartada

  @Column({ type: 'uuid', nullable: true })
  mesa_id: string;

  @Column({ type: 'uuid', nullable: true })
  testigo_id: string;

  @Column({ type: 'uuid', nullable: true })
  acta_id: string;

  @Column({ type: 'jsonb', nullable: true })
  detalles: any;

  @Column({ type: 'text', nullable: true })
  resolucion: string;

  @Column({ type: 'timestamp', nullable: true })
  resuelta_at: Date;

  @Column({ type: 'uuid', nullable: true })
  resuelta_por_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
