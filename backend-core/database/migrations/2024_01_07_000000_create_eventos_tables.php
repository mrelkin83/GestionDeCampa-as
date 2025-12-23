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
        // Tabla de eventos
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('created_by_id')->constrained('users');

            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();
            $table->enum('tipo', [
                'mitin',
                'reunion',
                'puerta_puerta',
                'capacitacion',
                'movilizacion',
                'otro'
            ])->default('mitin');

            // Fecha y hora
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->integer('duracion_estimada')->nullable(); // minutos

            // Ubicación
            $table->string('ubicacion_nombre', 200)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->foreignId('municipio_id')->nullable()->constrained('municipios');
            $table->foreignId('zona_electoral_id')->nullable()->constrained('zonas_electorales')->onDelete('set null');
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->geography('location', 'point', 4326)->nullable();

            // Capacidad y asistencia
            $table->integer('capacidad_maxima')->nullable();
            $table->integer('meta_asistentes')->nullable();
            $table->integer('total_confirmados')->default(0);
            $table->integer('total_asistentes')->default(0);
            $table->integer('total_ausentes')->default(0);

            // Organización
            $table->foreignId('coordinador_id')->nullable()->constrained('users')->onDelete('set null');
            $table->json('responsables_ids')->nullable(); // Array de user_ids
            $table->text('agenda')->nullable();
            $table->text('materiales_necesarios')->nullable();

            // Estado
            $table->enum('estado', [
                'planificado',
                'confirmado',
                'en_curso',
                'finalizado',
                'cancelado',
                'pospuesto'
            ])->default('planificado');

            // Costos
            $table->decimal('presupuesto_estimado', 10, 2)->default(0);
            $table->decimal('costo_real', 10, 2)->default(0);

            // QR Code para check-in
            $table->string('qr_code_url')->nullable();
            $table->string('qr_code_token', 100)->unique()->nullable();

            // Resultados
            $table->text('notas_finales')->nullable();
            $table->decimal('calificacion', 3, 1)->nullable(); // 0.0 a 10.0
            $table->json('fotos_urls')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('campana_id');
            $table->index('fecha_inicio');
            $table->index('estado');
            $table->index('tipo');
            $table->index('municipio_id');
            $table->spatialIndex('location');
        });

        // Tabla de asistencia a eventos
        Schema::create('eventos_asistencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evento_id')->constrained('eventos')->onDelete('cascade');
            $table->foreignId('votante_id')->constrained('votantes')->onDelete('cascade');

            // Confirmación
            $table->boolean('confirmado')->default(false);
            $table->timestamp('fecha_confirmacion')->nullable();
            $table->enum('medio_confirmacion', ['app', 'sms', 'llamada', 'presencial', 'otro'])->nullable();

            // Check-in
            $table->boolean('asistio')->default(false);
            $table->timestamp('fecha_checkin')->nullable();
            $table->enum('metodo_checkin', ['qr', 'manual', 'app'])->nullable();
            $table->foreignId('registrado_por_id')->nullable()->constrained('users')->onDelete('set null');

            // Ubicación del check-in
            $table->decimal('checkin_latitud', 10, 7)->nullable();
            $table->decimal('checkin_longitud', 10, 7)->nullable();

            // Participación
            $table->text('notas')->nullable();
            $table->boolean('trajo_acompanantes')->default(false);
            $table->integer('numero_acompanantes')->default(0);

            $table->timestamps();

            $table->unique(['evento_id', 'votante_id']);
            $table->index('evento_id');
            $table->index('votante_id');
            $table->index('asistio');
        });

        // Tabla de rutas puerta a puerta
        Schema::create('rutas_puerta_puerta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('evento_id')->nullable()->constrained('eventos')->onDelete('set null');
            $table->foreignId('asignado_a_id')->constrained('users')->onDelete('cascade');

            $table->string('nombre', 150);
            $table->foreignId('municipio_id')->constrained('municipios');
            $table->foreignId('zona_electoral_id')->nullable()->constrained('zonas_electorales')->onDelete('set null');
            $table->string('barrio', 100)->nullable();

            // Ruta
            $table->json('direcciones')->nullable(); // Array de direcciones a visitar
            $table->integer('total_viviendas')->default(0);
            $table->integer('viviendas_visitadas')->default(0);
            $table->integer('contactos_exitosos')->default(0);

            // Fechas
            $table->date('fecha_asignacion');
            $table->date('fecha_limite')->nullable();
            $table->date('fecha_completado')->nullable();

            $table->enum('estado', ['pendiente', 'en_progreso', 'completada', 'cancelada'])->default('pendiente');
            $table->text('observaciones')->nullable();

            $table->timestamps();

            $table->index('campana_id');
            $table->index('asignado_a_id');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rutas_puerta_puerta');
        Schema::dropIfExists('eventos_asistencia');
        Schema::dropIfExists('eventos');
    }
};
