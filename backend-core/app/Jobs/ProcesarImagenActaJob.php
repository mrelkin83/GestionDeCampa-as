<?php

namespace App\Jobs;

use App\Models\PrecountEvidence;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Job: ProcesarImagenActaJob
 * 
 * Procesa la imagen de un acta:
 * 1. Decodifica base64
 * 2. Sube a almacenamiento (S3 o local)
 * 3. Genera thumbnail
 * 4. Actualiza registro con URL
 * 
 * Cola: 'imagenes'
 */
class ProcesarImagenActaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60];
    public $timeout = 300;

    private int $evidenceId;
    private string $base64Image;

    /**
     * Constructor
     * 
     * @param int $evidenceId ID del registro PrecountEvidence
     * @param string $base64Image Imagen en formato base64
     */
    public function __construct(int $evidenceId, string $base64Image)
    {
        $this->evidenceId = $evidenceId;
        $this->base64Image = $base64Image;
        $this->onQueue('imagenes');
    }

    /**
     * Ejecutar el job
     */
    public function handle(): void
    {
        $startTime = microtime(true);
        
        Log::info('🖼️  Iniciando ProcesarImagenActaJob', [
            'evidence_id' => $this->evidenceId,
            'attempt' => $this->attempts()
        ]);

        try {
            // 1. Decodificar base64
            $imageData = $this->decodeBase64($this->base64Image);
            
            if (!$imageData) {
                throw new \Exception('No se pudo decodificar la imagen base64');
            }

            // 2. Validar que sea una imagen
            if (!$this->validarImagen($imageData)) {
                throw new \Exception('El archivo no es una imagen válida');
            }

            // 3. Generar nombre único
            $filename = $this->generarNombreArchivo();
            $path = 'actas/' . $filename;

            // 4. Subir a storage
            Storage::disk('public')->put($path, $imageData);

            // 5. Generar thumbnail (opcional)
            $thumbnailPath = $this->generarThumbnail($imageData, $filename);

            // 6. Actualizar registro
            $evidence = PrecountEvidence::find($this->evidenceId);
            if ($evidence) {
                $evidence->update([
                    'imagen_url' => Storage::disk('public')->url($path),
                    'thumbnail_url' => $thumbnailPath ? Storage::disk('public')->url($thumbnailPath) : null,
                    'tamanio_kb' => round(strlen($imageData) / 1024, 2),
                    'procesado' => true,
                    'procesado_at' => now()
                ]);
            }

            $executionTime = round((microtime(true) - $startTime) * 1000, 2);

            Log::info('✅ Imagen procesada exitosamente', [
                'evidence_id' => $this->evidenceId,
                'path' => $path,
                'tamanio_kb' => round(strlen($imageData) / 1024, 2),
                'execution_time_ms' => $executionTime,
                'attempt' => $this->attempts()
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error en ProcesarImagenActaJob', [
                'evidence_id' => $this->evidenceId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'attempt' => $this->attempts()
            ]);

            // Marcar como fallido en la BD
            $this->marcarError($e->getMessage());

            throw $e;
        }
    }

    /**
     * Manejar fallo del job
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('💥 ProcesarImagenActaJob falló permanentemente', [
            'evidence_id' => $this->evidenceId,
            'error' => $exception->getMessage()
        ]);

        $this->marcarError($exception->getMessage());
    }

    /**
     * Decodificar imagen base64
     */
    private function decodeBase64(string $base64): ?string
    {
        // Remover prefijo si existe (ej: data:image/jpeg;base64,)
        if (strpos($base64, ',') !== false) {
            $base64 = explode(',', $base64)[1];
        }

        $decoded = base64_decode($base64, true);
        
        return $decoded !== false ? $decoded : null;
    }

    /**
     * Validar que sea una imagen
     */
    private function validarImagen(string $data): bool
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_buffer($finfo, $data);
        finfo_close($finfo);

        $tiposPermitidos = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];

        return in_array($mimeType, $tiposPermitidos);
    }

    /**
     * Generar nombre único para el archivo
     */
    private function generarNombreArchivo(): string
    {
        $uuid = Str::uuid()->toString();
        $timestamp = now()->format('Ymd_His');
        
        return "{$timestamp}_{$uuid}.jpg";
    }

    /**
     * Generar thumbnail de la imagen
     */
    private function generarThumbnail(string $imageData, string $filename): ?string
    {
        try {
            // Si tienes extensión GD o Imagick instalada
            if (extension_loaded('gd')) {
                $imagen = imagecreatefromstring($imageData);
                
                if ($imagen) {
                    // Redimensionar a 300px de ancho (manteniendo proporción)
                    $anchoOriginal = imagesx($imagen);
                    $altoOriginal = imagesy($imagen);
                    $nuevoAncho = 300;
                    $nuevoAlto = ($altoOriginal / $anchoOriginal) * $nuevoAncho;
                    
                    $thumbnail = imagecreatetruecolor($nuevoAncho, $nuevoAlto);
                    imagecopyresampled(
                        $thumbnail, $imagen,
                        0, 0, 0, 0,
                        $nuevoAncho, $nuevoAlto,
                        $anchoOriginal, $altoOriginal
                    );
                    
                    // Guardar thumbnail
                    ob_start();
                    imagejpeg($thumbnail, null, 80);
                    $thumbnailData = ob_get_clean();
                    
                    $thumbnailPath = 'actas/thumbnails/' . $filename;
                    Storage::disk('public')->put($thumbnailPath, $thumbnailData);
                    
                    imagedestroy($imagen);
                    imagedestroy($thumbnail);
                    
                    return $thumbnailPath;
                }
            }
            
            return null;
            
        } catch (\Exception $e) {
            Log::warning('⚠️  Error generando thumbnail', [
                'evidence_id' => $this->evidenceId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Marcar error en el registro
     */
    private function marcarError(string $error): void
    {
        try {
            $evidence = PrecountEvidence::find($this->evidenceId);
            if ($evidence) {
                $evidence->update([
                    'error_procesamiento' => $error,
                    'procesado' => false
                ]);
            }
        } catch (\Exception $e) {
            Log::error('No se pudo marcar error en evidence', [
                'evidence_id' => $this->evidenceId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
