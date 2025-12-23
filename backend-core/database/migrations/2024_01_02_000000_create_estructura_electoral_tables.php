<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Habilitar extensión PostGIS (requiere PostgreSQL)
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis;');

        // Tabla de departamentos
        Schema::create('departamentos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 2)->unique(); // 05, 08, 11, 13, etc
            $table->string('nombre', 100);
            $table->string('nombre_oficial', 150)->nullable();
            $table->string('capital', 100)->nullable();
            $table->integer('poblacion')->nullable();
            $table->decimal('area_km2', 10, 2)->nullable();
            $table->string('region', 50)->nullable(); // Andina, Caribe, Pacífica, Orinoquía, Amazonía, Insular
            $table->geometry('geom', 'multipolygon', 4326)->nullable(); // PostGIS
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('codigo');
            $table->spatialIndex('geom');
        });

        // Tabla de municipios
        Schema::create('municipios', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 5)->unique(); // 05001, 08001, 11001 (departamento + municipio)
            $table->string('codigo_departamento', 2);
            $table->string('codigo_municipio', 3); // 001, 002, etc
            $table->string('nombre', 100);
            $table->string('nombre_oficial', 150)->nullable();
            $table->foreignId('departamento_id')->constrained('departamentos')->onDelete('cascade');
            $table->string('tipo', 20)->default('municipio'); // municipio, distrito, corregimiento_departamental
            $table->integer('poblacion')->nullable();
            $table->decimal('area_km2', 10, 2)->nullable();
            $table->integer('altitud')->nullable(); // metros sobre el nivel del mar
            $table->geometry('geom', 'multipolygon', 4326)->nullable(); // PostGIS
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('codigo');
            $table->index('codigo_departamento');
            $table->index('departamento_id');
            $table->spatialIndex('geom');
        });

        // Tabla de zonas electorales (comunas/corregimientos)
        Schema::create('zonas_electorales', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // 05001001, 11001001
            $table->foreignId('municipio_id')->constrained('municipios')->onDelete('cascade');
            $table->string('tipo', 20); // comuna, corregimiento, zona
            $table->string('nombre', 100);
            $table->integer('numero')->nullable(); // Comuna 1, Corregimiento 2
            $table->integer('poblacion')->nullable();
            $table->geometry('geom', 'multipolygon', 4326)->nullable(); // PostGIS
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('codigo');
            $table->index('municipio_id');
            $table->index('tipo');
            $table->spatialIndex('geom');
        });

        // Tabla de puestos de votación
        Schema::create('puestos_votacion', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 15)->unique(); // Código Registraduría
            $table->foreignId('municipio_id')->constrained('municipios')->onDelete('cascade');
            $table->foreignId('zona_electoral_id')->nullable()->constrained('zonas_electorales')->onDelete('set null');
            $table->string('nombre', 200);
            $table->string('direccion', 255);
            $table->string('barrio', 100)->nullable();
            $table->string('tipo_ubicacion', 50)->nullable(); // colegio, universidad, coliseo, etc
            $table->integer('numero_mesas')->default(0);
            $table->integer('votantes_habilitados')->default(0);
            $table->string('zona', 20)->nullable(); // urbana, rural
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->geography('location', 'point', 4326)->nullable(); // PostGIS point
            $table->boolean('accesibilidad_discapacitados')->default(false);
            $table->boolean('transporte_publico')->default(false);
            $table->boolean('parqueadero')->default(false);
            $table->text('observaciones')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('codigo');
            $table->index('municipio_id');
            $table->index('zona_electoral_id');
            $table->index('zona');
            $table->spatialIndex('location');
        });

        // Tabla de mesas de votación
        Schema::create('mesas', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 10); // Número de mesa
            $table->foreignId('puesto_votacion_id')->constrained('puestos_votacion')->onDelete('cascade');
            $table->string('genero', 1)->nullable(); // M, F, X (mixta)
            $table->integer('votantes_habilitados')->default(0);
            $table->integer('numero_inicial')->nullable(); // Primer votante
            $table->integer('numero_final')->nullable(); // Último votante
            $table->boolean('es_especial')->default(false); // Mesa especial (militar, carcelaria, etc)
            $table->string('tipo_especial', 50)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['puesto_votacion_id', 'numero']);
            $table->index('numero');
            $table->index('puesto_votacion_id');
            $table->index('genero');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mesas');
        Schema::dropIfExists('puestos_votacion');
        Schema::dropIfExists('zonas_electorales');
        Schema::dropIfExists('municipios');
        Schema::dropIfExists('departamentos');

        // Desactivar PostGIS (opcional)
        // DB::statement('DROP EXTENSION IF EXISTS postgis CASCADE;');
    }
};
