import { useEffect, useState } from 'react';
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
  IonBadge,
  IonBackButton,
  IonButtons,
  IonList,
  IonToast,
  IonAlert,
  IonLoading,
} from '@ionic/react';
import {
  cloudUpload,
  trash,
  warning,
  checkmarkCircle,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { dbService } from '../services/DatabaseService';
import { syncService } from '../services/SyncService';
import useAuthStore from '../stores/authStore';

/**
 * Página: Pendientes
 * 
 * Lista de actas pendientes de sincronizar con el servidor.
 */

const Pendientes: React.FC = () => {
  const history = useHistory();
  const { isOffline } = useAuthStore();
  const [actas, setActas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [actaToDelete, setActaToDelete] = useState<number | null>(null);

  useEffect(() => {
    cargarActas();
  }, []);

  const cargarActas = async () => {
    const pendientes = await dbService.obtenerActasPendientes();
    setActas(pendientes.filter((a) => a.estado !== 'ENVIADO'));
  };

  const sincronizarActa = async (id: number) => {
    if (isOffline) {
      setToastMessage('No hay conexión a internet');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      // Antes esto solo simulaba el envío con un setTimeout y marcaba el
      // acta como 'ENVIADO' sin transmitir nada al servidor -el testigo veía
      // "sincronizada exitosamente" pero el acta nunca salía del dispositivo.
      await syncService.sincronizarActa(id);
      setToastMessage('Acta sincronizada exitosamente');
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error?.message || 'Error al sincronizar el acta');
      setShowToast(true);
    } finally {
      await cargarActas();
      setIsLoading(false);
    }
  };

  const sincronizarTodas = async () => {
    if (isOffline) {
      setToastMessage('No hay conexión a internet');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const resultado = await syncService.sincronizarTodo();
      setToastMessage(resultado.message);
      setShowToast(true);
    } finally {
      await cargarActas();
      setIsLoading(false);
    }
  };

  const eliminarActa = async () => {
    if (actaToDelete) {
      await dbService.eliminarActaPendiente(actaToDelete);
      setToastMessage('Acta eliminada');
      setShowToast(true);
      cargarActas();
    }
    setShowDeleteAlert(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'warning';
      case 'ENVIANDO':
        return 'primary';
      case 'ENVIADO':
        return 'success';
      case 'ERROR':
        return 'danger';
      default:
        return 'medium';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ENVIANDO':
        return 'Enviando...';
      case 'ENVIADO':
        return 'Enviado';
      case 'ERROR':
        return 'Error';
      default:
        return estado;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Actas Pendientes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {isOffline && (
          <div className="bg-orange-100 text-orange-800 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm font-medium text-center">
              <IonIcon icon={warning} className="mr-2" />
              Está en modo offline. Las actas se sincronizarán cuando recupere conexión.
            </p>
          </div>
        )}

        {actas.length === 0 ? (
          <div className="text-center py-12">
            <IonIcon
              icon={checkmarkCircle}
              className="text-6xl text-green-500 mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Todo sincronizado!
            </h2>
            <p className="text-gray-600">
              No hay actas pendientes de envío
            </p>
            <IonButton
              className="mt-6"
              onClick={() => history.push('/acta/nueva')}
            >
              Registrar Nueva Acta
            </IonButton>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {actas.length} acta{actas.length !== 1 ? 's' : ''} pendiente
                {actas.length !== 1 ? 's' : ''}
              </h2>
              {!isOffline && (
                <IonButton
                  size="small"
                  fill="outline"
                  onClick={sincronizarTodas}
                  disabled={isLoading}
                >
                  <IonIcon icon={cloudUpload} slot="start" />
                  Sincronizar Todo
                </IonButton>
              )}
            </div>

            <IonList>
              {actas.map((acta) => (
                <IonCard key={acta.id} className="mb-3">
                  <IonCardContent>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Mesa #{acta.mesaId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(acta.creadoEn).toLocaleString()}
                        </p>
                      </div>
                      <IonBadge color={getEstadoColor(acta.estado)}>
                        {getEstadoLabel(acta.estado)}
                      </IonBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Votantes:</span>{' '}
                        <span className="font-medium">{acta.votantes}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Boletas:</span>{' '}
                        <span className="font-medium">
                          {acta.boletasEntregadas}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Evidencias:</span>{' '}
                        <span className="font-medium">
                          {acta.evidencias?.length || 0} foto(s)
                        </span>
                      </div>
                      {acta.intentos > 0 && (
                        <div>
                          <span className="text-gray-500">Intentos:</span>{' '}
                          <span className="font-medium">{acta.intentos}</span>
                        </div>
                      )}
                    </div>

                    {acta.error && (
                      <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">
                        Error: {acta.error}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {acta.estado !== 'ENVIANDO' && (
                        <IonButton
                          size="small"
                          expand="block"
                          onClick={() => sincronizarActa(acta.id)}
                          disabled={isOffline || isLoading}
                        >
                          <IonIcon icon={cloudUpload} slot="start" />
                          Enviar
                        </IonButton>
                      )}
                      <IonButton
                        size="small"
                        fill="outline"
                        color="danger"
                        onClick={() => {
                          setActaToDelete(acta.id);
                          setShowDeleteAlert(true);
                        }}
                      >
                        <IonIcon icon={trash} />
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          </>
        )}

        {/* Alerta eliminar */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Eliminar Acta"
          message="¿Está seguro que desea eliminar esta acta? Esta acción no se puede deshacer."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: eliminarActa,
            },
          ]}
        />

        {/* Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />

        {/* Loading */}
        <IonLoading isOpen={isLoading} message="Sincronizando..." />
      </IonContent>
    </IonPage>
  );
};

export default Pendientes;
