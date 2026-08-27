import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Text, Card, Button, List, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

/**
 * Screen: PerfilScreen
 *
 * Referenciada desde HomeScreen ("Mi Perfil") pero no existía como archivo,
 * lo que impedía compilar/arrancar la app. Muestra la información real de la
 * sesión activa (Redux) y permite cerrar sesión.
 */

// Definido fuera del componente: no depende de ningún valor de render, así
// que mantiene una referencia estable entre renders.
const PermisosIcon = (props: any) => (
  <List.Icon {...props} icon="shield-check" />
);

const PerfilScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { user, isOffline } = useSelector((state: RootState) => state.auth);

  const renderConexionIcon = useCallback(
    (props: any) => (
      <List.Icon {...props} icon={isOffline ? 'wifi-off' : 'wifi'} />
    ),
    [isOffline],
  );

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user?.nombre?.charAt(0) || 'U'}
          style={styles.avatar}
        />
        <Text style={styles.nombre}>{user?.nombre || 'Testigo Electoral'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="Estado de conexión"
            description={isOffline ? 'Modo offline' : 'Conectado'}
            left={renderConexionIcon}
          />
          <Divider />
          <List.Item
            title="Permisos"
            description={
              (user?.permisos || []).join(', ') || 'Sin permisos asignados'
            }
            left={PermisosIcon}
          />
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
      >
        Cerrar sesión
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  avatar: { backgroundColor: '#2563eb', marginBottom: 12 },
  nombre: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  card: { margin: 16, elevation: 2 },
  logoutButton: { margin: 16, borderColor: '#ef4444' },
});

export default PerfilScreen;
