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
        // Tabla de cargos electorales
        Schema::create('cargos_electorales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100); // Gobernador, Alcalde, Senador, Representante, etc
            $table->string('tipo_eleccion', 50); // territorial, legislativa, presidencial
            $table->string('nivel', 50); // nacional, departamental, municipal, local
            $table->text('descripcion')->nullable();
            $table->integer('periodo_anos')->default(4);
            $table->boolean('permite_reeleccion')->default(false);
            $table->json('requisitos')->nullable();
            $table->timestamps();

            $table->index('tipo_eleccion');
            $table->index('nivel');
        });

        // Tabla de campañas
        Schema::create('campanas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 200);
            $table->string('slug', 200)->unique();
            $table->foreignId('cargo_electoral_id')->constrained('cargos_electorales');
            $table->date('fecha_eleccion');
            $table->string('tipo_eleccion', 50); // primera_vuelta, segunda_vuelta, consulta

            // Alcance territorial
            $table->foreignId('departamento_id')->nullable()->constrained('departamentos')->onDelete('set null');
            $table->foreignId('municipio_id')->nullable()->constrained('municipios')->onDelete('set null');

            // Información candidato
            $table->string('candidato_nombre', 200);
            $table->string('candidato_documento', 20)->nullable();
            $table->string('partido_politico', 150)->nullable();
            $table->string('coalicion', 200)->nullable();
            $table->text('slogan')->nullable();
            $table->string('logo_url')->nullable();
            $table->json('colores_campana')->nullable(); // Array de colores hex

            // Topes legales CNE
            $table->decimal('tope_gastos', 15, 2)->nullable(); // En COP
            $table->decimal('tope_donaciones_individuales', 15, 2)->nullable();
            $table->decimal('total_donaciones', 15, 2)->default(0);
            $table->decimal('total_gastos', 15, 2)->default(0);

            // Estado
            $table->enum('estado', ['planificacion', 'activa', 'finalizada', 'suspendida'])->default('planificacion');
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();

            // Resultados
            $table->integer('votos_obtenidos')->nullable();
            $table->decimal('porcentaje_votos', 5, 2)->nullable();
            $table->boolean('resultado_ganador')->nullable();

            // Configuración
            $table->json('configuracion')->nullable(); // Módulos habilitados, features, etc
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index('fecha_eleccion');
            $table->index('estado');
            $table->index('cargo_electoral_id');
            $table->index(['departamento_id', 'municipio_id']);
        });

        // Tabla pivot: users_campañas (multi-tenant)
        Schema::create('campana_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles'); // Rol dentro de esta campaña

            // Alcance territorial dentro de la campaña
            $table->foreignId('departamento_id')->nullable()->constrained('departamentos')->onDelete('set null');
            $table->foreignId('municipio_id')->nullable()->constrained('municipios')->onDelete('set null');
            $table->foreignId('zona_electoral_id')->nullable()->constrained('zonas_electorales')->onDelete('set null');

            $table->boolean('is_active')->default(true);
            $table->timestamp('fecha_asignacion')->useCurrent();
            $table->timestamps();

            $table->unique(['campana_id', 'user_id']);
            $table->index('campana_id');
            $table->index('user_id');
            $table->index('role_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campana_user');
        Schema::dropIfExists('campanas');
        Schema::dropIfExists('cargos_electorales');
    }
};
