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
        // Tabla de templates de mensajes
        Schema::create('templates_comunicacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('created_by_id')->constrained('users');

            $table->string('nombre', 150);
            $table->enum('tipo', ['sms', 'email', 'whatsapp'])->default('sms');
            $table->string('asunto', 255)->nullable(); // Solo para email
            $table->text('contenido'); // Con variables: {nombre}, {puesto_votacion}, etc
            $table->json('variables_disponibles')->nullable(); // Array de variables

            $table->boolean('es_activo')->default(true);
            $table->integer('veces_usado')->default(0);
            $table->timestamp('ultima_vez_usado')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['campana_id', 'tipo']);
            $table->index('es_activo');
        });

        // Tabla de campañas de comunicación
        Schema::create('campanas_comunicacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('template_id')->nullable()->constrained('templates_comunicacion')->onDelete('set null');
            $table->foreignId('segmento_id')->nullable()->constrained('segmentos')->onDelete('set null');
            $table->foreignId('created_by_id')->constrained('users');

            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();
            $table->enum('canal', ['sms', 'email', 'whatsapp', 'multiple'])->default('sms');
            $table->json('canales')->nullable(); // Si es multiple: [sms, email]

            // Audiencia
            $table->enum('audiencia_tipo', ['todos', 'segmento', 'manual'])->default('todos');
            $table->json('votantes_ids')->nullable(); // Si es manual
            $table->integer('total_destinatarios')->default(0);

            // Programación
            $table->enum('estado', ['borrador', 'programada', 'enviando', 'completada', 'cancelada', 'fallida'])->default('borrador');
            $table->timestamp('fecha_programada')->nullable();
            $table->timestamp('fecha_inicio_envio')->nullable();
            $table->timestamp('fecha_fin_envio')->nullable();

            // Estadísticas
            $table->integer('total_enviados')->default(0);
            $table->integer('total_entregados')->default(0);
            $table->integer('total_fallidos')->default(0);
            $table->integer('total_abiertos')->default(0); // Email
            $table->integer('total_clicks')->default(0); // Email
            $table->decimal('tasa_entrega', 5, 2)->default(0); // %
            $table->decimal('tasa_apertura', 5, 2)->default(0); // %

            // Costos
            $table->decimal('costo_estimado', 10, 2)->default(0);
            $table->decimal('costo_real', 10, 2)->default(0);

            $table->json('configuracion')->nullable(); // Velocidad envío, etc
            $table->text('notas')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('campana_id');
            $table->index('estado');
            $table->index('fecha_programada');
        });

        // Tabla de mensajes individuales
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_comunicacion_id')->constrained('campanas_comunicacion')->onDelete('cascade');
            $table->foreignId('votante_id')->constrained('votantes')->onDelete('cascade');

            $table->enum('canal', ['sms', 'email', 'whatsapp']);
            $table->string('destinatario'); // Número o email
            $table->text('contenido'); // Mensaje procesado (con variables reemplazadas)
            $table->string('asunto', 255)->nullable(); // Solo email

            // Estado del mensaje
            $table->enum('estado', ['pendiente', 'enviando', 'enviado', 'entregado', 'fallido', 'rebotado'])->default('pendiente');
            $table->timestamp('fecha_envio')->nullable();
            $table->timestamp('fecha_entrega')->nullable();
            $table->text('error_mensaje')->nullable();

            // Tracking (email)
            $table->timestamp('fecha_apertura')->nullable();
            $table->timestamp('fecha_click')->nullable();
            $table->integer('numero_aperturas')->default(0);
            $table->integer('numero_clicks')->default(0);

            // Proveedor
            $table->string('proveedor', 50)->nullable(); // twilio, ses, whatsapp
            $table->string('mensaje_id_externo')->nullable(); // ID del proveedor
            $table->json('metadata_proveedor')->nullable();

            // Costos
            $table->decimal('costo', 8, 4)->default(0);

            $table->timestamps();

            $table->index('campana_comunicacion_id');
            $table->index('votante_id');
            $table->index('estado');
            $table->index('canal');
            $table->index('fecha_envio');
        });

        // Tabla de webhooks de proveedores
        Schema::create('webhooks_comunicacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mensaje_id')->nullable()->constrained('mensajes')->onDelete('set null');

            $table->string('proveedor', 50); // twilio, ses, whatsapp
            $table->string('evento', 100); // delivered, bounced, opened, clicked
            $table->json('payload'); // Payload completo del webhook
            $table->string('mensaje_id_externo')->nullable();
            $table->timestamp('fecha_evento')->nullable();
            $table->boolean('procesado')->default(false);

            $table->timestamps();

            $table->index('mensaje_id');
            $table->index('proveedor');
            $table->index('procesado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhooks_comunicacion');
        Schema::dropIfExists('mensajes');
        Schema::dropIfExists('campanas_comunicacion');
        Schema::dropIfExists('templates_comunicacion');
    }
};
