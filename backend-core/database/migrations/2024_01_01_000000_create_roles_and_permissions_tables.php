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
        // Tabla de roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique(); // super_admin, admin_campaña, coordinador, operador_call_center, testigo
            $table->string('display_name', 100);
            $table->text('description')->nullable();
            $table->json('permissions')->nullable(); // Array de permisos
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabla de permisos (granular)
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('module', 50); // crm, electoral, communication, events, donations, diad
            $table->string('action', 50); // view, create, edit, delete, export
            $table->string('resource', 100); // votantes, campañas, eventos, etc
            $table->string('name', 100)->unique(); // crm.votantes.view
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['module', 'action']);
        });

        // Tabla pivot: role_permission
        Schema::create('role_permission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['role_id', 'permission_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permission');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
