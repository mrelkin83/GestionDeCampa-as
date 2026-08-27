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
  IonFab,
  IonFabButton,
  IonBadge,
  IonAlert,
  IonToast,
} from '@ionic/react';
import {
  add,
  documentText,
  cloudUpload,
  person,
  wifi,
  wifiOutline,
  warning,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../stores/authStore';
import { dbService } from '../services/DatabaseService';
import { syncService } from '../services/SyncService';

/**
 * Página: Home
 * 
 * Pantalla principal del PWA para testigos.
 * Muestra opciones de navegación y estado de sincronización.
 */

const Home: React.FC = () => {
  const history = useHistory();
  const { user, isOffline, logout } = useAuthStore();
  const [stats, setStats] = useState({
    actasPendientes: 0,
    actasEnviadas: 0,
    evidencias: 0,
  });
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    const estadisticas = await dbService.obtenerEstadisticas();
    setStats(estadisticas);
  };

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  const sincronizar = async () => {
    if (isOffline) {
      setToastMessage('No hay conexión a internet');
      setShowToast(true);
      return;
    }

    setToastMessage('Sincronizando...');
    setShowToast(true);

    // Antes esto solo simulaba con un setTimeout y nunca llamaba al
    // servidor -el testigo veía "Sincronización completada" pero las
    // actas nunca salían del dispositivo.
    try {
      const resultado = await syncService.sincronizarTodo();
      setToastMessage(resultado.message);
      setShowToast(true);
    } finally {
      cargarEstadisticas();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Testigos Electorales</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            color="light"
            onClick={() => setShowLogoutAlert(true)}
          >
            <IonIcon icon={person} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Saludo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {user?.nombre?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            {isOffline ? 'Trabajando en modo offline' : 'Conectado al servidor'}
          </p>
        </div>

        {/* Estado de conexión */}
        <IonCard className={`mb-4 ${isOffline ? 'border-l-4 border-orange-500' : 'border-l-4 border-green-500'}`}>
          <IonCardContent className="flex items-center justify-between">
            <div className="flex items-center">
              <IonIcon
                icon={isOffline ? wifiOutline : wifi}
                color={isOffline ? 'warning' : 'success'}
                className="text-2xl mr-3"
              />
              <div>
                <h3 className="font-semibold">
                  {isOffline ? 'Modo Offline' : 'Conectado'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isOffline
                    ? `${stats.actasPendientes} actas pendientes de sincronizar`
                    : 'Listo para enviar datos'}
                </p>
              </div>
            </div>
            {!isOffline && stats.actasPendientes > 0 && (
              <IonButton size="small" onClick={sincronizar}>
                <IonIcon icon={cloudUpload} slot="start" />
                Sincronizar
              </IonButton>
            )}
          </IonCardContent>
        </IonCard>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <IonCard className="text-center">
            <IonCardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.actasPendientes}
              </div>
              <p className="text-xs text-gray-600 mt-1">Pendientes</p>
            </IonCardContent>
          </IonCard>

          <IonCard className="text-center">
            <IonCardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.actasEnviadas}
              </div>
              <p className="text-xs text-gray-600 mt-1">Enviadas</p>
            </IonCardContent>
          </IonCard>

          <IonCard className="text-center">
            <IonCardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.evidencias}
              </div>
              <p className="text-xs text-gray-600 mt-1">Evidencias</p>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Acciones principales */}
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Acciones</h2>

        <IonCard
          button
          onClick={() => history.push('/acta/nueva')}
          className="mb-3 hover:bg-gray-50"
        >
          <IonCardContent className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <IonIcon icon={documentText} color="primary" className="text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Registrar Acta</h3>
              <p className="text-sm text-gray-600">
                Digitar resultados de una mesa
              </p>
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard
          button
          onClick={() => history.push('/pendientes')}
          className="mb-3 hover:bg-gray-50"
        >
          <IonCardContent className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
              <IonIcon icon={warning} color="warning" className="text-xl" />
              {stats.actasPendientes > 0 && (
                <IonBadge color="danger" className="absolute -top-1 -right-1">
                  {stats.actasPendientes}
                </IonBadge>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Pendientes</h3>
              <p className="text-sm text-gray-600">
                Ver actas pendientes de envío
              </p>
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard
          button
          onClick={() => history.push('/perfil')}
          className="mb-3 hover:bg-gray-50"
        >
          <IonCardContent className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <IonIcon icon={person} color="tertiary" className="text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
              <p className="text-sm text-gray-600">
                Configuración y estadísticas
              </p>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Instrucciones */}
        <IonCard className="mt-6 bg-blue-50">
          <IonCardHeader>
            <IonCardTitle className="text-base">¿Cómo funciona?</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>Registre el acta de su mesa asignada</li>
              <li>Tome fotos como evidencia</li>
              <li>Los datos se guardan en el dispositivo</li>
              <li>Se sincronizan automáticamente cuando hay conexión</li>
            </ol>
          </IonCardContent>
        </IonCard>

        {/* FAB */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/acta/nueva')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Alerta de logout */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Cerrar Sesión"
          message="¿Está seguro que desea salir?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Salir',
              role: 'confirm',
              handler: handleLogout,
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
      </IonContent>
    </IonPage>
  );
};

export default Home;
