import { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonLoading,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { mail, lockClosed, eye, eyeOff, wifi, cloudOffline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

/**
 * Página: Login
 * 
 * Pantalla de autenticación para testigos electorales.
 * Soporta login online y offline.
 */

const Login: React.FC = () => {
  const history = useHistory();
  const { login, isLoading, error, isOffline, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    const success = await login(email, password);

    if (success) {
      history.replace('/home');
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonTitle className="text-center">Testigos Electorales</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding bg-gray-50">
        <div className="max-w-md mx-auto mt-8">
          {/* Estado de conexión */}
          <div
            className={`flex items-center justify-center mb-6 px-4 py-2 rounded-full text-sm font-medium ${
              isOffline
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            <IonIcon icon={isOffline ? cloudOffline : wifi} className="mr-2" />
            {isOffline ? 'Modo Offline' : 'Conectado'}
          </div>

          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sistema de Preconteo
            </h1>
            <p className="text-gray-600">Ingrese sus credenciales para continuar</p>
          </div>

          {/* Formulario */}
          <IonCard className="shadow-lg">
            <IonCardHeader>
              <IonCardTitle className="text-center text-lg">Iniciar Sesión</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleLogin}>
                {/* Email */}
                <IonItem className="mb-4 rounded-lg">
                  <IonIcon icon={mail} slot="start" color="medium" />
                  <IonLabel position="floating">Correo electrónico</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={(e) => setEmail(e.detail.value || '')}
                    required
                    autocomplete="email"
                  />
                </IonItem>

                {/* Password */}
                <IonItem className="mb-6 rounded-lg">
                  <IonIcon icon={lockClosed} slot="start" color="medium" />
                  <IonLabel position="floating">Contraseña</IonLabel>
                  <IonInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value || '')}
                    required
                    autocomplete="current-password"
                  />
                  <IonIcon
                    icon={showPassword ? eyeOff : eye}
                    slot="end"
                    color="medium"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer"
                  />
                </IonItem>

                {/* Error */}
                {error && (
                  <IonText color="danger" className="block mb-4 text-center">
                    <p className="text-sm">{error}</p>
                  </IonText>
                )}

                {/* Botón */}
                <IonButton
                  expand="block"
                  type="submit"
                  disabled={isLoading}
                  className="mb-4"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </IonButton>
              </form>

              {/* Info modo offline */}
              {isOffline && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <IonText color="warning" className="text-sm">
                    <p className="text-center">
                      <strong>Modo Offline activo</strong>
                      <br />
                      Puede iniciar sesión si ya ha ingresado anteriormente con conexión.
                    </p>
                  </IonText>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Instrucciones */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-2">
              <strong>Primera vez?</strong> Conéctese a internet para activar el modo offline.
            </p>
            <p>
              Versión 1.0.0 • Elecciones 2027
            </p>
          </div>
        </div>

        {/* Loading */}
        <IonLoading isOpen={isLoading} message="Autenticando..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;
