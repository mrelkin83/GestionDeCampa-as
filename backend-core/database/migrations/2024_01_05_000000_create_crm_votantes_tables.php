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
        // Tabla de votantes (CRM Político)
        Schema::create('votantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');

            // Vinculación con censo
            $table->foreignId('censo_id')->nullable()->constrained('censo_electoral')->onDelete('set null');

            // Datos personales
            $table->string('documento', 20);
            $table->string('tipo_documento', 10)->default('CC');
            $table->string('primer_nombre', 50);
            $table->string('segundo_nombre', 50)->nullable();
            $table->string('primer_apellido', 50);
            $table->string('segundo_apellido', 50)->nullable();
            $table->string('genero', 1)->nullable(); // M, F
            $table->date('fecha_nacimiento')->nullable();
            $table->integer('edad')->nullable();

            // Contacto
            $table->string('celular', 20)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->string('barrio', 100)->nullable();

            // Ubicación electoral
            $table->foreignId('departamento_id')->nullable()->constrained('departamentos');
            $table->foreignId('municipio_id')->nullable()->constrained('municipios');
            $table->foreignId('zona_electoral_id')->nullable()->constrained('zonas_electorales')->onDelete('set null');
            $table->foreignId('puesto_votacion_id')->nullable()->constrained('puestos_votacion')->onDelete('set null');
            $table->foreignId('mesa_id')->nullable()->constrained('mesas')->onDelete('set null');

            // Información política
            $table->string('intencion_voto', 20)->default('sin_definir'); // a_favor, en_contra, indeciso, sin_definir
            $table->integer('probabilidad_voto')->default(50); // 0-100
            $table->integer('scoring')->default(50); // 0-100
            $table->json('intereses')->nullable(); // Array de intereses/temas
            $table->text('observaciones')->nullable();

            // Liderazgo
            $table->boolean('es_lider')->default(false);
            $table->string('tipo_lider', 50)->nullable(); // barrial, empresarial, social, religioso, etc
            $table->integer('alcance_estimado')->nullable(); // Cuántos votos puede movilizar
            $table->foreignId('lider_asignado_id')->nullable()->constrained('votantes')->onDelete('set null');

            // Segmentación
            $table->json('tags')->nullable(); // Array de etiquetas
            $table->string('ocupacion', 100)->nullable();
            $table->string('nivel_educativo', 50)->nullable();
            $table->decimal('estrato_socioeconomico', 2, 1)->nullable(); // 1.0 a 6.0

            // Engagement
            $table->integer('numero_contactos')->default(0);
            $table->timestamp('ultimo_contacto')->nullable();
            $table->timestamp('ultima_actualizacion_datos')->nullable();
            $table->boolean('acepta_comunicaciones')->default(true);
            $table->json('canales_preferidos')->nullable(); // [sms, email, whatsapp, llamada]

            // Estado
            $table->enum('estado', ['activo', 'inactivo', 'fallecido', 'no_contactable'])->default('activo');
            $table->boolean('es_verificado')->default(false); // Verificado en campo
            $table->foreignId('verificado_por_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('fecha_verificacion')->nullable();

            // Metadata
            $table->json('datos_adicionales')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->unique(['campana_id', 'documento']);
            $table->index('documento');
            $table->index(['campana_id', 'intencion_voto']);
            $table->index(['campana_id', 'es_lider']);
            $table->index(['campana_id', 'scoring']);
            $table->index(['campana_id', 'municipio_id']);
            $table->index('estado');
            $table->index(['primer_apellido', 'primer_nombre']);
        });

        // Tabla de contactos/interacciones
        Schema::create('contactos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('votante_id')->constrained('votantes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Quién hizo el contacto

            // Datos del contacto
            $table->string('tipo', 30); // llamada, visita, sms, email, whatsapp, evento
            $table->enum('resultado', ['exitoso', 'sin_respuesta', 'rechazado', 'pendiente'])->default('pendiente');
            $table->text('notas')->nullable();
            $table->json('datos_adicionales')->nullable(); // Duración llamada, ubicación visita, etc

            // Cambios detectados
            $table->string('intencion_voto_antes', 20)->nullable();
            $table->string('intencion_voto_despues', 20)->nullable();
            $table->boolean('cambio_datos_contacto')->default(false);

            // Seguimiento
            $table->boolean('requiere_seguimiento')->default(false);
            $table->date('fecha_seguimiento')->nullable();
            $table->foreignId('asignado_a_id')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();

            $table->index('votante_id');
            $table->index('campana_id');
            $table->index('user_id');
            $table->index('tipo');
            $table->index('created_at');
        });

        // Tabla de segmentos
        Schema::create('segmentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('created_by_id')->constrained('users')->onDelete('cascade');

            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->json('criterios'); // Criterios de segmentación en JSON
            $table->integer('total_votantes')->default(0);
            $table->boolean('es_dinamico')->default(true); // Se actualiza automáticamente
            $table->timestamp('ultima_actualizacion')->nullable();

            $table->timestamps();

            $table->index('campana_id');
        });

        // Tabla pivot: segmento_votante (para segmentos estáticos)
        Schema::create('segmento_votante', function (Blueprint $table) {
            $table->id();
            $table->foreignId('segmento_id')->constrained('segmentos')->onDelete('cascade');
            $table->foreignId('votante_id')->constrained('votantes')->onDelete('cascade');
            $table->timestamp('agregado_en')->useCurrent();

            $table->unique(['segmento_id', 'votante_id']);
            $table->index('segmento_id');
            $table->index('votante_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('segmento_votante');
        Schema::dropIfExists('segmentos');
        Schema::dropIfExists('contactos');
        Schema::dropIfExists('votantes');
    }
};
