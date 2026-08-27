import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Text,
  Chip,
  Divider,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  fetchPendientes,
  sincronizarActa,
  eliminarActa,
} from '../store/slices/actasSlice';
import { DatabaseService } from '../services/DatabaseService';
import { SyncService } from '../services/SyncService';

/**
 * Screen: PendientesScreen
 *
 * Lista de actas pendientes de sincronizar
 * Permite sincronizar individualmente o en lote
 */

const PendientesScreen = () => {
  const dispatch = useDispatch();
  const { actas, loading } = useSelector((state: RootState) => state.actas);
  const [refreshing, setRefreshing] = useState(false);
  const [actaSeleccionada, setActaSeleccionada] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);

  const db = DatabaseService.getInstance();
  const syncService = SyncService.getInstance();

  const cargarActas = useCallback(async () => {
    try {
      const actasPendientes = await db.obtenerActasPendientes();
      dispatch(fetchPendientes(actasPendientes));
    } catch (error) {
      console.error('Error cargando actas:', error);
    }
  }, [db, dispatch]);

  useEffect(() => {
    cargarActas();
  }, [cargarActas]);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarActas();
    setRefreshing(false);
  };

  const sincronizarUna = async (acta: any) => {
    try {
      dispatch(sincronizarActa(acta.localId));

      const result = await syncService.sincronizarActa(acta.localId);

      if (result.actasSincronizadas > 0) {
        Alert.alert('Éxito', 'Acta sincronizada correctamente');
        await cargarActas();
      } else if (result.errores.length > 0) {
        Alert.alert('Error', result.errores[0]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const sincronizarTodas = async () => {
    setSyncingAll(true);
    try {
      const result = await syncService.sincronizarTodo();

      if (result.actasSincronizadas > 0) {
        Alert.alert(
          'Sincronización completada',
          `${result.actasSincronizadas} actas sincronizadas correctamente`,
        );
      } else if (result.errores.length > 0) {
        Alert.alert('Errores', result.errores.join('\n'));
      } else {
        Alert.alert('Info', 'No hay actas para sincronizar');
      }

      await cargarActas();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSyncingAll(false);
    }
  };

  const confirmarEliminar = (acta: any) => {
    setActaSeleccionada(acta);
    setShowDialog(true);
  };

  const eliminarConfirmada = async () => {
    if (!actaSeleccionada) {
      return;
    }

    try {
      await db.eliminarActa(actaSeleccionada.localId);
      dispatch(eliminarActa(actaSeleccionada.localId));
      setShowDialog(false);
      Alert.alert('Éxito', 'Acta eliminada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el acta');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#f59e0b';
      case 'ENVIANDO':
        return '#3b82f6';
      case 'ENVIADO':
        return '#10b981';
      case 'ERROR':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderActa = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Title style={styles.title}>Mesa #{item.mesaId}</Title>
            <Paragraph style={styles.fecha}>
              {new Date(item.creadoEn).toLocaleString('es-CO')}
            </Paragraph>
          </View>
          <Chip
            style={[
              styles.chip,
              { backgroundColor: getEstadoColor(item.estado) + '20' },
            ]}
            textStyle={{ color: getEstadoColor(item.estado) }}
          >
            {item.estado}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Votantes:</Text>
            <Text style={styles.statValue}>{item.votantes}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Boletas:</Text>
            <Text style={styles.statValue}>{item.boletasEntregadas}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Evidencias:</Text>
            <Text style={styles.statValue}>{item.evidencias?.length || 0}</Text>
          </View>
        </View>

        {item.error && <Text style={styles.error}>Error: {item.error}</Text>}

        {item.intentos > 0 && (
          <Text style={styles.intentos}>Intentos: {item.intentos}</Text>
        )}
      </Card.Content>

      <Card.Actions>
        <Button onPress={() => confirmarEliminar(item)} textColor="#ef4444">
          Eliminar
        </Button>
        <Button
          mode="contained"
          onPress={() => sincronizarUna(item)}
          disabled={item.estado === 'ENVIANDO'}
          loading={item.estado === 'ENVIANDO'}
        >
          {item.estado === 'ENVIANDO' ? 'Enviando...' : 'Sincronizar'}
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando actas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Actas Pendientes</Text>
          <Text style={styles.headerSubtitle}>
            {actas.length} actas por sincronizar
          </Text>
        </View>
        {actas.length > 0 && (
          <Button
            mode="contained"
            onPress={sincronizarTodas}
            loading={syncingAll}
            disabled={syncingAll}
            icon="sync"
          >
            Sincronizar Todo
          </Button>
        )}
      </View>

      {/* Lista */}
      {actas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>¡Todo sincronizado!</Text>
          <Text style={styles.emptyText}>No hay actas pendientes de envío</Text>
        </View>
      ) : (
        <FlatList
          data={actas}
          renderItem={renderActa}
          keyExtractor={item => item.localId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Diálogo de confirmación */}
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Eliminar Acta</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              ¿Está seguro que desea eliminar esta acta? Esta acción no se puede
              deshacer.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancelar</Button>
            <Button onPress={eliminarConfirmada} textColor="#ef4444">
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
  },
  fecha: {
    fontSize: 12,
    color: '#6b7280',
  },
  chip: {
    borderRadius: 16,
  },
  divider: {
    marginVertical: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  error: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    fontStyle: 'italic',
  },
  intentos: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default PendientesScreen;
