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
        // Tabla de donantes
        Schema::create('donantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');

            // Tipo de donante
            $table->enum('tipo', ['persona_natural', 'persona_juridica', 'anonimo'])->default('persona_natural');

            // Persona natural
            $table->string('documento', 20)->nullable();
            $table->string('tipo_documento', 10)->nullable();
            $table->string('nombres', 150)->nullable();
            $table->string('apellidos', 150)->nullable();

            // Persona jurídica
            $table->string('razon_social', 200)->nullable();
            $table->string('nit', 20)->nullable();
            $table->string('representante_legal', 200)->nullable();

            // Contacto
            $table->string('email', 150)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->foreignId('municipio_id')->nullable()->constrained('municipios');

            // Estadísticas
            $table->decimal('total_donado', 15, 2)->default(0);
            $table->integer('numero_donaciones')->default(0);
            $table->date('fecha_primera_donacion')->nullable();
            $table->date('fecha_ultima_donacion')->nullable();

            // Clasificación
            $table->enum('categoria', ['recurrente', 'ocasional', 'grande', 'pequeno'])->default('ocasional');
            $table->text('notas')->nullable();

            // Compliance
            $table->boolean('acepta_publicacion')->default(false); // CNE requiere publicar
            $table->boolean('es_valido')->default(true);
            $table->text('razon_invalido')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('campana_id');
            $table->index('tipo');
            $table->index(['documento', 'campana_id']);
            $table->index('total_donado');
        });

        // Tabla de donaciones
        Schema::create('donaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('donante_id')->constrained('donantes')->onDelete('cascade');
            $table->foreignId('registrado_por_id')->constrained('users');

            // Datos de la donación
            $table->decimal('monto', 15, 2);
            $table->enum('moneda', ['COP', 'USD'])->default('COP');
            $table->enum('tipo', ['efectivo', 'transferencia', 'cheque', 'especie', 'servicio'])->default('efectivo');
            $table->date('fecha_donacion');
            $table->date('fecha_registro')->useCurrent();

            // Detalles
            $table->text('concepto')->nullable();
            $table->string('numero_comprobante', 100)->nullable();
            $table->string('numero_cuenta_destino', 50)->nullable();

            // Donación en especie
            $table->text('descripcion_especie')->nullable();
            $table->decimal('valor_estimado_especie', 15, 2)->nullable();

            // Documentos
            $table->json('documentos_soporte')->nullable(); // URLs en S3
            $table->string('recibo_url')->nullable(); // Recibo generado

            // Estado
            $table->enum('estado', ['pendiente', 'confirmada', 'rechazada', 'reportada_cne'])->default('pendiente');
            $table->text('notas')->nullable();

            // Compliance CNE
            $table->boolean('reportada_cne')->default(false);
            $table->date('fecha_reporte_cne')->nullable();
            $table->string('numero_reporte_cne', 100)->nullable();

            // Validaciones
            $table->boolean('excede_tope_individual')->default(false);
            $table->boolean('requiere_validacion')->default(false);
            $table->text('observaciones_validacion')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('campana_id');
            $table->index('donante_id');
            $table->index('fecha_donacion');
            $table->index('estado');
            $table->index('reportada_cne');
        });

        // Tabla de gastos de campaña
        Schema::create('gastos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('registrado_por_id')->constrained('users');
            $table->foreignId('aprobado_por_id')->nullable()->constrained('users')->onDelete('set null');

            // Datos del gasto
            $table->decimal('monto', 15, 2);
            $table->enum('moneda', ['COP', 'USD'])->default('COP');
            $table->date('fecha_gasto');
            $table->date('fecha_registro')->useCurrent();

            // Categoría
            $table->enum('categoria', [
                'publicidad',
                'eventos',
                'logistica',
                'personal',
                'materiales',
                'transporte',
                'servicios_profesionales',
                'otro'
            ])->default('otro');

            $table->string('subcategoria', 100)->nullable();

            // Detalles
            $table->text('descripcion');
            $table->string('proveedor', 200)->nullable();
            $table->string('numero_factura', 100)->nullable();

            // Documentos
            $table->json('documentos_soporte')->nullable(); // URLs en S3

            // Estado
            $table->enum('estado', ['pendiente', 'aprobado', 'rechazado', 'pagado', 'reportado_cne'])->default('pendiente');
            $table->date('fecha_aprobacion')->nullable();
            $table->text('notas_aprobacion')->nullable();

            // Compliance CNE
            $table->boolean('reportado_cne')->default(false);
            $table->date('fecha_reporte_cne')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('campana_id');
            $table->index('fecha_gasto');
            $table->index('categoria');
            $table->index('estado');
        });

        // Tabla de topes legales
        Schema::create('topes_legales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');

            $table->string('tipo_eleccion', 50); // senado, camara, gobernacion, alcaldia
            $table->string('nivel', 50); // nacional, departamental, municipal
            $table->integer('ano_eleccion');

            // Topes CNE
            $table->decimal('tope_gastos', 15, 2);
            $table->decimal('tope_donaciones_individuales', 15, 2);
            $table->decimal('limite_efectivo', 15, 2)->nullable();

            // Cálculos automáticos
            $table->decimal('total_donaciones_actual', 15, 2)->default(0);
            $table->decimal('total_gastos_actual', 15, 2)->default(0);
            $table->decimal('porcentaje_tope_gastos', 5, 2)->default(0);
            $table->decimal('porcentaje_tope_donaciones', 5, 2)->default(0);

            // Alertas
            $table->boolean('alerta_80_porciento')->default(false);
            $table->boolean('alerta_90_porciento')->default(false);
            $table->boolean('alerta_excedido')->default(false);

            $table->timestamp('ultima_actualizacion')->useCurrent();
            $table->timestamps();

            $table->unique('campana_id');
            $table->index('tipo_eleccion');
        });

        // Tabla de reportes CNE
        Schema::create('reportes_cne', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('generado_por_id')->constrained('users');

            $table->enum('tipo', ['inicial', 'parcial', 'final', 'extraordinario'])->default('parcial');
            $table->date('fecha_inicio_periodo');
            $table->date('fecha_fin_periodo');

            // Estadísticas del periodo
            $table->integer('total_donaciones')->default(0);
            $table->decimal('monto_total_donaciones', 15, 2)->default(0);
            $table->integer('total_gastos')->default(0);
            $table->decimal('monto_total_gastos', 15, 2)->default(0);

            // Archivo generado
            $table->string('archivo_pdf_url')->nullable();
            $table->string('archivo_excel_url')->nullable();

            // Estado
            $table->enum('estado', ['borrador', 'generado', 'enviado_cne', 'aprobado_cne'])->default('borrador');
            $table->date('fecha_envio_cne')->nullable();
            $table->string('numero_radicado_cne', 100)->nullable();

            $table->timestamps();

            $table->index('campana_id');
            $table->index('tipo');
            $table->index('estado');
            $table->index(['fecha_inicio_periodo', 'fecha_fin_periodo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reportes_cne');
        Schema::dropIfExists('topes_legales');
        Schema::dropIfExists('gastos');
        Schema::dropIfExists('donaciones');
        Schema::dropIfExists('donantes');
    }
};
