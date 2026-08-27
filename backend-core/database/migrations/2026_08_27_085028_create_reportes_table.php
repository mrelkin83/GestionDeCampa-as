<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->cascadeOnDelete();
            $table->foreignId('generado_por_id')->constrained('users');
            $table->string('nombre', 200);
            $table->string('descripcion', 500)->nullable();
            $table->enum('tipo', ['votantes', 'financiero', 'comunicacion', 'eventos', 'general']);
            $table->enum('formato', ['pdf', 'excel', 'csv']);
            $table->json('filtros')->nullable();
            $table->boolean('incluir_graficos')->default(true);
            $table->boolean('incluir_tablas_detalle')->default(true);
            $table->boolean('incluir_comparativas')->default(true);
            $table->enum('estado', ['generando', 'completado', 'error'])->default('generando');
            $table->string('archivo_path')->nullable();
            $table->text('mensaje_error')->nullable();
            $table->timestamp('fecha_generacion')->nullable();
            $table->timestamps();

            $table->index(['campana_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
