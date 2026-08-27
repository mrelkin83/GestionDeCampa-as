<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * templates_comunicacion se creo con columnas 'tipo' y 'es_activo', pero
 * ComunicacionController y ComunicacionTemplate (junto con el resto del
 * modulo: CampanaComunicacion, Mensaje) usan consistentemente 'canal' y
 * 'activo' en toda la aplicacion. El desajuste hacia que cualquier
 * operacion sobre templates (crear, listar, filtrar) fallara con
 * "column does not exist". Se renombra para alinear con la convencion
 * real del modulo en vez de reescribir controlador+modelo+frontend.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates_comunicacion', function (Blueprint $table) {
            $table->renameColumn('tipo', 'canal');
            $table->renameColumn('es_activo', 'activo');
        });
    }

    public function down(): void
    {
        Schema::table('templates_comunicacion', function (Blueprint $table) {
            $table->renameColumn('canal', 'tipo');
            $table->renameColumn('activo', 'es_activo');
        });
    }
};
