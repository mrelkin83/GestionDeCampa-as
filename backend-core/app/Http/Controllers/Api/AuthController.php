<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    /**
     * JWT que el frontend usa para autenticarse contra backend-diad (REST y
     * WebSocket de Día D). Antes no existía ningún emisor real de JWT en
     * el monorepo: el frontend solo tenía el token opaco de Sanctum
     * ($token más abajo), que los guards de backend-diad (jwt.verify)
     * rechazan siempre como "jwt malformed" -ninguna conexión al módulo de
     * Día D en tiempo real podía autenticarse nunca, sin importar que los
     * guards estuvieran bien escritos. El secreto es compartido con
     * backend-diad/.env (JWT_SECRET).
     */
    private function generarTokenWebSocket(User $user): ?string
    {
        $secret = config('services.jwt_ws.secret');

        if (!$secret) {
            return null;
        }

        $ttlHoras = (int) config('services.jwt_ws.ttl', 24);

        // IDs de campañas activas del usuario: los gateways de backend-diad
        // (Actas/Alertas/Conteo/Testigos) los usan para autorizar a qué
        // rooms "campaign-{id}" puede unirse, igual que
        // User::hasAccessToCampana() en el resto de la API.
        $campanas = $user->campanas()->wherePivot('is_active', true)->pluck('campanas.id');

        return JWT::encode([
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role->name ?? null,
            'campanas' => $campanas,
            'iat' => now()->timestamp,
            'exp' => now()->addHours($ttlHoras)->timestamp,
        ], $secret, 'HS256');
    }

    /**
     * Login de usuario
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario inactivo. Contacte al administrador.',
            ], 403);
        }

        // Actualizar último login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        // Crear token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Cargar relaciones
        $user->load('role', 'campanas');

        return response()->json([
            'success' => true,
            'message' => 'Login exitoso',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $user->full_name,
                    'role' => $user->role->name,
                    'role_display_name' => $user->role->display_name,
                    'avatar_url' => $user->avatar_url,
                    'campanas' => $user->campanas->map(function ($campana) {
                        return [
                            'id' => $campana->id,
                            'nombre' => $campana->nombre,
                            'slug' => $campana->slug,
                        ];
                    }),
                ],
                'token' => $token,
                'ws_token' => $this->generarTokenWebSocket($user),
            ],
        ], 200);
    }

    /**
     * Obtener usuario autenticado
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('role', 'campanas');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'phone' => $user->phone,
                'document_type' => $user->document_type,
                'document_number' => $user->document_number,
                'avatar_url' => $user->avatar_url,
                'role' => [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'display_name' => $user->role->display_name,
                    'permissions' => $user->role->permissions,
                ],
                'campanas' => $user->campanas,
                'last_login_at' => $user->last_login_at,
            ],
        ], 200);
    }

    /**
     * Logout de usuario
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente',
        ], 200);
    }

    /**
     * Registrar nuevo usuario (solo admin)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'document_type' => 'required|in:CC,CE,TI,PAS',
            'document_number' => 'required|string|max:20|unique:users,document_number',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'document_type' => $request->document_type,
            'document_number' => $request->document_number,
            'role_id' => $request->role_id,
            'is_active' => true,
        ]);

        $user->load('role');

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'data' => $user,
        ], 201);
    }

    /**
     * Actualizar datos del propio perfil (no permite cambiar email, rol ni
     * contraseña -eso pasa por register()/changePassword() bajo control de
     * permisos aparte).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $user->update($validator->validated());
        $user->load('role');

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
            ],
        ], 200);
    }

    /**
     * Cambiar la contraseña del usuario autenticado. Exige la contraseña
     * actual y revoca el resto de tokens activos por seguridad (un cambio
     * de contraseña debe cerrar cualquier otra sesión existente).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'La contraseña actual es incorrecta',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        // Revocar otros tokens: un cambio de contraseña debe invalidar
        // cualquier sesión abierta en otros dispositivos.
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente',
        ], 200);
    }
}
