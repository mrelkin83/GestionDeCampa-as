import { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonBackButton,
  IonButtons,
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonToast,
  IonLoading,
} from '@ionic/react';
import {
  save,
  camera,
  flag,
  location,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import useMultiEleccion from '../hooks/useMultiEleccion';
import { dbService } from '../services/DatabaseService';

/**
 * Página: FormularioMultiCargo
 * 
 * Permite reportar múltiples cargos en la misma mesa
 * Ideal para días de elecciones múltiples (Legislativas + Territoriales)
 */

interface CargoFormData {
  cargoId: number;
  cargoNombre: string;
  eleccionNombre: string;
  votos: Record<number, number>; // candidatoId -> votos
  votantes: number;
  votosNulos: number;
  votosNoMarcados: number;
  boletas: number;
  observaciones: string;
  evidencias: string[];
}

const FormularioMultiCargo: React.FC = () => {
  const history = useHistory();
  const { elecciones, cargos, candidatos, loading, cargarCandidatos } = useMultiEleccion();

  const [mesaId, setMesaId] = useState('');
  const [cargosSeleccionados, setCargosSeleccionados] = useState<number[]>([]);
  const [formularios, setFormularios] = useState<Record<number, CargoFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Seleccionar un cargo para reportar
  const seleccionarCargo = async (cargoId: number) => {
    if (cargosSeleccionados.includes(cargoId)) {
      // Deseleccionar
      setCargosSeleccionados(prev => prev.filter(id => id !== cargoId));
      setFormularios(prev => {
        const nuevo = { ...prev };
        delete nuevo[cargoId];
        return nuevo;
      });
    } else {
      // Seleccionar
      await cargarCandidatos(cargoId);
      setCargosSeleccionados(prev => [...prev, cargoId]);
      
      const cargo = cargos.find(c => c.id === cargoId);
      if (cargo) {
        setFormularios(prev => ({
          ...prev,
          [cargoId]: {
            cargoId,
            cargoNombre: cargo.nombre,
            eleccionNombre: elecciones.find(e => e.id === cargo.electionId)?.nombre || '',
            votos: {},
            votantes: 0,
            votosNulos: 0,
            votosNoMarcados: 0,
            boletas: 0,
            observaciones: '',
            evidencias: [],
          },
        }));
      }
    }
  };

  // Actualizar votos de un candidato
  const actualizarVotos = (cargoId: number, candidatoId: number, votos: number) => {
    setFormularios(prev => ({
      ...prev,
      [cargoId]: {
        ...prev[cargoId],
        votos: {
          ...prev[cargoId].votos,
          [candidatoId]: votos,
        },
      },
    }));
  };

  // Calcular total de votos por cargo
  const calcularTotal = (cargoId: number): number => {
    const form = formularios[cargoId];
    if (!form) return 0;
    return Object.values(form.votos).reduce((sum, v) => sum + (v || 0), 0);
  };

  // Tomar foto para un cargo específico
  const tomarFoto = async (cargoId: number) => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      const foto = image.base64String;
      if (foto) {
        setFormularios(prev => ({
          ...prev,
          [cargoId]: {
            ...prev[cargoId],
            evidencias: [...prev[cargoId].evidencias, foto],
          },
        }));
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      setToastMessage('Error al tomar foto');
      setShowToast(true);
    }
  };

  // Guardar todos los actas
  const guardarTodos = async () => {
    if (!mesaId) {
      setToastMessage('Ingrese el número de mesa');
      setShowToast(true);
      return;
    }

    if (cargosSeleccionados.length === 0) {
      setToastMessage('Seleccione al menos un cargo');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const localIdBase = uuidv4();

      for (const cargoId of cargosSeleccionados) {
        const form = formularios[cargoId];
        const cargo = cargos.find(c => c.id === cargoId);
        
        if (!form || !cargo) continue;

        // Preparar votos
        const votosArray = Object.entries(form.votos).map(([candidateId, votos]) => ({
          candidateId: parseInt(candidateId),
          votos: votos || 0,
        }));

        // Agregar votos en blanco si no están
        if (!votosArray.find(v => v.candidateId === 0)) {
          votosArray.push({ candidateId: 0, votos: 0 });
        }

        // Guardar acta
        await dbService.guardarActaPendiente({
          localId: `${localIdBase}_${cargoId}`,
          electionId: cargo.electionId,
          cargoId: cargo.id,
          mesaId: parseInt(mesaId),
          votos: votosArray,
          votantes: form.votantes,
          votosNulos: form.votosNulos,
          votosNoMarcados: form.votosNoMarcados,
          boletasEntregadas: form.boletas,
          horaCierre: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          observaciones: form.observaciones,
          evidencias: form.evidencias,
          estado: 'PENDIENTE',
          intentos: 0,
          creadoEn: Date.now(),
          actualizadoEn: Date.now(),
        });
      }

      setToastMessage(`${cargosSeleccionados.length} actas guardadas exitosamente`);
      setShowToast(true);

      setTimeout(() => {
        history.replace('/home');
      }, 1500);
    } catch (error) {
      console.error('Error guardando actas:', error);
      setToastMessage('Error al guardar los actas');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="flex items-center justify-center h-full">
            <p>Cargando elecciones...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Agrupar elecciones por tipo
  const eleccionesLegislativas = elecciones.filter(e => e.tipo === 'legislativa');
  const eleccionesTerritoriales = elecciones.filter(e => e.tipo === 'territorial');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Reportar Múltiples Cargos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Info */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            Seleccione todos los cargos que correspondan a esta mesa.
            Puede reportar múltiples cargos en una sola sesión.
          </p>
        </div>

        {/* Mesa */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Información de la Mesa</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Número de Mesa *</IonLabel>
              <IonInput
                type="number"
                value={mesaId}
                onIonChange={(e) => setMesaId(e.detail.value || '')}
                placeholder="Ej: 42"
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Elecciones Legislativas */}
        {eleccionesLegislativas.length > 0 && (
          <IonCard className="mt-4">
            <IonCardHeader>
              <IonCardTitle className="flex items-center">
                <IonIcon icon={flag} className="mr-2" />
                Elecciones Legislativas
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {eleccionesLegislativas.map(eleccion => (
                <div key={eleccion.id} className="mb-4">
                  <h3 className="font-semibold mb-2">{eleccion.nombre}</h3>
                  <div className="space-y-2">
                    {cargos
                      .filter(c => c.electionId === eleccion.id)
                      .map(cargo => (
                        <IonItem key={cargo.id} lines="none">
                          <IonLabel>
                            <h4>{cargo.nombre}</h4>
                            <p className="text-sm text-gray-500">
                              {cargo.nivel}
                            </p>
                          </IonLabel>
                          <IonButton
                            slot="end"
                            fill={cargosSeleccionados.includes(cargo.id) ? 'solid' : 'outline'}
                            color={cargosSeleccionados.includes(cargo.id) ? 'success' : 'primary'}
                            onClick={() => seleccionarCargo(cargo.id)}
                          >
                            {cargosSeleccionados.includes(cargo.id) ? 'Seleccionado' : 'Seleccionar'}
                          </IonButton>
                        </IonItem>
                      ))}
                  </div>
                </div>
              ))}
            </IonCardContent>
          </IonCard>
        )}

        {/* Elecciones Territoriales */}
        {eleccionesTerritoriales.length > 0 && (
          <IonCard className="mt-4">
            <IonCardHeader>
              <IonCardTitle className="flex items-center">
                <IonIcon icon={location} className="mr-2" />
                Elecciones Territoriales
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {eleccionesTerritoriales.map(eleccion => (
                <div key={eleccion.id} className="mb-4">
                  <h3 className="font-semibold mb-2">{eleccion.nombre}</h3>
                  <div className="space-y-2">
                    {cargos
                      .filter(c => c.electionId === eleccion.id)
                      .map(cargo => (
                        <IonItem key={cargo.id} lines="none">
                          <IonLabel>
                            <h4>{cargo.nombre}</h4>
                            <p className="text-sm text-gray-500">
                              Nivel: {cargo.nivel}
                            </p>
                          </IonLabel>
                          <IonButton
                            slot="end"
                            fill={cargosSeleccionados.includes(cargo.id) ? 'solid' : 'outline'}
                            color={cargosSeleccionados.includes(cargo.id) ? 'success' : 'primary'}
                            onClick={() => seleccionarCargo(cargo.id)}
                          >
                            {cargosSeleccionados.includes(cargo.id) ? 'Seleccionado' : 'Seleccionar'}
                          </IonButton>
                        </IonItem>
                      ))}
                  </div>
                </div>
              ))}
            </IonCardContent>
          </IonCard>
        )}

        {/* Formularios por Cargo Seleccionado */}
        {cargosSeleccionados.length > 0 && (
          <IonCard className="mt-4">
            <IonCardHeader>
              <IonCardTitle>
                Formularios ({cargosSeleccionados.length} cargos)
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonAccordionGroup>
                {cargosSeleccionados.map((cargoId, index) => {
                  const cargo = cargos.find(c => c.id === cargoId);
                  const form = formularios[cargoId];
                  const cands = candidatos[cargoId] || [];
                  const totalVotos = calcularTotal(cargoId);

                  return (
                    <IonAccordion key={cargoId} value={`cargo-${cargoId}`}>
                      <IonItem slot="header">
                        <IonLabel>
                          <h4>{index + 1}. {cargo?.nombre}</h4>
                          <p className="text-sm">
                            Total votos: {totalVotos}
                            {form?.evidencias.length > 0 && ` • ${form.evidencias.length} foto(s)`}
                          </p>
                        </IonLabel>
                        <IonBadge color={totalVotos > 0 ? 'success' : 'warning'} slot="end">
                          {totalVotos > 0 ? 'Listo' : 'Pendiente'}
                        </IonBadge>
                      </IonItem>

                      <div slot="content" className="ion-padding">
                        {/* Votantes y Boletas */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <IonItem>
                            <IonLabel position="stacked">Votantes</IonLabel>
                            <IonInput
                              type="number"
                              value={form?.votantes}
                              onIonChange={(e) =>
                                setFormularios(prev => ({
                                  ...prev,
                                  [cargoId]: { ...prev[cargoId], votantes: parseInt(e.detail.value || '0') },
                                }))
                              }
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Boletas</IonLabel>
                            <IonInput
                              type="number"
                              value={form?.boletas}
                              onIonChange={(e) =>
                                setFormularios(prev => ({
                                  ...prev,
                                  [cargoId]: { ...prev[cargoId], boletas: parseInt(e.detail.value || '0') },
                                }))
                              }
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Votos Nulos</IonLabel>
                            <IonInput
                              type="number"
                              value={form?.votosNulos}
                              onIonChange={(e) =>
                                setFormularios(prev => ({
                                  ...prev,
                                  [cargoId]: { ...prev[cargoId], votosNulos: parseInt(e.detail.value || '0') },
                                }))
                              }
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Votos No Marcados</IonLabel>
                            <IonInput
                              type="number"
                              value={form?.votosNoMarcados}
                              onIonChange={(e) =>
                                setFormularios(prev => ({
                                  ...prev,
                                  [cargoId]: { ...prev[cargoId], votosNoMarcados: parseInt(e.detail.value || '0') },
                                }))
                              }
                            />
                          </IonItem>
                        </div>

                        {/* Candidatos */}
                        <h5 className="font-semibold mb-2">Resultados:</h5>
                        {cands.map(candidato => (
                          <IonItem key={candidato.id}>
                            <IonLabel>
                              <h6>{candidato.nombre}</h6>
                              <p className="text-sm">{candidato.partido}</p>
                            </IonLabel>
                            <IonInput
                              slot="end"
                              type="number"
                              placeholder="0"
                              value={form?.votos[candidato.id] || ''}
                              onIonChange={(e) =>
                                actualizarVotos(cargoId, candidato.id, parseInt(e.detail.value || '0'))
                              }
                              style={{ textAlign: 'right', maxWidth: '100px' }}
                            />
                          </IonItem>
                        ))}

                        {/* Total */}
                        <div className="mt-4 p-3 bg-gray-100 rounded">
                          <div className="flex justify-between">
                            <span className="font-semibold">Total votos:</span>
                            <span className={`font-bold ${
                              totalVotos !== form?.votantes ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {totalVotos}
                            </span>
                          </div>
                        </div>

                        {/* Evidencias */}
                        <div className="mt-4">
                          <h5 className="font-semibold mb-2">Evidencias:</h5>
                          {form?.evidencias.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              {form.evidencias.map((foto, idx) => (
                                <img
                                  key={idx}
                                  src={`data:image/jpeg;base64,${foto}`}
                                  alt={`Evidencia ${idx + 1}`}
                                  className="w-full h-20 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}
                          <IonButton
                            expand="block"
                            fill="outline"
                            onClick={() => tomarFoto(cargoId)}
                            disabled={form?.evidencias.length >= 3}
                          >
                            <IonIcon icon={camera} slot="start" />
                            {form?.evidencias.length === 0
                              ? 'Tomar Foto'
                              : `Otra foto (${form?.evidencias.length}/3)`}
                          </IonButton>
                        </div>

                        {/* Observaciones */}
                        <IonItem className="mt-4">
                          <IonLabel position="stacked">Observaciones</IonLabel>
                          <IonInput
                            value={form?.observaciones}
                            onIonChange={(e) =>
                              setFormularios(prev => ({
                                ...prev,
                                [cargoId]: { ...prev[cargoId], observaciones: e.detail.value || '' },
                              }))
                            }
                            placeholder="Observaciones específicas para este cargo..."
                          />
                        </IonItem>
                      </div>
                    </IonAccordion>
                  );
                })}
              </IonAccordionGroup>
            </IonCardContent>
          </IonCard>
        )}

        {/* Botón Guardar */}
        {cargosSeleccionados.length > 0 && (
          <div className="mt-6 mb-8">
            <IonButton
              expand="block"
              size="large"
              onClick={guardarTodos}
              disabled={isLoading}
            >
              <IonIcon icon={save} slot="start" />
              {isLoading
                ? 'Guardando...'
                : `Guardar ${cargosSeleccionados.length} Actas`}
            </IonButton>
          </div>
        )}

        {/* Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />

        {/* Loading */}
        <IonLoading isOpen={isLoading} message="Guardando actas..." />
      </IonContent>
    </IonPage>
  );
};

export default FormularioMultiCargo;
