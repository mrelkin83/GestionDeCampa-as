import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'diad', name: 'testigos_sesiones' })
export class Testigo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  campaign_id: string;

  @Column({ type: 'uuid' })
  testigo_user_id: string;

  @Column({ type: 'uuid', nullable: true })
  mesa_id: string;

  @Column({ type: 'varchar', length: 50 })
  estado_conexion: string; // activo, inactivo, offline

  @Column({ type: 'timestamp', nullable: true })
  last_seen_at: Date;

  @Column({ type: 'point', nullable: true })
  ubicacion_gps: string;

  @Column({ type: 'jsonb', nullable: true })
  device_info: any;

  @Column({ type: 'boolean', default: false })
  pwa_instalada: boolean;

  @Column({ type: 'int', default: 0 })
  actas_capturadas: number;

  @Column({ type: 'timestamp', nullable: true })
  primera_conexion_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultima_desconexion_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
