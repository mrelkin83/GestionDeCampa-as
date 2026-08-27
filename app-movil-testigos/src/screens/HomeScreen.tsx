import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  FAB,
  Avatar,
  Badge,
  Divider,
  List,
  IconButton,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import {
  fetchPendientesCountAsync,
  setEleccionActiva,
  setCargos,
} from '../store/slices/actasSlice';
import { CatalogoService } from '../services/CatalogoService';
import { DatabaseService } from '../services/DatabaseService';

/**
 * Screen: HomeScreen
 *
 * Dashboard principal de la app nativa
 * Muestra estadísticas y accesos rápidos
 */

// Render-props de List.Item definidos fuera del componente: no dependen de
// ningún valor de render, así que una referencia estable evita que React
// desmonte/remonte el ícono en cada render (a diferencia de definirlos
// inline, que crea una función -y por tanto un tipo de componente- nueva
// cada vez).
const RegistrarActaIcon = (props: any) => (
  <List.Icon {...props} icon="file-document-edit" color="#2563eb" />
);
const PendientesIcon = (props: any) => (
  <List.Icon {...props} icon="sync" color="#f59e0b" />
);
const MapaMesasIcon = (props: any) => (
  <List.Icon {...props} icon="map-marker" color="#10b981" />
);
const PerfilIcon = (props: any) => (
  <List.Icon {...props} icon="account" color="#8b5cf6" />
);
const ChevronRightIcon = (props: any) => (
  <List.Icon {...props} icon="chevron-right" />
);

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { user, isOffline } = useSelector((state: RootState) => state.auth);
  const { pendientesCount } = useSelector((state: RootState) => state.actas);
  const [enviadasHoy, setEnviadasHoy] = useState(0);

  const cargarEnviadasHoy = useCallback(() => {
    DatabaseService.getInstance()
      .contarEnviadasHoy()
      .then(setEnviadasHoy)
      .catch(err => console.error('Error contando actas enviadas hoy:', err));
  }, []);

  useEffect(() => {
    dispatch(fetchPendientesCountAsync() as any);
    cargarEnviadasHoy();

    // Descarga en segundo plano el catálogo (elecciones/cargos/candidatos).
    // Antes, eleccionActiva/cargos en el store SIEMPRE quedaban vacíos: los
    // reducers setEleccionActiva/setCargos existían pero nada los invocaba,
    // así que el selector de cargo en el formulario de acta jamás tenía
    // datos. No bloquea el dashboard: si falla (sin red), se reintenta al
    // recargar.
    (async () => {
      try {
        const elecciones = await CatalogoService.obtenerElecciones();
        const activa = elecciones[0];
        if (!activa) {
          return;
        }

        dispatch(setEleccionActiva(activa));

        const cargos = await CatalogoService.obtenerCargos(activa.id);
        dispatch(setCargos(cargos.map(c => ({ ...c, electionId: activa.id }))));

        for (const cargo of cargos) {
          await CatalogoService.sincronizarCandidatos(cargo.id).catch(err =>
            console.error(
              `Error sincronizando candidatos del cargo ${cargo.id}:`,
              err,
            ),
          );
        }
      } catch (err) {
        console.error('Error sincronizando catálogo:', err);
      }
    })();
  }, [dispatch, cargarEnviadasHoy]);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
  };

  const renderPendientesBadge = useCallback(
    () =>
      pendientesCount > 0 ? <Badge size={24}>{pendientesCount}</Badge> : null,
    [pendientesCount],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              dispatch(fetchPendientesCountAsync() as any);
              cargarEnviadasHoy();
            }}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={60}
              label={user?.nombre?.charAt(0) || 'U'}
              style={styles.avatar}
            />
            <View style={styles.userText}>
              <Text style={styles.greeting}>
                ¡Hola, {user?.nombre?.split(' ')[0]}!
              </Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOffline ? '#f59e0b' : '#10b981' },
                  ]}
                />
                <Text style={styles.statusText}>
                  {isOffline ? 'Modo Offline' : 'Conectado'}
                </Text>
              </View>
            </View>
          </View>
          <IconButton icon="logout" onPress={handleLogout} />
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>{pendientesCount}</Text>
              <Text style={styles.statLabel}>Actas Pendientes</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>{enviadasHoy}</Text>
              <Text style={styles.statLabel}>Enviadas Hoy</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Acciones principales */}
        <Card style={styles.actionsCard}>
          <Card.Title title="Acciones Rápidas" />
          <Card.Content>
            <List.Item
              title="Registrar Acta"
              description="Digitar resultados de una mesa"
              left={RegistrarActaIcon}
              right={ChevronRightIcon}
              onPress={() => navigation.navigate('FormularioActa')}
            />
            <Divider />
            <List.Item
              title="Actas Pendientes"
              description={`${pendientesCount} actas por sincronizar`}
              left={PendientesIcon}
              right={renderPendientesBadge}
              onPress={() => navigation.navigate('Pendientes')}
            />
            <Divider />
            <List.Item
              title="Mapa de Mesas"
              description="Ver ubicación de mesas cercanas"
              left={MapaMesasIcon}
              right={ChevronRightIcon}
              onPress={() => navigation.navigate('MapaMesas')}
            />
            <Divider />
            <List.Item
              title="Mi Perfil"
              description="Configuración y estadísticas"
              left={PerfilIcon}
              right={ChevronRightIcon}
              onPress={() => navigation.navigate('Perfil')}
            />
          </Card.Content>
        </Card>

        {/* Instrucciones */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
            <Text style={styles.infoText}>
              1. Registre el acta de su mesa{'\n'}
              2. Tome fotos como evidencia{'\n'}
              3. Los datos se guardan en el teléfono{'\n'}
              4. Se sincronizan automáticamente con internet
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Nueva Acta"
        onPress={() => navigation.navigate('FormularioActa')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2563eb',
  },
  userText: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 80,
    backgroundColor: '#eff6ff',
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
  },
});

export default HomeScreen;
