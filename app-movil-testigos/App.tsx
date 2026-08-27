import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';

import { store } from './src/store';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import FormularioActaScreen from './src/screens/FormularioActaScreen';
import PendientesScreen from './src/screens/PendientesScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import MapaMesasScreen from './src/screens/MapaMesasScreen';

const Stack = createStackNavigator();

/**
 * App Móvil Nativa - Testigos Electorales
 * 
 * App nativa React Native con Expo para Android e iOS
 * Características:
 * - Offline completo con SQLite
 * - Cámara nativa
 * - GPS y mapas
 * - Notificaciones push
 * - Sincronización background
 */

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: { backgroundColor: '#2563eb' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Testigos Electorales' }}
            />
            <Stack.Screen
              name="FormularioActa"
              component={FormularioActaScreen}
              options={{ title: 'Registrar Acta' }}
            />
            <Stack.Screen
              name="Pendientes"
              component={PendientesScreen}
              options={{ title: 'Actas Pendientes' }}
            />
            <Stack.Screen
              name="Perfil"
              component={PerfilScreen}
              options={{ title: 'Mi Perfil' }}
            />
            <Stack.Screen
              name="MapaMesas"
              component={MapaMesasScreen}
              options={{ title: 'Mapa de Mesas' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}
