<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * GastoController::store()/rechazar()/reportarCNE() y el modelo Gasto
 * referencian columnas que la tabla nunca tuvo (nit_proveedor, metodo_pago,
 * cuenta_bancaria, numero_comprobante, numero_reporte_cne,
 * requiere_validacion, observaciones_validacion) y usan 'responsable_id'
 * donde la tabla tiene 'registrado_por_id'. Esto hacia que registrar,
 * listar, rechazar o reportar al CNE un gasto fallara siempre con
 * "column does not exist" -es decir, el modulo de gastos (reporte de
 * topes legales de campaña ante el CNE) nunca funciono. Se agregan las
 * columnas que ya tienen logica de negocio real (validacion de topes
 * legales en GastoController::store) y se renombra registrado_por_id a
 * responsable_id para alinear con la relacion Gasto::responsable() ya
 * usada de forma consistente en todo el controlador.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->renameColumn('registrado_por_id', 'responsable_id');
        });

        Schema::table('gastos', function (Blueprint $table) {
            $table->string('nit_proveedor', 20)->nullable()->after('proveedor');
            $table->enum('metodo_pago', ['efectivo', 'transferencia', 'cheque', 'tarjeta'])->nullable()->after('numero_factura');
            $table->string('cuenta_bancaria', 50)->nullable()->after('metodo_pago');
            $table->string('numero_comprobante', 100)->nullable()->after('cuenta_bancaria');
            $table->string('numero_reporte_cne', 100)->nullable()->after('fecha_reporte_cne');
            $table->boolean('requiere_validacion')->default(false)->after('estado');
            $table->text('observaciones_validacion')->nullable()->after('requiere_validacion');
        });
    }

    public function down(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->dropColumn([
                'nit_proveedor',
                'metodo_pago',
                'cuenta_bancaria',
                'numero_comprobante',
                'numero_reporte_cne',
                'requiere_validacion',
                'observaciones_validacion',
            ]);
        });

        Schema::table('gastos', function (Blueprint $table) {
            $table->renameColumn('responsable_id', 'registrado_por_id');
        });
    }
};
