<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabla de versiones del censo
        Schema::create('censo_versiones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100); // "Censo 2027 - Corte Marzo"
            $table->string('codigo', 50)->unique(); // "2027-03"
            $table->date('fecha_corte');
            $table->date('fecha_publicacion')->nullable();
            $table->string('fuente', 100)->default('Registraduría Nacional');
            $table->integer('total_registros')->default(0);
            $table->enum('estado', ['borrador', 'procesando', 'activa', 'historica'])->default('borrador');
            $table->text('descripcion')->nullable();
            $table->json('metadata')->nullable(); // Estadísticas, warnings, etc
            $table->timestamps();

            $table->index('codigo');
            $table->index('fecha_corte');
            $table->index('estado');
        });

        // Tabla principal del censo electoral (versionado)
        Schema::create('censo_electoral', function (Blueprint $table) {
            $table->id();
            $table->foreignId('version_id')->constrained('censo_versiones')->onDelete('cascade');

            // Datos personales
            $table->string('documento', 20);
            $table->string('tipo_documento', 10)->default('CC'); // CC, CE, TI
            $table->string('primer_nombre', 50);
            $table->string('segundo_nombre', 50)->nullable();
            $table->string('primer_apellido', 50);
            $table->string('segundo_apellido', 50)->nullable();
            $table->string('genero', 1); // M, F
            $table->date('fecha_nacimiento')->nullable();
            $table->integer('edad')->nullable();

            // Ubicación electoral
            $table->foreignId('departamento_id')->constrained('departamentos');
            $table->foreignId('municipio_id')->constrained('municipios');
            $table->foreignId('puesto_votacion_id')->nullable()->constrained('puestos_votacion')->onDelete('set null');
            $table->foreignId('mesa_id')->nullable()->constrained('mesas')->onDelete('set null');
            $table->string('numero_mesa', 10)->nullable();

            // Ubicación residencia (si difiere de electoral)
            $table->foreignId('departamento_residencia_id')->nullable()->constrained('departamentos');
            $table->foreignId('municipio_residencia_id')->nullable()->constrained('municipios');
            $table->string('direccion_residencia')->nullable();
            $table->string('barrio_residencia', 100)->nullable();

            // Datos de contacto (si disponibles)
            $table->string('telefono', 20)->nullable();
            $table->string('celular', 20)->nullable();
            $table->string('email', 150)->nullable();

            // Estado
            $table->boolean('estado_activo')->default(true); // Habilitado para votar
            $table->string('estado_registro', 50)->default('activo'); // activo, fallecido, suspendido, trasladado

            // Hash para detección duplicados
            $table->string('hash_registro', 64)->index(); // SHA-256 de datos clave

            $table->timestamps();

            // Índices compuestos para performance
            $table->unique(['version_id', 'documento']);
            $table->index('documento');
            $table->index(['version_id', 'departamento_id', 'municipio_id']);
            $table->index(['version_id', 'puesto_votacion_id']);
            $table->index(['version_id', 'mesa_id']);
            $table->index(['primer_apellido', 'primer_nombre']);
            $table->index('genero');
            $table->index('edad');
            $table->index('estado_activo');
        });

        // Tabla de importaciones de censo (log)
        Schema::create('censo_importaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('version_id')->constrained('censo_versiones')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->string('archivo_original', 255);
            $table->string('archivo_s3_key')->nullable();
            $table->integer('total_filas')->default(0);
            $table->integer('filas_exitosas')->default(0);
            $table->integer('filas_errores')->default(0);
            $table->integer('filas_duplicadas')->default(0);
            $table->enum('estado', ['pendiente', 'procesando', 'completada', 'fallida'])->default('pendiente');
            $table->integer('progreso_porcentaje')->default(0);
            $table->text('mensaje_error')->nullable();
            $table->json('errores_detalle')->nullable(); // Array de errores por fila
            $table->json('estadisticas')->nullable();
            $table->timestamp('fecha_inicio')->nullable();
            $table->timestamp('fecha_fin')->nullable();
            $table->timestamps();

            $table->index('version_id');
            $table->index('user_id');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('censo_importaciones');
        Schema::dropIfExists('censo_electoral');
        Schema::dropIfExists('censo_versiones');
    }
};
