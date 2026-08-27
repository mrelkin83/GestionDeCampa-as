import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Icon } from 'react-native-paper';

/**
 * Screen: MapaMesasScreen
 *
 * Referenciada desde HomeScreen ("Mapa de Mesas") pero no existía como
 * archivo, lo que impedía compilar/arrancar la app. Esta pantalla NO
 * implementa la funcionalidad real de mapa (requiere integrar
 * react-native-maps + un endpoint de "puestos cercanos" del backend, que es
 * trabajo de producto/UX pendiente de definir) — es un placeholder honesto
 * para que la navegación no rompa, no una simulación de la función terminada.
 */
const MapaMesasScreen = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Icon source="map-marker-off" size={48} />
          <Text style={styles.title}>Mapa de mesas</Text>
          <Text style={styles.subtitle}>
            Esta función todavía no está implementada. Pendiente: integrar
            react-native-maps con el endpoint de puestos de votación cercanos.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 16,
  },
  card: { elevation: 2 },
  content: { alignItems: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 12, color: '#1f2937' },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MapaMesasScreen;
