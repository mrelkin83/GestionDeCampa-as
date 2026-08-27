<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * Listar roles activos (para selección al crear usuarios).
     * Protegido + restringido a super_admin vía ruta.
     */
    public function index(): JsonResponse
    {
        $roles = Role::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'display_name', 'description']);

        return response()->json([
            'success' => true,
            'data' => $roles,
        ], 200);
    }
}
