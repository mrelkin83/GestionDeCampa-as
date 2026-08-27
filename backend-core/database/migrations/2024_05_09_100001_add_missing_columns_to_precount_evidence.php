<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ProcesarImagenActaJob y App\Models\PrecountEvidence ($fillable/$casts) ya
 * leen/escriben thumbnail_url, tamanio_kb y error_procesamiento, pero
 * ninguna migración las creó -mismo patrón que procesado/procesado_at
 * (ver 2024_05_09_100000). Sin estas columnas, tanto el camino feliz
 * (job.handle() actualiza thumbnail_url/tamanio_kb) como el de error
 * (marcarError() escribe error_procesamiento) fallan con
 * "column does not exist".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('precount_evidence', function (Blueprint $table) {
            $table->string('thumbnail_url', 500)->nullable()->after('imagen_url');
            $table->float('tamanio_kb')->nullable()->after('procesado_at');
            $table->text('error_procesamiento')->nullable()->after('tamanio_kb');
        });
    }

    public function down(): void
    {
        Schema::table('precount_evidence', function (Blueprint $table) {
            $table->dropColumn(['thumbnail_url', 'tamanio_kb', 'error_procesamiento']);
        });
    }
};
