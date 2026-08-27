import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { camera } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';

/**
 * Página: Evidencias
 * 
 * Muestra y permite gestionar las evidencias fotográficas de un acta.
 * 
 * Nota: Esta es una versión simplificada. La funcionalidad completa
 * está integrada en el formulario de acta.
 */

const Evidencias: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Evidencias - Acta {id}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="text-center py-12">
          <IonIcon icon={camera} className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Gestión de Evidencias
          </h2>
          <p className="text-gray-600 mb-6">
            Esta funcionalidad está integrada en el formulario de registro de actas.
          </p>
          <IonButton onClick={() => history.push('/acta/nueva')}>
            Ir a Registrar Acta
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Evidencias;
