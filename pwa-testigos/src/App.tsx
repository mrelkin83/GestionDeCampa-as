import { useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { Network } from '@capacitor/network';

/* Core CSS required for Ionic components */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Pages */
import Login from './pages/Login';
import Home from './pages/Home';
import FormularioMultiCargo from './pages/FormularioMultiCargo';
import Evidencias from './pages/Evidencias';
import Pendientes from './pages/Pendientes';
import Perfil from './pages/Perfil';

/* Hooks */
import useAuthStore from './stores/authStore';
import { dbService } from './services/DatabaseService';

setupIonicReact();

function App() {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, setOffline, checkOfflineAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      // Inicializar IndexedDB
      await dbService.init();

      // Verificar estado de red
      const status = await Network.getStatus();
      setOffline(!status.connected);

      // Escuchar cambios de red
      Network.addListener('networkStatusChange', (status) => {
        console.log('🌐 Estado de red cambiado:', status.connected ? 'Online' : 'Offline');
        setOffline(!status.connected);
      });

      // Verificar si hay sesión offline guardada
      await checkOfflineAuth();

      setIsReady(true);
    };

    init();
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />
          <Route exact path="/home" component={Home} />
          {/* FormularioActa (el componente que estaba aquí antes) usaba
              elecciones/cargos/candidatos hardcodeados ('Candidato A',
              'Partido X'...) en vez de useMultiEleccion() -cualquier acta
              real registrada por un testigo habría reportado votos para
              candidatos ficticios. FormularioMultiCargo ya existía,
              completo y correcto, pero nunca estaba enrutado. */}
          <Route exact path="/acta/nueva" component={FormularioMultiCargo} />
          <Route exact path="/acta/:id/evidencias" component={Evidencias} />
          <Route exact path="/pendientes" component={Pendientes} />
          <Route exact path="/perfil" component={Perfil} />
          <Route exact path="/">
            <Redirect to={isAuthenticated ? '/home' : '/login'} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
