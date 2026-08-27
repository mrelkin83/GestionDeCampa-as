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
  IonBackButton,
  IonButtons,
  IonAlert,
  IonToast,
  IonBadge,
} from '@ionic/react';
import {
  person,
  logOut,
  trash,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import { dbService } from '../services/DatabaseService';

/**
 * Página: Perfil
 * 
 * Muestra información del usuario y opciones de configuración.
 */

const Perfil: React.FC = () => {
  const history = useHistory();
  const { user, logout, isOffline } = useAuthStore();
  const [stats, setStats] = useState({
    actasPendientes: 0,
    actasEnviadas: 0,
    evidencias: 0,
  });
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showClearAlert, setShowClearAlert] = useState(false);
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

  const limpiarDatos = async () => {
    await dbService.limpiarTodo();
    setToastMessage('Todos los datos locales han sido eliminados');
    setShowToast(true);
    cargarEstadisticas();
    setShowClearAlert(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Información del usuario */}
        <IonCard className="mb-4">
          <IonCardContent className="text-center py-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <IonIcon icon={person} className="text-4xl text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.nombre}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="mt-3">
              <IonBadge color={isOffline ? 'warning' : 'success'}>
                {isOffline ? 'Modo Offline' : 'Conectado'}
              </IonBadge>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Estadísticas */}
        <IonCard className="mb-4">
          <IonCardHeader>
            <IonCardTitle>Estadísticas</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.actasPendientes}
                </div>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.actasEnviadas}
                </div>
                <p className="text-sm text-gray-600">Enviadas</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.evidencias}
                </div>
                <p className="text-sm text-gray-600">Evidencias</p>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Opciones */}
        <IonCard className="mb-4">
          <IonCardHeader>
            <IonCardTitle>Configuración</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem button onClick={() => setShowClearAlert(true)}>
              <IonIcon icon={trash} slot="start" color="danger" />
              <IonLabel>
                <h3>Limpiar Datos Locales</h3>
                <p className="text-sm text-gray-600">
                  Eliminar todas las actas y evidencias guardadas
                </p>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Información de la app */}
        <IonCard className="mb-4">
          <IonCardHeader>
            <IonCardTitle>Acerca de</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Versión:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Build:</span>
                <span className="font-medium">2027.01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plataforma:</span>
                <span className="font-medium">
                  {navigator.platform || 'Web'}
                </span>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Botón cerrar sesión */}
        <IonButton
          expand="block"
          color="danger"
          onClick={() => setShowLogoutAlert(true)}
          className="mt-4"
        >
          <IonIcon icon={logOut} slot="start" />
          Cerrar Sesión
        </IonButton>

        {/* Alerta cerrar sesión */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Cerrar Sesión"
          message="¿Está seguro que desea cerrar su sesión?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Cerrar Sesión',
              role: 'confirm',
              handler: handleLogout,
            },
          ]}
        />

        {/* Alerta limpiar datos */}
        <IonAlert
          isOpen={showClearAlert}
          onDidDismiss={() => setShowClearAlert(false)}
          header="Limpiar Datos"
          message="¿Está seguro? Se eliminarán todas las actas y evidencias guardadas localmente. Esta acción no se puede deshacer."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar Todo',
              role: 'destructive',
              handler: limpiarDatos,
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

export default Perfil;
