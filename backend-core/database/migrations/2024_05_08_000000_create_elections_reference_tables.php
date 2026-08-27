<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tablas de referencia electoral (elections, election_positions, candidates).
     *
     * PrecountController::getElecciones()/getCargosByEleccion() ya consultaban
     * 'elections'/'election_positions' vía DB::table(), y PrecountVote/
     * PrecountAggregate::candidate() ya apuntaban a App\Models\Candidato,
     * pero ninguna de las tres tablas existía: precount_records.election_position_id
     * y precount_votes.candidate_id se guardaban sin ninguna validación de
     * integridad referencial (cualquier entero servía).
     */
    public function up(): void
    {
        Schema::create('elections', function (Blueprint $table) {
            $table->id();
            $table->integer('year');
            $table->string('tipo', 50); // territorial, legislativa, presidencial
            $table->date('fecha');
            $table->string('nombre', 200);
            $table->boolean('activa')->default(true);
            $table->timestamps();

            $table->index('activa');
        });

        Schema::create('election_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('elections')->onDelete('cascade');
            $table->string('tipo', 50); // alcaldia, concejo, gobernacion, asamblea, ...
            $table->string('nombre', 150);
            $table->string('nivel', 50); // municipal, departamental, nacional
            $table->timestamps();

            $table->index('election_id');
        });

        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_position_id')->constrained('election_positions')->onDelete('cascade');
            $table->string('nombre', 200);
            $table->string('partido_politico', 150)->nullable();
            $table->string('numero_tarjeton', 20)->nullable();
            $table->string('foto_url')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index(['election_position_id', 'activo']);
        });

        // Cerrar el hueco de integridad referencial en las tablas de preconteo
        // ya existentes, ahora que las tablas destino existen.
        Schema::table('precount_records', function (Blueprint $table) {
            $table->foreign('election_position_id')
                ->references('id')->on('election_positions')
                ->onDelete('restrict');
        });

        Schema::table('precount_votes', function (Blueprint $table) {
            $table->foreign('candidate_id')
                ->references('id')->on('candidates')
                ->onDelete('restrict');
        });

        Schema::table('precount_aggregates', function (Blueprint $table) {
            $table->foreign('election_position_id')
                ->references('id')->on('election_positions')
                ->onDelete('restrict');
            $table->foreign('candidate_id')
                ->references('id')->on('candidates')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::table('precount_aggregates', function (Blueprint $table) {
            $table->dropForeign(['election_position_id']);
            $table->dropForeign(['candidate_id']);
        });

        Schema::table('precount_votes', function (Blueprint $table) {
            $table->dropForeign(['candidate_id']);
        });

        Schema::table('precount_records', function (Blueprint $table) {
            $table->dropForeign(['election_position_id']);
        });

        Schema::dropIfExists('candidates');
        Schema::dropIfExists('election_positions');
        Schema::dropIfExists('elections');
    }
};
