import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Acta } from '../entities/acta.entity';
import { ActasGateway } from '../actas.gateway';

@Processor('actas')
@Injectable()
export class ActaProcessor {
  private readonly logger = new Logger(ActaProcessor.name);

  constructor(
    @InjectRepository(Acta)
    private readonly actaRepository: Repository<Acta>,
    private readonly actasGateway: ActasGateway,
  ) {}

  @Process('process-ocr')
  async handleOcrProcessing(job: Job) {
    const { actaId, imageUrl } = job.data;
    this.logger.log(`Processing OCR for acta ${actaId}`);

    try {
      const acta = await this.actaRepository.findOne({ where: { id: actaId } });
      if (!acta) {
        throw new Error(`Acta ${actaId} not found`);
      }

      // Update status
      acta.estado = 'procesando_ocr';
      await this.actaRepository.save(acta);

      // TODO: Implement AWS Textract OCR processing
      // For now, simulate processing
      await this.simulateOcrProcessing(imageUrl);

      // OCR real todavía no está implementado (ver TODO arriba): el resultado
      // es simulado y NO debe autovalidar el acta. Solo un coordinador humano
      // puede pasar a 'validada' (ver validada_por_id/validada_at), igual que
      // en el flujo equivalente de backend-core (PrecountController::validarActa).
      acta.estado = 'pendiente';
      acta.datos_ocr = {
        confidence: 0.95,
        processed_at: new Date(),
        simulated: true,
        // Add OCR extracted data here
      };
      acta.confianza_ocr = 0.95;
      acta.updated_at = new Date();

      const updated = await this.actaRepository.save(acta);

      // Notify via WebSocket
      this.actasGateway.notifyOcrCompleted(updated);

      this.logger.log(`OCR processing completed for acta ${actaId}`);
      return updated;
    } catch (error) {
      this.logger.error(`OCR processing failed for acta ${actaId}`, error);
      throw error;
    }
  }

  private async simulateOcrProcessing(imageUrl: string): Promise<void> {
    this.logger.debug(`Simulating OCR processing for ${imageUrl}`);
    // Simulate processing time
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
