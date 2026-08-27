<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PrecountController::storeActa() y ProcesarImagenActaJob ya escriben/leen
 * procesado/procesado_at en precount_evidence, y el modelo PrecountEvidence
 * los declara en $fillable/$casts, pero la migración original nunca creó
 * estas columnas. Confirmado con una petición real: subir un acta con foto
 * (imagen_acta) crasheaba con 500 - "column procesado does not exist" - es
 * decir, el flujo de evidencia fotográfica del preconteo estaba roto de
 * punta a punta.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('precount_evidence', function (Blueprint $table) {
            $table->boolean('procesado')->default(false)->after('legible');
            $table->timestamp('procesado_at')->nullable()->after('procesado');
        });
    }

    public function down(): void
    {
        Schema::table('precount_evidence', function (Blueprint $table) {
            $table->dropColumn(['procesado', 'procesado_at']);
        });
    }
};
