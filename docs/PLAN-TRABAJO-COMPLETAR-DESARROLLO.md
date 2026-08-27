# 📋 PLAN DE TRABAJO PARA COMPLETAR EL DESARROLLO
## Plataforma Electoral Colombia - Gestión de Campañas

**Fecha de Plan:** 7 de Mayo, 2026  
**Fecha Límite:** 24 de Octubre, 2027 (Elecciones)  
**Tiempo Disponible:** ~23 semanas (5.5 meses)  
**Estado Actual:** ~35-40% completado  
**Objetivo:** 100% funcional para elecciones territoriales

---

## 🎯 ESTRATEGIA GENERAL

### Priorización por Criticidad:
1. 🔴 **CRÍTICO:** Bloqueantes para operación electoral
2. 🟡 **IMPORTANTE:** Funcionalidad esencial pero no bloqueante
3. 🟢 **DESEABLE:** Mejoras post-MVP

### Fases del Plan:
- **FASE 1:** Backend Día D (Semanas 1-10) - CRÍTICO
- **FASE 2:** PWA Testigos (Semanas 8-14) - CRÍTICO
- **FASE 3:** Infraestructura & Deploy (Semanas 12-16) - CRÍTICO
- **FASE 4:** Frontend & Integración (Semanas 14-18) - IMPORTANTE
- **FASE 5:** Testing & Hardening (Semanas 18-22) - CRÍTICO
- **FASE 6:** Simulacros & Go-Live (Semanas 22-23) - CRÍTICO

---

## 📅 CRONOGRAMA DETALLADO

```
MAYO 2026                           JULIO 2026                          SEPTIEMBRE 2026                     OCTUBRE 2027
| Sem 1-4 |                         | Sem 5-8 |                         | Sem 9-12 |                        | Sem 17-23 |
├─────────┤                         ├─────────┤                         ├──────────┤                        ├───────────┤
│  FASE 1 │                         │  FASE 2 │                         │  FASE 4  │                        │  FASE 6   │
│ Backend │────────────────────────→│   PWA   │────────────────────────→│ Frontend │───────────────────────→│ Go-Live   │
│  Día D  │                         │Testigos │                         │Integración│                       │           │
└────┬────┘                         └────┬────┘                         └────┬─────┘                       └───────────┘
     │                                   │                                    │
     └───────────────────────────────────┴────────────────────────────────────┘
              FASE 3: Infraestructura & Deploy (Semanas 12-16)
                                         │
                                         ↓
                              FASE 5: Testing & Hardening (Semanas 18-22)
```

---

## 🔴 FASE 1: BACKEND DÍA D (Semanas 1-10)
**Objetivo:** Completar sistema de preconteo electoral  
**Prioridad:** CRÍTICA - Sin esto no hay elecciones  
**Estimación:** 10 semanas (6h/día, 6 días/semana)

### Semana 1-2: Base de Datos Preconteo

#### Tarea 1.1: Crear Migraciones Preconteo
**Archivos a crear:**
- `backend-core/database/migrations/2024_05_07_000001_create_preconteo_tables.php`
- `backend-diad/src/database/migrations/`

**Tablas a crear:**
```sql
-- 1. precount_records (Actas de preconteo)
CREATE TABLE precount_records (
    id BIGSERIAL PRIMARY KEY,
    polling_table_id INTEGER NOT NULL,
    election_position_id INTEGER NOT NULL,
    version INTEGER DEFAULT 1,
    total_sufragantes INTEGER NOT NULL,
    votos_nulos INTEGER DEFAULT 0,
    votos_no_marcados INTEGER DEFAULT 0,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'CARGADA', -- CARGADA, OBSERVADA, VALIDADA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(polling_table_id, election_position_id, version)
);

-- 2. precount_votes (Votos por candidato)
CREATE TABLE precount_votes (
    id BIGSERIAL PRIMARY KEY,
    precount_record_id BIGINT NOT NULL,
    candidate_id INTEGER NOT NULL,
    votos INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (precount_record_id) REFERENCES precount_records(id)
);

-- 3. precount_evidence (Evidencia fotográfica)
CREATE TABLE precount_evidence (
    id BIGSERIAL PRIMARY KEY,
    precount_record_id BIGINT NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    hash_imagen VARCHAR(64) NOT NULL,
    ocr_text TEXT,
    legible BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (precount_record_id) REFERENCES precount_records(id)
);

-- 4. precount_metadata (Cadena de custodia)
CREATE TABLE precount_metadata (
    id BIGSERIAL PRIMARY KEY,
    precount_record_id BIGINT NOT NULL,
    reportado_por_usuario_id INTEGER NOT NULL,
    rol VARCHAR(50) NOT NULL,
    gps_lat DECIMAL(10,8),
    gps_lng DECIMAL(11,8),
    dispositivo VARCHAR(200),
    offline BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (precount_record_id) REFERENCES precount_records(id)
);

-- 5. precount_validations (Validaciones automáticas)
CREATE TABLE precount_validations (
    id BIGSERIAL PRIMARY KEY,
    precount_record_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- SUMA_INVALIDA, VOTOS_SUPERAN_SUFRAGANTES, ACTA_ILEGIBLE
    severidad VARCHAR(20) NOT NULL, -- INFO, WARNING, CRITICAL
    mensaje TEXT NOT NULL,
    resuelta BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (precount_record_id) REFERENCES precount_records(id)
);

-- 6. precount_aggregates (Resultados agregados - tipo Registraduría)
CREATE TABLE precount_aggregates (
    id BIGSERIAL PRIMARY KEY,
    scope_type VARCHAR(20) NOT NULL, -- MESA, PUESTO, MUNICIPIO, DEPARTAMENTO
    scope_id INTEGER NOT NULL,
    election_position_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    votos INTEGER DEFAULT 0,
    porcentaje DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scope_type, scope_id, election_position_id, candidate_id)
);

-- 7. mesa_cargo_status (Estado por mesa y cargo)
CREATE TABLE mesa_cargo_status (
    id BIGSERIAL PRIMARY KEY,
    mesa_id INTEGER NOT NULL,
    cargo_id INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, REPORTADA, OBSERVADA, VALIDADA
    precount_record_id BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mesa_id, cargo_id)
);
```

**Índices a crear:**
```sql
-- Índices críticos para performance
CREATE INDEX idx_precount_records_table ON precount_records(polling_table_id);
CREATE INDEX idx_precount_records_cargo ON precount_records(election_position_id);
CREATE INDEX idx_precount_records_estado ON precount_records(estado);
CREATE INDEX idx_precount_votes_record ON precount_votes(precount_record_id);
CREATE INDEX idx_precount_aggregates_scope ON precount_aggregates(scope_type, scope_id);
CREATE INDEX idx_mesa_cargo_status ON mesa_cargo_status(mesa_id, cargo_id);
```

**Checklist:**
- [ ] Crear migración Laravel
- [ ] Ejecutar `php artisan migrate`
- [ ] Verificar tablas creadas en PostgreSQL
- [ ] Crear seeders de prueba (10 registros)

---

#### Tarea 1.2: Crear Modelos Eloquent
**Archivos a crear:**
- `backend-core/app/Models/PrecountRecord.php`
- `backend-core/app/Models/PrecountVote.php`
- `backend-core/app/Models/PrecountEvidence.php`
- `backend-core/app/Models/PrecountMetadata.php`
- `backend-core/app/Models/PrecountValidation.php`
- `backend-core/app/Models/PrecountAggregate.php`
- `backend-core/app/Models/MesaCargoStatus.php`

**Estructura modelo PrecountRecord:**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrecountRecord extends Model
{
    use HasFactory;

    protected $table = 'precount_records';
    
    protected $fillable = [
        'polling_table_id',
        'election_position_id',
        'version',
        'total_sufragantes',
        'votos_nulos',
        'votos_no_marcados',
        'observaciones',
        'estado'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function votes()
    {
        return $this->hasMany(PrecountVote::class, 'precount_record_id');
    }

    public function evidence()
    {
        return $this->hasMany(PrecountEvidence::class, 'precount_record_id');
    }

    public function metadata()
    {
        return $this->hasOne(PrecountMetadata::class, 'precount_record_id');
    }

    public function validations()
    {
        return $this->hasMany(PrecountValidation::class, 'precount_record_id');
    }

    public function pollingTable()
    {
        return $this->belongsTo(Mesa::class, 'polling_table_id');
    }

    // Scopes
    public function scopeByEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopeByMesa($query, $mesaId)
    {
        return $query->where('polling_table_id', $mesaId);
    }
}
```

**Checklist:**
- [ ] Crear todos los modelos
- [ ] Definir relaciones entre modelos
- [ ] Agregar scopes útiles
- [ ] Testing básico de modelos

---

### Semana 3-4: API REST Preconteo

#### Tarea 1.3: Crear PrecountController
**Archivo a crear:** `backend-core/app/Http/Controllers/Api/PrecountController.php`

**Endpoints a implementar:**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrecountRecord;
use App\Models\PrecountVote;
use App\Models\PrecountEvidence;
use App\Models\PrecountMetadata;
use App\Models\PrecountValidation;
use App\Models\PrecountAggregate;
use App\Models\MesaCargoStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PrecountController extends Controller
{
    /**
     * GET /api/preconteo/elecciones
     * Listar elecciones disponibles
     */
    public function getElecciones()
    {
        $elecciones = [
            [
                'id' => 1,
                'year' => 2027,
                'tipo' => 'territorial',
                'fecha' => '2027-10-24',
                'nombre' => 'Elecciones Territoriales 2027'
            ]
        ];
        
        return response()->json([
            'success' => true,
            'data' => $elecciones
        ]);
    }

    /**
     * GET /api/preconteo/elecciones/{id}/cargos
     * Cargos por elección
     */
    public function getCargosByEleccion($eleccionId)
    {
        $cargos = DB::table('cargo_electorals')
            ->where('eleccion_id', $eleccionId)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $cargos
        ]);
    }

    /**
     * GET /api/preconteo/resultados
     * Resultados agregados tipo Registraduría
     */
    public function getResultados(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_position_id' => 'required|integer',
            'scope_type' => 'required|in:DEPARTAMENTO,MUNICIPIO,PUESTO,MESA',
            'scope_id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $resultados = PrecountAggregate::where('election_position_id', $request->election_position_id)
            ->where('scope_type', $request->scope_type)
            ->where('scope_id', $request->scope_id)
            ->with('candidate')
            ->orderBy('votos', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'scope' => $request->scope_type,
                'scope_id' => $request->scope_id,
                'resultados' => $resultados
            ]
        ]);
    }

    /**
     * GET /api/preconteo/progreso
     * Progreso de reporte por mesas
     */
    public function getProgreso(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_position_id' => 'required|integer',
            'municipality_id' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = MesaCargoStatus::where('cargo_id', $request->election_position_id);
        
        if ($request->municipality_id) {
            $query->whereHas('mesa.puesto.municipio', function($q) use ($request) {
                $q->where('id', $request->municipality_id);
            });
        }

        $total = $query->count();
        $reportadas = $query->whereIn('estado', ['REPORTADA', 'VALIDADA'])->count();
        $observadas = $query->where('estado', 'OBSERVADA')->count();
        $pendientes = $total - $reportadas - $observadas;

        return response()->json([
            'success' => true,
            'data' => [
                'total_mesas' => $total,
                'reportadas' => $reportadas,
                'observadas' => $observadas,
                'pendientes' => $pendientes,
                'porcentaje_avance' => $total > 0 ? round(($reportadas / $total) * 100, 2) : 0
            ]
        ]);
    }

    /**
     * POST /api/internal/preconteo/acta
     * Cargar acta de preconteo
     */
    public function storeActa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'polling_table_id' => 'required|integer|exists:mesas,id',
            'election_position_id' => 'required|integer',
            'total_sufragantes' => 'required|integer|min:0',
            'votos_nulos' => 'required|integer|min:0',
            'votos_no_marcados' => 'required|integer|min:0',
            'resultados' => 'required|array',
            'resultados.*.candidate_id' => 'required|integer',
            'resultados.*.votos' => 'required|integer|min:0',
            'observaciones' => 'nullable|string',
            'imagen_acta' => 'nullable|string', // Base64
            'gps' => 'nullable|array',
            'gps.lat' => 'nullable|numeric',
            'gps.lng' => 'nullable|numeric',
            'offline' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // 1. Determinar versión
            $version = PrecountRecord::where('polling_table_id', $request->polling_table_id)
                ->where('election_position_id', $request->election_position_id)
                ->max('version') + 1;

            // 2. Crear registro
            $record = PrecountRecord::create([
                'polling_table_id' => $request->polling_table_id,
                'election_position_id' => $request->election_position_id,
                'version' => $version,
                'total_sufragantes' => $request->total_sufragantes,
                'votos_nulos' => $request->votos_nulos,
                'votos_no_marcados' => $request->votos_no_marcados,
                'observaciones' => $request->observaciones,
                'estado' => 'CARGADA'
            ]);

            // 3. Guardar votos por candidato
            foreach ($request->resultados as $resultado) {
                PrecountVote::create([
                    'precount_record_id' => $record->id,
                    'candidate_id' => $resultado['candidate_id'],
                    'votos' => $resultado['votos']
                ]);
            }

            // 4. Guardar evidencia si existe
            if ($request->imagen_acta) {
                $hash = hash('sha256', $request->imagen_acta);
                // Aquí iría lógica para subir a S3
                PrecountEvidence::create([
                    'precount_record_id' => $record->id,
                    'imagen_url' => 's3://bucket/' . $record->id . '.jpg',
                    'hash_imagen' => $hash,
                    'legible' => true
                ]);
            }

            // 5. Guardar metadata
            PrecountMetadata::create([
                'precount_record_id' => $record->id,
                'reportado_por_usuario_id' => auth()->id(),
                'rol' => auth()->user()->rol ?? 'testigo',
                'gps_lat' => $request->gps['lat'] ?? null,
                'gps_lng' => $request->gps['lng'] ?? null,
                'dispositivo' => $request->header('User-Agent'),
                'offline' => $request->offline ?? false
            ]);

            // 6. Ejecutar validaciones automáticas
            $alertas = $this->ejecutarValidaciones($record);

            // 7. Actualizar estado mesa_cargo_status
            $estado = count($alertas) > 0 ? 'OBSERVADA' : 'REPORTADA';
            MesaCargoStatus::updateOrCreate(
                [
                    'mesa_id' => $request->polling_table_id,
                    'cargo_id' => $request->election_position_id
                ],
                [
                    'estado' => $estado,
                    'precount_record_id' => $record->id
                ]
            );

            // 8. Recalcular agregados (async en producción)
            $this->recalcularAgregados($record);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Acta registrada exitosamente',
                'data' => [
                    'record_id' => $record->id,
                    'version' => $version,
                    'estado' => $estado,
                    'alertas' => $alertas
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar acta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validaciones automáticas
     */
    private function ejecutarValidaciones(PrecountRecord $record)
    {
        $alertas = [];

        // Validación 1: Suma de votos
        $totalVotos = $record->votes->sum('votos') + $record->votos_nulos + $record->votos_no_marcados;
        
        if ($totalVotos !== $record->total_sufragantes) {
            $alerta = PrecountValidation::create([
                'precount_record_id' => $record->id,
                'tipo' => 'SUMA_INVALIDA',
                'severidad' => 'CRITICAL',
                'mensaje' => "Suma de votos ({$totalVotos}) no coincide con sufragantes ({$record->total_sufragantes})"
            ]);
            $alertas[] = $alerta;
        }

        // Validación 2: Votos superan sufragantes
        if ($record->votes->sum('votos') > $record->total_sufragantes) {
            $alerta = PrecountValidation::create([
                'precount_record_id' => $record->id,
                'tipo' => 'VOTOS_SUPERAN_SUFRAGANTES',
                'severidad' => 'CRITICAL',
                'mensaje' => 'Votos por candidatos superan total de sufragantes'
            ]);
            $alertas[] = $alerta;
        }

        // Validación 3: Mesa duplicada
        $existente = PrecountRecord::where('polling_table_id', $record->polling_table_id)
            ->where('election_position_id', $record->election_position_id)
            ->where('id', '!=', $record->id)
            ->where('estado', 'VALIDADA')
            ->first();

        if ($existente) {
            $alerta = PrecountValidation::create([
                'precount_record_id' => $record->id,
                'tipo' => 'MESA_DUPLICADA',
                'severidad' => 'WARNING',
                'mensaje' => 'Esta mesa ya tiene un acta validada (versión anterior)'
            ]);
            $alertas[] = $alerta;
        }

        return $alertas;
    }

    /**
     * Recalcular agregados
     */
    private function recalcularAgregados(PrecountRecord $record)
    {
        // Obtener jerarquía territorial
        $mesa = Mesa::with('puesto.municipio')->find($record->polling_table_id);
        
        if (!$mesa) return;

        $scopes = [
            ['type' => 'MESA', 'id' => $record->polling_table_id],
            ['type' => 'PUESTO', 'id' => $mesa->puesto_id],
            ['type' => 'MUNICIPIO', 'id' => $mesa->puesto->municipio_id],
            ['type' => 'DEPARTAMENTO', 'id' => $mesa->puesto->municipio->departamento_id],
        ];

        foreach ($scopes as $scope) {
            // Calcular totales por candidato
            $totales = PrecountVote::join('precount_records', 'precount_votes.precount_record_id', '=', 'precount_records.id')
                ->where('precount_records.estado', 'VALIDADA')
                ->where('precount_records.election_position_id', $record->election_position_id)
                ->select('precount_votes.candidate_id', DB::raw('SUM(precount_votes.votos) as total'))
                ->groupBy('precount_votes.candidate_id')
                ->get();

            $totalVotos = $totales->sum('total');

            foreach ($totales as $total) {
                $porcentaje = $totalVotos > 0 ? round(($total->total / $totalVotos) * 100, 2) : 0;
                
                PrecountAggregate::updateOrCreate(
                    [
                        'scope_type' => $scope['type'],
                        'scope_id' => $scope['id'],
                        'election_position_id' => $record->election_position_id,
                        'candidate_id' => $total->candidate_id
                    ],
                    [
                        'votos' => $total->total,
                        'porcentaje' => $porcentaje
                    ]
                );
            }
        }
    }

    /**
     * POST /api/internal/preconteo/acta/{id}/validar
     * Validar acta (coordinador)
     */
    public function validarActa(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'accion' => 'required|in:VALIDAR,OBSERVAR',
            'comentario' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $record = PrecountRecord::findOrFail($id);
        
        $nuevoEstado = $request->accion === 'VALIDAR' ? 'VALIDADA' : 'OBSERVADA';
        $record->estado = $nuevoEstado;
        $record->save();

        // Actualizar mesa_cargo_status
        MesaCargoStatus::where('precount_record_id', $id)
            ->update(['estado' => $nuevoEstado]);

        // Si se valida, recalcular agregados
        if ($request->accion === 'VALIDAR') {
            $this->recalcularAgregados($record);
        }

        return response()->json([
            'success' => true,
            'message' => 'Acta ' . ($request->accion === 'VALIDAR' ? 'validada' : 'marcada como observada'),
            'data' => [
                'record_id' => $record->id,
                'estado' => $nuevoEstado
            ]
        ]);
    }
}
```

**Checklist:**
- [ ] Crear controller completo
- [ ] Implementar todos los endpoints
- [ ] Agregar validaciones
- [ ] Testing con Postman

---

#### Tarea 1.4: Actualizar Rutas API
**Archivo a modificar:** `backend-core/routes/api.php`

**Agregar rutas:**
```php
// Rutas de Preconteo (Públicas - lectura)
Route::get('/preconteo/elecciones', [PrecountController::class, 'getElecciones']);
Route::get('/preconteo/elecciones/{id}/cargos', [PrecountController::class, 'getCargosByEleccion']);
Route::get('/preconteo/resultados', [PrecountController::class, 'getResultados']);
Route::get('/preconteo/progreso', [PrecountController::class, 'getProgreso']);

// Rutas Internas (Captura - requieren auth)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/internal/preconteo/acta', [PrecountController::class, 'storeActa']);
    Route::post('/internal/preconteo/acta/{id}/validar', [PrecountController::class, 'validarActa']);
    Route::get('/internal/preconteo/actas', [PrecountController::class, 'listarActas']);
});
```

---

### Semana 5-6: WebSockets Tiempo Real

#### Tarea 1.5: Configurar WebSockets en NestJS
**Archivos a crear/modificar:**
- `backend-diad/src/websocket/websocket.gateway.ts`
- `backend-diad/src/websocket/websocket.module.ts`

**Código WebSocket Gateway:**
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws/preconteo'
})
export class PreconteoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { scope_type: string; scope_id: number; election_position_id: number }) {
    const room = `${payload.scope_type}:${payload.scope_id}:${payload.election_position_id}`;
    client.join(room);
    console.log(`Cliente ${client.id} suscrito a ${room}`);
  }

  // Método para emitir actualizaciones
  emitirActualizacion(scope_type: string, scope_id: number, election_position_id: number, data: any) {
    const room = `${scope_type}:${scope_id}:${election_position_id}`;
    this.server.to(room).emit('RESULTADOS_ACTUALIZADOS', data);
  }

  emitirProgreso(data: any) {
    this.server.emit('PROGRESO_MESAS', data);
  }

  emitirAlerta(alerta: any) {
    this.server.emit('ALERTA', alerta);
  }
}
```

---

### Semana 7-8: Jobs y Colas

#### Tarea 1.6: Crear Jobs para Procesamiento Async
**Archivos a crear:**
- `backend-core/app/Jobs/RecalcularAgregadosJob.php`
- `backend-core/app/Jobs/ProcesarImagenActaJob.php`
- `backend-core/app/Jobs/ValidarActaJob.php`

**Estructura RecalcularAgregadosJob:**
```php
<?php

namespace App\Jobs;

use App\Models\PrecountRecord;
use App\Services\AgregadosService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecalcularAgregadosJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $record;

    public function __construct(PrecountRecord $record)
    {
        $this->record = $record;
    }

    public function handle(AgregadosService $service)
    {
        $service->recalcular($this->record);
    }
}
```

---

### Semana 9-10: Testing y Documentación API

#### Tarea 1.7: Testing de API
**Archivo a crear:** `backend-core/tests/Feature/PrecountControllerTest.php`

**Tests a implementar:**
- [ ] Test crear acta exitoso
- [ ] Test validación suma incorrecta
- [ ] Test validación votos > sufragantes
- [ ] Test obtener resultados agregados
- [ ] Test progreso de mesas
- [ ] Test validar acta por coordinador

#### Tarea 1.8: Actualizar API Documentation
**Archivo a modificar:** `backend-core/API-DOCUMENTATION.md`

**Agregar documentación endpoints preconteo:**
- [ ] Documentar GET /api/preconteo/elecciones
- [ ] Documentar GET /api/preconteo/resultados
- [ ] Documentar POST /api/internal/preconteo/acta
- [ ] Agregar ejemplos JSON
- [ ] Documentar WebSockets

---

## 🔴 FASE 2: PWA TESTIGOS (Semanas 8-14)
**Objetivo:** Aplicación móvil para captura de actas en campo  
**Prioridad:** CRÍTICA - Fuente de datos el Día D  
**Estimación:** 7 semanas

### Semana 8-9: Setup PWA Base

#### Tarea 2.1: Crear Estructura PWA
**Estructura de carpetas:**
```
pwa-testigos/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── sw.js (Service Worker)
├── src/
│   ├── components/
│   │   ├── ActaCapture/
│   │   ├── QRScanner/
│   │   ├── OfflineQueue/
│   │   └── SyncStatus/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CaptureActa.tsx
│   │   ├── VerificarMesa.tsx
│   │   └── Historial.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── storage.ts
│   │   └── sync.ts
│   ├── store/
│   │   └── index.ts (Zustand/Redux)
│   └── utils/
│       └── offline.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

#### Tarea 2.2: Configurar Vite + PWA
**Archivo:** `pwa-testigos/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Testigos Electorales',
        short_name: 'Testigos',
        description: 'App para captura de actas electorales',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.tusistema\.com\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60 // 24 horas
              }
            }
          }
        ]
      }
    })
  ]
})
```

---

### Semana 10-11: IndexedDB y Storage Offline

#### Tarea 2.3: Implementar Storage Service
**Archivo:** `pwa-testigos/src/services/storage.ts`
```typescript
import { openDB, DBSchema } from 'idb';

interface ActaDB extends DBSchema {
  actas: {
    key: number;
    value: {
      id?: number;
      polling_table_id: number;
      election_position_id: number;
      total_sufragantes: number;
      votos_nulos: number;
      votos_no_marcados: number;
      resultados: Array<{candidate_id: number; votos: number}>;
      observaciones?: string;
      imagen_acta?: string; // Base64
      gps?: {lat: number; lng: number};
      estado: 'pendiente' | 'sincronizado' | 'error';
      creado_at: Date;
      intentos_sync: number;
    };
    indexes: {
      'by-estado': string;
      'by-mesa': number;
    };
  };
  mesas_cache: {
    key: number;
    value: {
      id: number;
      numero: string;
      puesto_nombre: string;
      direccion: string;
      actualizado_at: Date;
    };
  };
}

const DB_NAME = 'TestigosDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB<ActaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store para actas pendientes
      const actasStore = db.createObjectStore('actas', {
        keyPath: 'id',
        autoIncrement: true
      });
      actasStore.createIndex('by-estado', 'estado');
      actasStore.createIndex('by-mesa', 'polling_table_id');

      // Store para cache de mesas
      db.createObjectStore('mesas_cache', {
        keyPath: 'id'
      });
    }
  });
};

export const guardarActa = async (acta: ActaDB['actas']['value']) => {
  const db = await initDB();
  return db.add('actas', {
    ...acta,
    estado: 'pendiente',
    creado_at: new Date(),
    intentos_sync: 0
  });
};

export const obtenerActasPendientes = async () => {
  const db = await initDB();
  return db.getAllFromIndex('actas', 'by-estado', 'pendiente');
};

export const marcarActaSincronizada = async (id: number) => {
  const db = await initDB();
  const acta = await db.get('actas', id);
  if (acta) {
    acta.estado = 'sincronizado';
    return db.put('actas', acta);
  }
};

export const actualizarEstadoActa = async (id: number, estado: string) => {
  const db = await initDB();
  const acta = await db.get('actas', id);
  if (acta) {
    acta.estado = estado;
    if (estado === 'error') {
      acta.intentos_sync += 1;
    }
    return db.put('actas', acta);
  }
};

export const guardarMesasCache = async (mesas: ActaDB['mesas_cache']['value'][]) => {
  const db = await initDB();
  const tx = db.transaction('mesas_cache', 'readwrite');
  for (const mesa of mesas) {
    mesa.actualizado_at = new Date();
    await tx.store.put(mesa);
  }
  await tx.done;
};

export const obtenerMesasCache = async () => {
  const db = await initDB();
  return db.getAll('mesas_cache');
};
```

---

### Semana 12-13: Sincronización y Sync Service

#### Tarea 2.4: Implementar Sync Service
**Archivo:** `pwa-testigos/src/services/sync.ts`
```typescript
import { obtenerActasPendientes, marcarActaSincronizada, actualizarEstadoActa } from './storage';
import { enviarActa } from './api';

const MAX_INTENTOS = 3;

export const sincronizarActas = async (): Promise<{
  exitosos: number;
  fallidos: number;
  pendientes: number;
}> => {
  const actasPendientes = await obtenerActasPendientes();
  
  if (actasPendientes.length === 0) {
    return { exitosos: 0, fallidos: 0, pendientes: 0 };
  }

  let exitosos = 0;
  let fallidos = 0;

  for (const acta of actasPendientes) {
    // Saltar si ya tiene muchos intentos
    if (acta.intentos_sync >= MAX_INTENTOS) {
      await actualizarEstadoActa(acta.id!, 'error');
      fallidos++;
      continue;
    }

    try {
      const resultado = await enviarActa({
        polling_table_id: acta.polling_table_id,
        election_position_id: acta.election_position_id,
        total_sufragantes: acta.total_sufragantes,
        votos_nulos: acta.votos_nulos,
        votos_no_marcados: acta.votos_no_marcados,
        resultados: acta.resultados,
        observaciones: acta.observaciones,
        imagen_acta: acta.imagen_acta,
        gps: acta.gps,
        offline: true
      });

      if (resultado.success) {
        await marcarActaSincronizada(acta.id!);
        exitosos++;
      } else {
        await actualizarEstadoActa(acta.id!, 'error');
        fallidos++;
      }
    } catch (error) {
      console.error('Error sincronizando acta:', error);
      await actualizarEstadoActa(acta.id!, 'pendiente');
      fallidos++;
    }
  }

  const pendientes = (await obtenerActasPendientes()).length;

  return { exitosos, fallidos, pendientes };
};

// Hook para sincronización automática
export const iniciarSyncAutomatico = () => {
  // Intentar sincronizar cuando hay conexión
  window.addEventListener('online', async () => {
    console.log('Conexión restaurada. Sincronizando...');
    await sincronizarActas();
  });

  // Intentar cada 5 minutos si hay conexión
  setInterval(async () => {
    if (navigator.onLine) {
      await sincronizarActas();
    }
  }, 5 * 60 * 1000);
};
```

---

### Semana 14: UI/UX y Testing PWA

#### Tarea 2.5: Crear Páginas Principales

**Página Login:**
- [ ] Formulario email/password
- [ ] Validación cliente
- [ ] Guardar token JWT
- [ ] Detectar rol (testigo/coordinador)

**Página Dashboard:**
- [ ] Mostrar mesas asignadas
- [ ] Estado de sincronización
- [ ] Contador actas pendientes
- [ ] Botón capturar nueva acta

**Página CaptureActa:**
- [ ] Selector mesa (con cache)
- [ ] Formulario datos acta
- [ ] Captura foto acta (cámara)
- [ ] Geolocalización automática
- [ ] Validaciones en tiempo real
- [ ] Guardar offline

**Componente SyncStatus:**
- [ ] Indicador conexión/sin conexión
- [ ] Contador actas pendientes
- [ ] Botón sincronizar manual
- [ ] Toast notificaciones

---

## 🔴 FASE 3: INFRAESTRUCTURA & DEPLOY (Semanas 12-16)
**Objetivo:** Configurar AWS y preparar producción  
**Prioridad:** CRÍTICA - Sin esto no hay deploy  
**Estimación:** 5 semanas

### Semana 12-13: AWS Setup

#### Tarea 3.1: Configurar VPC y Networking
**Servicios AWS a configurar:**
- [ ] Crear VPC (10.0.0.0/16)
- [ ] 3 Subnets públicas (1 por AZ)
- [ ] 3 Subnets privadas (1 por AZ)
- [ ] Internet Gateway
- [ ] NAT Gateways
- [ ] Route Tables
- [ ] Security Groups:
  - SG-Web (80, 443)
  - SG-App (8000, 3000)
  - SG-DB (5432 solo desde SG-App)
  - SG-Redis (6379 solo desde SG-App)

#### Tarea 3.2: Configurar RDS PostgreSQL
- [ ] RDS PostgreSQL 15 con PostGIS
- [ ] Instancia: db.t3.medium (dev) / db.r5.large (prod)
- [ ] Multi-AZ: Habilitado
- [ ] Storage: 100 GB gp3 (auto-scaling)
- [ ] Backup: 7 días retención
- [ ] Encryption: Habilitado
- [ ] Crear usuarios y schemas

#### Tarea 3.3: Configurar ElastiCache Redis
- [ ] Redis 7
- [ ] Instancia: cache.t3.micro (dev) / cache.r5.large (prod)
- [ ] Multi-AZ: Habilitado
- [ ] Security Group configurado

### Semana 14-15: S3 y CloudFront

#### Tarea 3.4: Configurar S3 Buckets
**Buckets a crear:**
- [ ] `campaign-actas-prod` - Imágenes de actas
  - Versionado: Habilitado
  - Encriptación: AES-256
  - Lifecycle: Glacier después 90 días
  - CORS configurado
- [ ] `campaign-frontend-prod` - Static files
- [ ] `campaign-backups` - Backups DB

#### Tarea 3.5: Configurar CloudFront
- [ ] Distribution para S3 actas
- [ ] Distribution para frontend
- [ ] HTTPS obligatorio
- [ ] Cache policies optimizadas
- [ ] Origin Access Identity

### Semana 16: CI/CD y Autodeploy

#### Tarea 3.6: GitHub Actions CI/CD
**Archivos a crear:**
- `.github/workflows/backend-deploy.yml`
- `.github/workflows/frontend-deploy.yml`
- `.github/workflows/pwa-deploy.yml`

**Pipeline Backend:**
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install dependencies
        run: composer install --no-dev --optimize-autoloader
      - name: Run tests
        run: php artisan test
      - name: Deploy to EC2
        run: |
          # Comandos SSH para deploy
```

#### Tarea 3.7: Configurar EC2 y Deploy
- [ ] Lanzar EC2 instances (t3.medium mínimo)
- [ ] Instalar PHP 8.2, Nginx, Supervisor
- [ ] Configurar Nginx con SSL (Let's Encrypt)
- [ ] Setup Supervisor para queue workers
- [ ] Configurar Laravel Horizon
- [ ] Deploy inicial y testing

---

## 🟡 FASE 4: FRONTEND & INTEGRACIÓN (Semanas 14-18)
**Objetivo:** Completar vistas administrativas  
**Prioridad:** IMPORTANTE - Mejora UX pero no bloqueante  
**Estimación:** 5 semanas

### Semana 14-15: Dashboard Día D Admin

#### Tarea 4.1: Crear Dashboard Preconteo
**Páginas a crear:**
- [ ] `frontend-web/src/pages/preconteo/Dashboard.tsx`
  - Mapa de calor resultados
  - Gráficos tiempo real
  - KPIs principales
  - Lista mesas pendientes

- [ ] `frontend-web/src/pages/preconteo/Resultados.tsx`
  - Tabla resultados por candidato
  - Filtros por territorio
  - Exportar Excel/PDF
  - Comparación histórica

- [ ] `frontend-web/src/pages/preconteo/Validacion.tsx`
  - Cola de actas pendientes
  - Preview imagen acta
  - Validar/Observar con comentario
  - Historial de validaciones

#### Tarea 4.2: WebSockets Cliente
**Archivo:** `frontend-web/src/services/websocket.ts`
```typescript
import { io } from 'socket.io-client';

const socket = io('wss://api.tusistema.com/ws/preconteo');

export const subscribeToResults = (
  scope_type: string,
  scope_id: number,
  election_position_id: number,
  callback: (data: any) => void
) => {
  socket.emit('subscribe', { scope_type, scope_id, election_position_id });
  socket.on('RESULTADOS_ACTUALIZADOS', callback);
};

export const onProgresoUpdate = (callback: (data: any) => void) => {
  socket.on('PROGRESO_MESAS', callback);
};

export const onAlerta = (callback: (data: any) => void) => {
  socket.on('ALERTA', callback);
};
```

### Semana 16-17: Gestión de Testigos

#### Tarea 4.3: CRUD Testigos
**Páginas a crear:**
- [ ] Listado testigos
- [ ] Asignar testigo a mesa
- [ ] Verificación QR credencial
- [ ] Monitoreo testigos en campo

### Semana 18: Alertas y Notificaciones

#### Tarea 4.4: Sistema de Alertas
**Componentes a crear:**
- [ ] Toast notifications tiempo real
- [ ] Panel alertas críticas
- [ ] Configuración umbrales alertas
- [ ] Notificaciones email/SMS

---

## 🔴 FASE 5: TESTING & HARDENING (Semanas 18-22)
**Objetivo:** Asegurar calidad y robustez  
**Prioridad:** CRÍTICA - Evitar fallos el Día D  
**Estimación:** 5 semanas

### Semana 18-19: Testing Completo

#### Tarea 5.1: Unit Tests
**Cobertura mínima 70%:**
- [ ] Tests modelo PrecountRecord
- [ ] Tests PrecountController
- [ ] Tests validaciones automáticas
- [ ] Tests cálculo agregados
- [ ] Tests sincronización offline

#### Tarea 5.2: Integration Tests
- [ ] Flujo completo captura acta
- [ ] Sync offline → online
- [ ] WebSockets tiempo real
- [ ] Performance API

#### Tarea 5.3: E2E Tests
**Cypress/Playwright:**
- [ ] Test login testigo
- [ ] Test capturar acta
- [ ] Test validar acta coordinador
- [ ] Test ver resultados

### Semana 20: Performance Optimization

#### Tarea 5.4: Optimizaciones
- [ ] Query optimization (EXPLAIN ANALYZE)
- [ ] Índices adicionales
- [ ] Cache Redis optimizado
- [ ] CDN configuración final
- [ ] Lazy loading imágenes

### Semana 21: Security Audit

#### Tarea 5.5: Seguridad
- [ ] Penetration testing básico
- [ ] Validar autenticación JWT
- [ ] Revisar permisos RBAC
- [ ] HTTPS everywhere
- [ ] Headers de seguridad
- [ ] Rate limiting verificado

### Semana 22: Documentación Final

#### Tarea 5.6: Documentación Operativa
- [ ] Manual de usuario testigo
- [ ] Manual coordinador
- [ ] Procedimientos emergencia
- [ ] Runbook operaciones
- [ ] Contactos soporte

---

## 🔴 FASE 6: SIMULACROS & GO-LIVE (Semanas 22-23)
**Objetivo:** Validar sistema en condiciones reales  
**Prioridad:** CRÍTICA - Última validación antes de elecciones  
**Estimación:** 2 semanas

### Semana 22: Simulacro Completo

#### Tarea 6.1: Simulacro Día D
**Escenario:**
- [ ] Preparar datos de prueba (100 mesas)
- [ ] Invitar 10 testigos voluntarios
- [ ] Ejecutar simulacro 4 horas
- [ ] Capturar actas con datos reales
- [ ] Validar por coordinadores
- [ ] Medir tiempos de respuesta
- [ ] Identificar cuellos de botella

#### Métricas a medir:
- [ ] Tiempo promedio captura acta
- [ ] Tasa de sincronización exitosa
- [ ] Latencia WebSockets
- [ ] Disponibilidad sistema
- [ ] Errores reportados

### Semana 23: Go-Live Preparación

#### Tarea 6.2: Preparación Final
- [ ] Congelar código (feature freeze)
- [ ] Deploy producción final
- [ ] Backup completo BD
- [ ] Configurar monitoreo 24/7
- [ ] Preparar plan rollback
- [ ] Capacitación final usuarios
- [ ] Entregar credenciales

#### Tarea 6.3: Checklist Día D
**Antes de elecciones:**
- [ ] Infraestructura escalada
- [ ] Testigos capacitados y con app instalada
- [ ] Coordinadores con acceso admin
- [ ] Soporte técnico on-call
- [ ] Comunicación establecida (canales emergencia)

---

## 📊 RESUMEN DE ESFUERZO

| Fase | Semanas | Horas Est. | Prioridad |
|------|---------|------------|-----------|
| **FASE 1: Backend Día D** | 10 | 360h | 🔴 CRÍTICO |
| **FASE 2: PWA Testigos** | 7 | 252h | 🔴 CRÍTICO |
| **FASE 3: Infraestructura** | 5 | 180h | 🔴 CRÍTICO |
| **FASE 4: Frontend** | 5 | 180h | 🟡 IMPORTANTE |
| **FASE 5: Testing** | 5 | 180h | 🔴 CRÍTICO |
| **FASE 6: Go-Live** | 2 | 72h | 🔴 CRÍTICO |
| **TOTAL** | **34 semanas** | **1,224h** | - |

**Nota:** El plan es para trabajo secuencial. Algunas fases pueden superponerse con equipo adicional.

---

## 🎯 HITOS CLAVE

| Fecha | Hito | Entregable |
|-------|------|------------|
| **Semana 4** | Backend Día D funcional | API preconteo operativa |
| **Semana 8** | WebSockets tiempo real | Dashboard en vivo |
| **Semana 11** | PWA instalable | App móvil funcional |
| **Semana 16** | Producción AWS | Sistema en producción |
| **Semana 18** | Frontend completo | Admin dashboard listo |
| **Semana 22** | Testing completo | 70%+ coverage |
| **Semana 23** | Sistema listo | **DÍA D** |

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Delay en desarrollo | Media | Alto | Buffer 2 semanas en plan |
| Problemas AWS | Baja | Alto | Soporte AWS Business |
| Fallo Día D | Baja | Crítico | Plan rollback + manual backup |
| Testigos no adoptan app | Media | Alto | Capacitación + soporte campo |
| Saturación servidores | Media | Alto | Auto-scaling configurado |

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

### Hoy (Semana 1, Día 1):
1. [ ] Crear migraciones base de datos preconteo
2. [ ] Crear modelos Eloquent
3. [ ] Setup proyecto PWA base
4. [ ] Revisar acceso AWS

### Esta Semana:
1. [ ] Completar todas las migraciones
2. [ ] Crear seeders de prueba
3. [ ] Testing básico modelos
4. [ ] Documentar API endpoints planificados

---

**Plan creado el:** 7 de Mayo, 2026  
**Revisión recomendada:** Semanal cada viernes  
**Ajustes:** Este plan es vivo y puede adaptarse según avance real

---

## 🔗 REFERENCIAS

- Auditoría Completa: `docs/AUDITORIA-COMPLETA-PROYECTO.md`
- Documentación Base: `MEMORIA_DE_CONTEXTO_DEL_PROYECTO.md`
- API Documentation: `backend-core/API-DOCUMENTATION.md`
- Plan 18 Meses: `docs/PLAN-DEFINITIVO-18-MESES.md`
