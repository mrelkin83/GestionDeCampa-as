<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * segmentos.criterios se creo NOT NULL, pero un segmento estatico (curado
 * manualmente via agregarVotantes/removerVotantes) legitimamente no tiene
 * criterios de filtrado -solo los dinamicos los usan. Esto hacia que crear
 * cualquier segmento estatico fallara siempre con una violacion NOT NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('segmentos', function (Blueprint $table) {
            $table->json('criterios')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('segmentos', function (Blueprint $table) {
            $table->json('criterios')->nullable(false)->change();
        });
    }
};
