import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Banner,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';

import { loginUser, clearError } from '../store/slices/authSlice';
import { RootState } from '../store';

/**
 * Screen: LoginScreen
 *
 * Pantalla de login con soporte nativo para Android/iOS
 * Características:
 * - Detecta estado de red automáticamente
 * - Soporta login offline
 * - Diseño nativo con React Native Paper
 */

const LoginScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Monitorear estado de red
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 3000);
    }
  }, [error, dispatch]);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    dispatch(loginUser({ email, password }) as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🗳️</Text>
          </View>
          <Text style={styles.title}>Testigos Electorales</Text>
          <Text style={styles.subtitle}>Sistema de Preconteo</Text>
        </View>

        {/* Estado de red */}
        {networkStatus === false && (
          <Banner visible={true} icon="wifi-off" actions={[]}>
            Modo offline activado. Puede iniciar sesión si ya ha ingresado
            anteriormente.
          </Banner>
        )}

        {/* Formulario */}
        <View style={styles.form}>
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            disabled={loading}
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureText ? 'eye-off' : 'eye'}
                onPress={() => setSecureText(!secureText)}
              />
            }
            disabled={loading}
          />

          {error && (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading || !email || !password}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <Text style={styles.hint}>
            Primera vez requiere conexión a internet
          </Text>
        </View>

        {/* Versión */}
        <Text style={styles.version}>Versión 1.0.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  hint: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 12,
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 24,
  },
});

export default LoginScreen;
