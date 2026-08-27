<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ComunicacionController::storeCampana() calcula asunto/contenido (del
 * template o de los campos *_personalizado) e intenta guardarlos en la
 * campaña, y EnviarCampanaMasivaJob los lee de $campana->asunto/contenido
 * al momento de enviar -pero la tabla nunca tuvo esas columnas. Al no estar
 * en $fillable (porque no existían), Eloquent los descartaba en silencio:
 * toda campaña de comunicación se guardaba sin contenido, y el job de envío
 * masivo siempre leía null. Se guarda una copia propia (no solo una
 * referencia al template) porque el template puede editarse/borrarse
 * después de que la campaña ya fue enviada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campanas_comunicacion', function (Blueprint $table) {
            $table->string('asunto', 200)->nullable()->after('canales');
            $table->text('contenido')->nullable()->after('asunto');
        });
    }

    public function down(): void
    {
        Schema::table('campanas_comunicacion', function (Blueprint $table) {
            $table->dropColumn(['asunto', 'contenido']);
        });
    }
};
