<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Sistema de Preconteo Electoral - Tablas Core
     */
    public function up(): void
    {
        // 1. Tabla: precount_records (Actas de preconteo) - CORAZÓN DEL SISTEMA
        Schema::create('precount_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('polling_table_id')->comment('ID de la mesa');
            $table->unsignedBigInteger('election_position_id')->comment('ID del cargo electoral');
            $table->integer('version')->default(1)->comment('Versión del acta (v1, v2, etc)');
            $table->integer('total_sufragantes')->comment('Total de sufragantes en la mesa');
            $table->integer('votos_nulos')->default(0)->comment('Votos nulos');
            $table->integer('votos_no_marcados')->default(0)->comment('Votos en blanco/no marcados');
            $table->text('observaciones')->nullable()->comment('Observaciones sobre el acta');
            $table->enum('estado', ['CARGADA', 'OBSERVADA', 'VALIDADA'])->default('CARGADA')->comment('Estado del acta');
            $table->timestamps();
            
            // Índices críticos
            $table->index('polling_table_id', 'idx_precount_records_table');
            $table->index('election_position_id', 'idx_precount_records_cargo');
            $table->index('estado', 'idx_precount_records_estado');
            
            // Constraint único: una mesa+cargo puede tener múltiples versiones
            $table->unique(['polling_table_id', 'election_position_id', 'version'], 'unique_acta_version');
        });

        // 2. Tabla: precount_votes (Votos por candidato)
        Schema::create('precount_votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('precount_record_id')->comment('ID del acta padre');
            $table->unsignedBigInteger('candidate_id')->comment('ID del candidato');
            $table->integer('votos')->default(0)->comment('Cantidad de votos');
            $table->timestamps();
            
            // Índices
            $table->index('precount_record_id', 'idx_precount_votes_record');
            $table->index('candidate_id', 'idx_precount_votes_candidate');
            
            // Foreign keys
            $table->foreign('precount_record_id')
                  ->references('id')
                  ->on('precount_records')
                  ->onDelete('cascade');
        });

        // 3. Tabla: precount_evidence (Evidencia fotográfica del acta)
        Schema::create('precount_evidence', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('precount_record_id')->comment('ID del acta');
            $table->string('imagen_url', 500)->comment('URL de la imagen en S3');
            $table->string('hash_imagen', 64)->comment('Hash SHA-256 de la imagen para integridad');
            $table->text('ocr_text')->nullable()->comment('Texto extraído por OCR (si aplica)');
            $table->boolean('legible')->default(false)->comment('Si la imagen es legible');
            $table->timestamps();
            
            // Foreign key
            $table->foreign('precount_record_id')
                  ->references('id')
                  ->on('precount_records')
                  ->onDelete('cascade');
        });

        // 4. Tabla: precount_metadata (Cadena de custodia - Trazabilidad)
        Schema::create('precount_metadata', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('precount_record_id')->comment('ID del acta');
            $table->unsignedBigInteger('reportado_por_usuario_id')->comment('Usuario que reportó');
            $table->string('rol', 50)->comment('Rol del reportante (testigo, coordinador, etc)');
            $table->decimal('gps_lat', 10, 8)->nullable()->comment('Latitud GPS');
            $table->decimal('gps_lng', 11, 8)->nullable()->comment('Longitud GPS');
            $table->string('dispositivo', 200)->nullable()->comment('User-Agent del dispositivo');
            $table->boolean('offline')->default(false)->comment('Si se capturó en modo offline');
            $table->timestamp('sincronizado_at')->nullable()->comment('Fecha de sincronización (si fue offline)');
            $table->timestamps();
            
            // Índices
            $table->index('reportado_por_usuario_id', 'idx_metadata_usuario');
            
            // Foreign key
            $table->foreign('precount_record_id')
                  ->references('id')
                  ->on('precount_records')
                  ->onDelete('cascade');
        });

        // 5. Tabla: precount_validations (Validaciones automáticas)
        Schema::create('precount_validations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('precount_record_id')->comment('ID del acta validada');
            $table->enum('tipo', ['SUMA_INVALIDA', 'VOTOS_SUPERAN_SUFRAGANTES', 'ACTA_ILEGIBLE', 'MESA_DUPLICADA', 'VERSION_DUPLICADA'])
                  ->comment('Tipo de validación');
            $table->enum('severidad', ['INFO', 'WARNING', 'CRITICAL'])
                  ->default('WARNING')
                  ->comment('Nivel de severidad');
            $table->text('mensaje')->comment('Descripción del problema');
            $table->boolean('resuelta')->default(false)->comment('Si la validación fue resuelta');
            $table->timestamp('resuelta_at')->nullable()->comment('Fecha de resolución');
            $table->unsignedBigInteger('resuelta_por')->nullable()->comment('Usuario que resolvió');
            $table->timestamps();
            
            // Índices
            $table->index('precount_record_id', 'idx_validations_record');
            $table->index(['tipo', 'resuelta'], 'idx_validations_tipo_resuelta');
            
            // Foreign key
            $table->foreign('precount_record_id')
                  ->references('id')
                  ->on('precount_records')
                  ->onDelete('cascade');
        });

        // 6. Tabla: precount_aggregates (Resultados agregados - tipo Registraduría)
        Schema::create('precount_aggregates', function (Blueprint $table) {
            $table->id();
            $table->enum('scope_type', ['MESA', 'PUESTO', 'MUNICIPIO', 'DEPARTAMENTO'])
                  ->comment('Nivel de agregación');
            $table->unsignedBigInteger('scope_id')->comment('ID del scope (mesa_id, puesto_id, etc)');
            $table->unsignedBigInteger('election_position_id')->comment('ID del cargo electoral');
            $table->unsignedBigInteger('candidate_id')->comment('ID del candidato');
            $table->integer('votos')->default(0)->comment('Total votos agregados');
            $table->decimal('porcentaje', 5, 2)->default(0)->comment('Porcentaje del total');
            $table->timestamp('updated_at')->nullable()->comment('Última actualización');
            
            // Índices críticos para performance
            $table->index(['scope_type', 'scope_id'], 'idx_aggregates_scope');
            $table->index(['election_position_id', 'candidate_id'], 'idx_aggregates_cargo_candidato');
            $table->index('updated_at', 'idx_aggregates_updated');
            
            // Constraint único
            $table->unique(['scope_type', 'scope_id', 'election_position_id', 'candidate_id'], 
                         'unique_aggregate');
        });

        // 7. Tabla: mesa_cargo_status (Estado de reporte por mesa y cargo)
        Schema::create('mesa_cargo_status', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mesa_id')->comment('ID de la mesa');
            $table->unsignedBigInteger('cargo_id')->comment('ID del cargo electoral');
            $table->enum('estado', ['PENDIENTE', 'REPORTADA', 'OBSERVADA', 'VALIDADA'])
                  ->default('PENDIENTE')
                  ->comment('Estado del reporte para esta mesa y cargo');
            $table->unsignedBigInteger('precount_record_id')->nullable()->comment('ID del acta actual');
            $table->timestamp('reportada_at')->nullable()->comment('Fecha de reporte');
            $table->timestamp('validada_at')->nullable()->comment('Fecha de validación');
            $table->timestamps();
            
            // Índices
            $table->index(['mesa_id', 'cargo_id'], 'idx_mesa_cargo_status');
            $table->index('estado', 'idx_mesa_cargo_estado');
            
            // Constraint único: solo un estado por mesa+cargo
            $table->unique(['mesa_id', 'cargo_id'], 'unique_mesa_cargo');
        });

        // 8. Tabla: preconteo_snapshots (Snapshots históricos de resultados)
        Schema::create('preconteo_snapshots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('election_position_id')->comment('Cargo electoral');
            $table->enum('scope_type', ['PUESTO', 'MUNICIPIO', 'DEPARTAMENTO', 'NACIONAL'])
                  ->comment('Nivel del snapshot');
            $table->unsignedBigInteger('scope_id')->comment('ID del scope');
            $table->json('resultados')->comment('JSON con resultados por candidato');
            $table->integer('total_mesas')->comment('Total mesas en scope');
            $table->integer('mesas_reportadas')->comment('Mesas reportadas al momento');
            $table->decimal('porcentaje_avance', 5, 2)->comment('% de avance');
            $table->timestamp('snapshot_at')->comment('Fecha/hora del snapshot');
            $table->timestamps();
            
            // Índices
            $table->index(['election_position_id', 'snapshot_at'], 'idx_snapshots_cargo_fecha');
            $table->index(['scope_type', 'scope_id'], 'idx_snapshots_scope');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preconteo_snapshots');
        Schema::dropIfExists('mesa_cargo_status');
        Schema::dropIfExists('precount_aggregates');
        Schema::dropIfExists('precount_validations');
        Schema::dropIfExists('precount_metadata');
        Schema::dropIfExists('precount_evidence');
        Schema::dropIfExists('precount_votes');
        Schema::dropIfExists('precount_records');
    }
};
