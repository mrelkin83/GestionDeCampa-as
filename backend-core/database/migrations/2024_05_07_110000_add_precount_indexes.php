<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Optimización de índices para Preconteo
 * 
 * Agrega índices optimizados para las consultas más frecuentes
 * del sistema de preconteo.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ==========================================
        // precount_records - Índices principales
        // ==========================================
        Schema::table('precount_records', function (Blueprint $table) {
            $table->index(['election_position_id', 'polling_table_id', 'estado'], 
                'idx_records_election_mesa_estado');
            
            $table->index(['estado', 'created_at'], 
                'idx_records_estado_created');
            
            $table->index(['election_position_id', 'estado'], 
                'idx_records_cargo_estado');
        });

        // ==========================================
        // precount_votes - Índices para agregaciones
        // ==========================================
        Schema::table('precount_votes', function (Blueprint $table) {
            // Índice compuesto para cálculo de totales
            $table->index(['precount_record_id', 'candidate_id'], 
                'idx_votes_record_candidate');
        });

        // ==========================================
        // precount_aggregates - Índices únicos
        // ==========================================
        Schema::table('precount_aggregates', function (Blueprint $table) {
            $table->index(['scope_type', 'scope_id', 'election_position_id'], 
                'idx_aggregates_scope_position');
            
            $table->index(['scope_type', 'scope_id', 'election_position_id', 'votos'], 
                'idx_aggregates_votos');
        });

        // ==========================================
        // precount_validations - Índices para alertas
        // ==========================================
        Schema::table('precount_validations', function (Blueprint $table) {
            // Índice para consultar alertas por acta
            $table->index(['precount_record_id', 'severidad'], 
                'idx_validations_record_severidad');
            
            // Índice para dashboard de alertas
            $table->index(['tipo', 'severidad', 'created_at'], 
                'idx_validations_tipo_severidad');
        });

        // ==========================================
        // precount_evidence - Índices para evidencias
        // ==========================================
        Schema::table('precount_evidence', function (Blueprint $table) {
            $table->index('hash_imagen', 
                'idx_evidence_hash');
        });

        // ==========================================
        // mesa_cargo_status - Índices de estado
        // ==========================================
        Schema::table('mesa_cargo_status', function (Blueprint $table) {
            $table->index(['mesa_id', 'cargo_id', 'estado'], 
                'idx_status_mesa_cargo_estado');
            
            $table->index(['estado', 'updated_at'], 
                'idx_status_estado_updated');
        });

        // ==========================================
        // preconteo_snapshots - Índices históricos
        // ==========================================
        Schema::table('preconteo_snapshots', function (Blueprint $table) {
            $table->index(['scope_type', 'scope_id', 'election_position_id', 'snapshot_at'], 
                'idx_snapshots_scope_fecha');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('precount_records', function (Blueprint $table) {
            $table->dropIndex('idx_records_election_mesa_estado');
            $table->dropIndex('idx_records_estado_created');
            $table->dropIndex('idx_records_cargo_estado');
        });

        Schema::table('precount_votes', function (Blueprint $table) {
            $table->dropIndex('idx_votes_record_candidate');
        });

        Schema::table('precount_aggregates', function (Blueprint $table) {
            $table->dropIndex('idx_aggregates_scope_position');
            $table->dropIndex('idx_aggregates_votos');
        });

        Schema::table('precount_validations', function (Blueprint $table) {
            $table->dropIndex('idx_validations_record_severidad');
            $table->dropIndex('idx_validations_tipo_severidad');
        });

        Schema::table('precount_evidence', function (Blueprint $table) {
            $table->dropIndex('idx_evidence_hash');
        });

        Schema::table('mesa_cargo_status', function (Blueprint $table) {
            $table->dropIndex('idx_status_mesa_cargo_estado');
            $table->dropIndex('idx_status_estado_updated');
        });

        Schema::table('preconteo_snapshots', function (Blueprint $table) {
            $table->dropIndex('idx_snapshots_scope_fecha');
        });
    }
};
