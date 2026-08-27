import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Title,
  Card,
  Divider,
  Dialog,
  Portal,
  IconButton,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import { RootState } from '../store';
import { addActa } from '../store/slices/actasSlice';
import {
  DatabaseService,
  CandidatoDB,
  ActaDB,
} from '../services/DatabaseService';
import { CatalogoService } from '../services/CatalogoService';

interface VotoForm {
  candidatoId: number;
  votos: string;
}

/**
 * Screen: FormularioActaScreen
 *
 * Formulario nativo para registrar actas de escrutinio
 * Características:
 * - Cámara nativa integrada
 * - Cálculo automático de totales
 * - Validaciones en tiempo real
 * - Guardado offline inmediato
 */

const FormularioActaScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { eleccionActiva, cargos } = useSelector(
    (state: RootState) => state.actas,
  );

  const [mesaId, setMesaId] = useState('');
  const [cargoSeleccionado, setCargoSeleccionado] = useState<number | null>(
    null,
  );
  const [votantes, setVotantes] = useState('');
  const [boletas, setBoletas] = useState('');
  const [votosNulos, setVotosNulos] = useState('');
  const [votos, setVotos] = useState<VotoForm[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCargoDialog, setShowCargoDialog] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const db = DatabaseService.getInstance();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const cargarCandidatos = useCallback(
    async (cargoId: number) => {
      try {
        // Refresca desde el backend si hay red; si falla (offline), sigue con
        // lo que ya haya en SQLite de una sincronización previa.
        try {
          await CatalogoService.sincronizarCandidatos(cargoId);
        } catch (syncError) {
          console.error(
            'No se pudo refrescar candidatos, usando cache local:',
            syncError,
          );
        }

        const candidatosData = await db.getCandidatos(cargoId);
        setVotos(
          candidatosData.map((c: CandidatoDB) => ({
            candidatoId: c.id,
            votos: '',
          })),
        );
        // Agregar votos en blanco
        setVotos(prev => [...prev, { candidatoId: 0, votos: '' }]);
      } catch (error) {
        console.error('Error cargando candidatos:', error);
      }
    },
    [db],
  );

  const seleccionarCargo = (cargoId: number) => {
    setCargoSeleccionado(cargoId);
    setShowCargoDialog(false);
    cargarCandidatos(cargoId);
  };

  const actualizarVotos = (candidatoId: number, valor: string) => {
    setVotos(prev =>
      prev.map(v =>
        v.candidatoId === candidatoId ? { ...v, votos: valor } : v,
      ),
    );
  };

  const calcularTotal = () => {
    return votos.reduce((sum, v) => sum + (parseInt(v.votos, 10) || 0), 0);
  };

  const totalVotos = calcularTotal();
  const numVotantes = parseInt(votantes, 10) || 0;
  const numBoletas = parseInt(boletas, 10) || 0;
  const numVotosNulos = parseInt(votosNulos, 10) || 0;

  const tomarFoto = async () => {
    if (hasPermission === null) {
      Alert.alert('Esperando permisos de cámara');
      return;
    }

    if (hasPermission === false) {
      Alert.alert('No hay acceso a la cámara');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setEvidencias([...evidencias, result.assets[0].base64]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo capturar la foto');
    }
  };

  const eliminarFoto = (index: number) => {
    setEvidencias(evidencias.filter((_, i) => i !== index));
  };

  const validarFormulario = () => {
    const errores = [];

    if (!mesaId) {
      errores.push('Número de mesa requerido');
    }
    if (!cargoSeleccionado) {
      errores.push('Seleccione un cargo');
    }
    if (!votantes || numVotantes <= 0) {
      errores.push('Ingrese número de votantes');
    }
    if (!boletas || numBoletas <= 0) {
      errores.push('Ingrese boletas entregadas');
    }
    if (totalVotos === 0) {
      errores.push('Ingrese al menos un voto');
    }
    if (evidencias.length === 0) {
      errores.push('Adjunte al menos una foto del acta');
    }

    if (totalVotos > numVotantes) {
      errores.push(
        `⚠️ Los votos (${totalVotos}) son mayores que los votantes (${numVotantes})`,
      );
    }

    const diferencia = Math.abs(numBoletas - totalVotos);
    if (diferencia > 5) {
      errores.push(`⚠️ Diferencia de ${diferencia} entre boletas y votos`);
    }

    return errores;
  };

  const guardarActa = async () => {
    const errores = validarFormulario();

    if (errores.length > 0) {
      Alert.alert('Validación', errores.join('\n\n'), [
        { text: 'Corregir', style: 'cancel' },
        {
          text: 'Guardar de todos modos',
          onPress: () => guardarEnBaseDeDatos(),
          style: 'destructive',
        },
      ]);
      return;
    }

    guardarEnBaseDeDatos();
  };

  const guardarEnBaseDeDatos = async () => {
    // Estos campos identifican de forma unívoca el acta (elección/cargo/mesa);
    // sin ellos el registro no se puede sincronizar ni validar, así que no son
    // negociables aunque el usuario elija "Guardar de todos modos".
    if (!eleccionActiva || !cargoSeleccionado || !mesaId) {
      Alert.alert(
        'Error',
        'Falta elección, cargo o número de mesa. No se puede guardar el acta.',
      );
      return;
    }

    setLoading(true);

    try {
      const actaData: ActaDB = {
        localId: `acta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        electionId: eleccionActiva.id,
        cargoId: cargoSeleccionado,
        mesaId: parseInt(mesaId, 10),
        votos: votos
          .filter(v => v.votos !== '')
          .map(v => ({
            candidateId: v.candidatoId,
            votos: parseInt(v.votos, 10) || 0,
          })),
        votantes: numVotantes,
        votosNulos: numVotosNulos,
        boletasEntregadas: numBoletas,
        horaCierre: new Date().toLocaleTimeString('es-CO'),
        observaciones,
        evidencias,
        estado: 'PENDIENTE',
        intentos: 0,
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      await db.guardarActa(actaData);
      dispatch(addActa(actaData));

      Alert.alert('Éxito', 'Acta guardada correctamente', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el acta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargoActual = cargos.find(c => c.id === cargoSeleccionado);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Selección de Cargo */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Seleccionar Cargo</Title>
            <Button
              mode="outlined"
              onPress={() => setShowCargoDialog(true)}
              style={styles.cargoButton}
            >
              {cargoActual ? cargoActual.nombre : 'Seleccionar...'}
            </Button>
          </Card.Content>
        </Card>

        {/* Información de la Mesa */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Información de la Mesa</Title>
            <TextInput
              label="Número de Mesa"
              value={mesaId}
              onChangeText={setMesaId}
              keyboardType="number-pad"
              style={styles.input}
              mode="outlined"
            />
            <View style={styles.rowInputs}>
              <TextInput
                label="Votantes"
                value={votantes}
                onChangeText={setVotantes}
                keyboardType="number-pad"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
              />
              <TextInput
                label="Boletas"
                value={boletas}
                onChangeText={setBoletas}
                keyboardType="number-pad"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
              />
            </View>
            <TextInput
              label="Votos Nulos"
              value={votosNulos}
              onChangeText={setVotosNulos}
              keyboardType="number-pad"
              style={styles.input}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Resultados por Candidato */}
        {votos.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Resultados</Title>
              {votos.map((voto, index) => (
                <View key={voto.candidatoId}>
                  <TextInput
                    label={
                      voto.candidatoId === 0
                        ? 'Votos en Blanco'
                        : `Candidato ${index + 1}`
                    }
                    value={voto.votos}
                    onChangeText={text =>
                      actualizarVotos(voto.candidatoId, text)
                    }
                    keyboardType="number-pad"
                    style={styles.input}
                    mode="outlined"
                  />
                  {index < votos.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))}

              {/* Total */}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Votos:</Text>
                <Text
                  style={[
                    styles.totalNumber,
                    totalVotos !== numVotantes && styles.totalWarning,
                  ]}
                >
                  {totalVotos}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Evidencias Fotográficas */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Evidencias Fotográficas</Title>
            <Text style={styles.evidenciaHint}>
              Tome 2-3 fotos claras del acta
            </Text>

            <View style={styles.evidenciasContainer}>
              {evidencias.map((foto, index) => (
                <View key={index} style={styles.evidenciaItem}>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${foto}` }}
                    style={styles.evidenciaImage}
                  />
                  <IconButton
                    icon="close-circle"
                    size={24}
                    style={styles.deleteButton}
                    onPress={() => eliminarFoto(index)}
                  />
                </View>
              ))}

              {evidencias.length < 5 && (
                <Button
                  mode="outlined"
                  onPress={tomarFoto}
                  style={styles.cameraButton}
                  icon="camera"
                >
                  {evidencias.length === 0 ? 'Tomar Foto' : 'Otra Foto'}
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Observaciones */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Observaciones</Title>
            <TextInput
              label="Observaciones (opcional)"
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              numberOfLines={3}
              style={styles.input}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Botón Guardar */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={guardarActa}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            Guardar Acta
          </Button>
        </View>
      </ScrollView>

      {/* Diálogo de Selección de Cargo */}
      <Portal>
        <Dialog
          visible={showCargoDialog}
          onDismiss={() => setShowCargoDialog(false)}
        >
          <Dialog.Title>Seleccionar Cargo</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.cargoList}>
              {cargos.map(cargo => (
                <Button
                  key={cargo.id}
                  mode="text"
                  onPress={() => seleccionarCargo(cargo.id)}
                  style={styles.cargoItem}
                >
                  {cargo.nombre}
                </Button>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCargoDialog(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  cargoButton: {
    marginTop: 8,
  },
  input: {
    marginTop: 12,
    backgroundColor: '#f9fafb',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  divider: {
    marginVertical: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  totalWarning: {
    color: '#f59e0b',
  },
  evidenciaHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  evidenciasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evidenciaItem: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  evidenciaImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
  },
  cameraButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  buttonContainer: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  saveButton: {
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 12,
  },
  cargoList: {
    maxHeight: 300,
  },
  cargoItem: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
});

export default FormularioActaScreen;
