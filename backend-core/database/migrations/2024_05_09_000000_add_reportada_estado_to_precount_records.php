<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * PrecountController::storeActa() pone estado='REPORTADA' en el acta cuando
 * no hay alertas críticas (el camino feliz, el caso más común) -- pero el
 * enum original de precount_records.estado solo permitía CARGADA/OBSERVADA/
 * VALIDADA. Confirmado con una inserción real contra Postgres: cualquier
 * acta sin alertas críticas fallaba con "check constraint
 * precount_records_estado_check" violada. mesa_cargo_status.estado ya
 * incluye REPORTADA (PENDIENTE/REPORTADA/OBSERVADA/VALIDADA), confirmando
 * que es un estado real del flujo, no un valor inventado.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE precount_records DROP CONSTRAINT precount_records_estado_check');
        DB::statement("ALTER TABLE precount_records ADD CONSTRAINT precount_records_estado_check CHECK (estado IN ('CARGADA', 'REPORTADA', 'OBSERVADA', 'VALIDADA'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE precount_records DROP CONSTRAINT precount_records_estado_check');
        DB::statement("ALTER TABLE precount_records ADD CONSTRAINT precount_records_estado_check CHECK (estado IN ('CARGADA', 'OBSERVADA', 'VALIDADA'))");
    }
};
