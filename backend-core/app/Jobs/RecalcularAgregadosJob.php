<?php

namespace App\Jobs;

use App\Models\PrecountRecord;
use App\Services\AgregadosService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * Job: RecalcularAgregadosJob
 * 
 * Recalcula los resultados agregados cuando se valida un acta.
 * Este job se ejecuta en segundo plano para no bloquear la respuesta HTTP.
 * 
 * Frecuencia: Se dispara cada vez que un coordinador valida un acta.
 */
class RecalcularAgregadosJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Número de intentos antes de marcar como fallido
     */
    public $tries = 3;

    /**
     * Segundos de espera entre reintentos
     */
    public $backoff = [10, 30, 60]; // 10s, 30s, 60s

    /**
     * Timeout en segundos
     */
    public $timeout = 120;

    /**
     * El acta que disparó el recálculo
     */
    public PrecountRecord $record;

    /**
     * Constructor
     */
    public function __construct(PrecountRecord $record)
    {
        $this->record = $record;
        $this->onQueue('agregados');
    }

    /**
     * Ejecutar el job
     */
    public function handle(AgregadosService $agregadosService): void
    {
        $startTime = microtime(true);
        
        Log::info('🔄 Iniciando RecalcularAgregadosJob', [
            'record_id' => $this->record->id,
            'mesa_id' => $this->record->polling_table_id,
            'cargo_id' => $this->record->election_position_id,
            'attempt' => $this->attempts()
        ]);

        try {
            // Recalcular agregados
            $agregadosService->recalcular($this->record);

            // Calcular tiempo de ejecución
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);

            Log::info('✅ Agregados recalculados exitosamente', [
                'record_id' => $this->record->id,
                'execution_time_ms' => $executionTime,
                'attempt' => $this->attempts()
            ]);

            // Invalidar cache de resultados
            $this->invalidarCache($agregadosService);

            // Emitir evento WebSocket (si está disponible)
            $this->emitirActualizacionWebSocket();

        } catch (\Exception $e) {
            Log::error('❌ Error en RecalcularAgregadosJob', [
                'record_id' => $this->record->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'attempt' => $this->attempts()
            ]);

            throw $e; // Re-lanzar para que el job se reintente
        }
    }

    /**
     * Manejar fallo del job
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('💥 RecalcularAgregadosJob falló permanentemente', [
            'record_id' => $this->record->id,
            'error' => $exception->getMessage(),
            'total_attempts' => $this->attempts()
        ]);

        // Notificar a administradores (opcional)
        // Notification::send($admins, new JobFailedNotification(...));
    }

    /**
     * Invalidar cache de resultados
     *
     * Usa AgregadosService::invalidarCache(), que pasa por el facade Cache
     * (respeta el prefijo "electoral" y la conexión redis "cache"). Un
     * Redis::del() directo con la clave sin prefijo apunta a una conexión/
     * base de datos distinta a la que usa Cache::put(), y nunca borra nada.
     */
    private function invalidarCache(AgregadosService $agregadosService): void
    {
        try {
            $jerarquia = $this->obtenerJerarquia();
            $agregadosService->invalidarCacheJerarquico($jerarquia, $this->record->election_position_id);
        } catch (\Exception $e) {
            Log::warning('⚠️  Error invalidando cache', [
                'record_id' => $this->record->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Emitir actualización vía WebSocket
     */
    private function emitirActualizacionWebSocket(): void
    {
        try {
            // Publicar en Redis para que NestJS lo reciba
            $payload = [
                'event' => 'RESULTADOS_ACTUALIZADOS',
                'record_id' => $this->record->id,
                'scope_type' => 'MESA',
                'scope_id' => $this->record->polling_table_id,
                'election_position_id' => $this->record->election_position_id,
                'timestamp' => now()->toIso8601String()
            ];

            // Publicar en canal de Redis
            Redis::publish('preconteo:actualizaciones', json_encode($payload));

            Log::debug('📡 Evento WebSocket publicado en Redis');

        } catch (\Exception $e) {
            Log::warning('⚠️  Error emitiendo evento WebSocket', [
                'record_id' => $this->record->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener jerarquía territorial del acta
     */
    private function obtenerJerarquia(): array
    {
        $record = PrecountRecord::with(['pollingTable.puestoVotacion.municipio'])
            ->find($this->record->id);

        if (!$record || !$record->pollingTable || !$record->pollingTable->puestoVotacion) {
            return [];
        }

        return [
            'mesa_id' => $record->polling_table_id,
            'puesto_id' => $record->pollingTable->puesto_votacion_id,
            'municipio_id' => $record->pollingTable->puestoVotacion->municipio_id ?? null,
            'departamento_id' => $record->pollingTable->puestoVotacion->municipio->departamento_id ?? null,
        ];
    }
}
